// src/repositories/searchRepository.js — site-wide search over published content.
const { q, one } = require('../config/db');
const { pick } = require('../utils/bilingual');

const like = (term) => `%${term.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

/**
 * Returns search hits across the main content types.
 * Each hit: { type, title, url, snippet }
 */
async function search(term, lang = 'en', types = null) {
  const pattern = like(term);
  const wants = (type) => !types || !types.length || types.includes(type);
  const hits = [];

  if (wants('page')) {
    const rows = await q(
      `SELECT slug, section, title_en, title_te, body_en, body_te FROM pages
       WHERE status = 'published' AND (title_en LIKE ? OR title_te LIKE ? OR body_en LIKE ? OR slug LIKE ?) LIMIT 20`,
      [pattern, pattern, pattern, pattern]
    );
    for (const row of rows) {
      hits.push({
        type: 'page',
        title: pick(row.title_en, row.title_te, lang),
        url: row.section === 'statutory' ? `/${row.slug}` : `/about/${row.slug}`,
        snippet: String(pick(row.body_en, row.body_te, lang) || '').replace(/<[^>]*>/g, ' ').slice(0, 180)
      });
    }
  }

  if (wants('policy')) {
    const rows = await q(
      `SELECT slug, name_en, name_te, summary_en, summary_te FROM policies
       WHERE status = 'published' AND (name_en LIKE ? OR name_te LIKE ? OR summary_en LIKE ? OR body_en LIKE ?) LIMIT 20`,
      [pattern, pattern, pattern, pattern]
    );
    for (const row of rows) {
      hits.push({
        type: 'policy',
        title: pick(row.name_en, row.name_te, lang),
        url: `/policies/${row.slug}`,
        snippet: String(pick(row.summary_en, row.summary_te, lang) || '').slice(0, 180)
      });
    }
  }

  if (wants('document')) {
    const rows = await q(
      `SELECT d.doc_id, d.title_en, d.title_te, d.doc_number, d.doc_date, c.slug AS category
       FROM documents d JOIN document_categories c ON c.category_id = d.category_id
       WHERE d.status = 'published' AND (d.title_en LIKE ? OR d.title_te LIKE ? OR d.doc_number LIKE ? OR d.description_en LIKE ?)
       LIMIT 20`,
      [pattern, pattern, pattern, pattern]
    );
    for (const row of rows) {
      hits.push({
        type: 'document',
        title: pick(row.title_en, row.title_te, lang),
        url: `/ecitizen/documents?doc=${row.doc_id}`,
        snippet: `${row.doc_number || ''} ${row.doc_date || ''}`.trim()
      });
    }
  }

  if (wants('tender')) {
    const rows = await q(
      `SELECT tender_id, tender_number, title_en, title_te, status, published_date FROM tenders
       WHERE publish_status = 'published' AND (title_en LIKE ? OR title_te LIKE ? OR tender_number LIKE ? OR description_en LIKE ?)
       LIMIT 20`,
      [pattern, pattern, pattern, pattern]
    );
    for (const row of rows) {
      hits.push({
        type: 'tender',
        title: pick(row.title_en, row.title_te, lang),
        url: '/tenders',
        snippet: `${row.tender_number} · ${row.status} · ${row.published_date}`
      });
    }
  }

  if (wants('event')) {
    const rows = await q(
      `SELECT slug, title_en, title_te, start_datetime FROM events
       WHERE status = 'published' AND (title_en LIKE ? OR title_te LIKE ? OR description_en LIKE ?) LIMIT 20`,
      [pattern, pattern, pattern]
    );
    for (const row of rows) {
      hits.push({
        type: 'event',
        title: pick(row.title_en, row.title_te, lang),
        url: `/media/events/${row.slug}`,
        snippet: String(row.start_datetime || '').slice(0, 10)
      });
    }
  }

  if (wants('organisation')) {
    const rows = await q(
      `SELECT slug, name_en, name_te, short_name FROM organisations
       WHERE status = 'published' AND (name_en LIKE ? OR name_te LIKE ? OR short_name LIKE ? OR about_en LIKE ?) LIMIT 20`,
      [pattern, pattern, pattern, pattern]
    );
    for (const row of rows) {
      hits.push({
        type: 'organisation',
        title: pick(row.name_en, row.name_te, lang),
        url: `/organisations/${row.slug}`,
        snippet: row.short_name || ''
      });
    }
  }

  return hits;
}

/** Small autocomplete list. */
async function suggest(term, lang = 'en', limit = 8) {
  const pattern = like(term);
  const rows = await q(
    `SELECT title_en, title_te, slug FROM pages WHERE status = 'published' AND (title_en LIKE ? OR title_te LIKE ?) LIMIT ?
     `,
    [pattern, pattern, limit]
  );
  const policies = await q(
    `SELECT name_en, name_te, slug FROM policies WHERE status = 'published' AND (name_en LIKE ? OR name_te LIKE ?) LIMIT ?`,
    [pattern, pattern, limit]
  );
  const documents = await q(
    `SELECT title_en, title_te FROM documents WHERE status = 'published' AND (title_en LIKE ? OR title_te LIKE ?) LIMIT ?`,
    [pattern, pattern, limit]
  );
  return [
    ...rows.map((r) => ({ label: pick(r.title_en, r.title_te, lang), url: `/about/${r.slug}`, type: 'page' })),
    ...policies.map((r) => ({ label: pick(r.name_en, r.name_te, lang), url: `/policies/${r.slug}`, type: 'policy' })),
    ...documents.map((r) => ({ label: pick(r.title_en, r.title_te, lang), url: '/ecitizen/documents', type: 'document' }))
  ].slice(0, limit);
}

/** Assistant search: broader, grouped content used to compose an answer. */
async function assistantSources(term, lang = 'en') {
  const pattern = like(term);
  const [pages, policies, documents, tenders, faqs, orgs, districts] = await Promise.all([
    q(
      `SELECT slug, section, title_en, title_te, body_en, body_te FROM pages
       WHERE status = 'published' AND (title_en LIKE ? OR body_en LIKE ? OR title_te LIKE ?) LIMIT 5`,
      [pattern, pattern, pattern]
    ),
    q(
      `SELECT slug, name_en, name_te, summary_en, summary_te FROM policies
       WHERE status = 'published' AND (name_en LIKE ? OR summary_en LIKE ? OR body_en LIKE ?) LIMIT 5`,
      [pattern, pattern, pattern]
    ),
    q(
      `SELECT d.doc_id, d.title_en, d.title_te, d.doc_number, d.doc_date, c.slug AS category
       FROM documents d JOIN document_categories c ON c.category_id = d.category_id
       WHERE d.status = 'published' AND (d.title_en LIKE ? OR d.description_en LIKE ? OR d.doc_number LIKE ?) LIMIT 5`,
      [pattern, pattern, pattern]
    ),
    q(
      `SELECT tender_id, tender_number, title_en, title_te, status, last_date FROM tenders
       WHERE publish_status = 'published' AND (title_en LIKE ? OR tender_number LIKE ?) LIMIT 5`,
      [pattern, pattern, pattern]
    ),
    q(
      `SELECT question_en, question_te, answer_en, answer_te FROM faqs
       WHERE status = 'published' AND (question_en LIKE ? OR answer_en LIKE ?) LIMIT 5`,
      [pattern, pattern, pattern]
    ),
    q(
      `SELECT slug, name_en, name_te, short_name, about_en, about_te FROM organisations
       WHERE status = 'published' AND (name_en LIKE ? OR short_name LIKE ?) LIMIT 5`,
      [pattern, pattern, pattern]
    ),
    q(
      `SELECT slug, name_en, name_te FROM districts WHERE name_en LIKE ? LIMIT 5`,
      [pattern]
    )
  ]);
  return { pages, policies, documents, tenders, faqs, orgs, districts };
}

async function logAssistant({ question, answer, sourceUrl, lang, answered }) {
  const result = await q(
    'INSERT INTO assistant_logs (question, answer, source_url, lang, was_answered) VALUES (?, ?, ?, ?, ?)',
    [String(question).slice(0, 1000), answer, sourceUrl || null, lang === 'te' ? 'te' : 'en', answered ? 1 : 0]
  );
  return result.insertId;
}

async function logFeedback(logId, helpful, comment = '') {
  await q(
    `INSERT INTO assistant_feedback (log_id, helpful, comment) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE helpful = VALUES(helpful), comment = VALUES(comment)`,
    [logId, helpful ? 1 : 0, String(comment || '').slice(0, 500)]
  );
}

async function assistantLogs({ answered, page = 1, limit = 50 }) {
  const where = [];
  const params = [];
  if (answered === 'false' || answered === false) {
    where.push('was_answered = 0');
  } else if (answered === 'true' || answered === true) {
    where.push('was_answered = 1');
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [{ total }] = await q(`SELECT COUNT(*) AS total FROM assistant_logs ${clause}`, params);
  const rows = await q(
    `SELECT l.log_id, l.question, l.answer, l.source_url, l.lang, l.was_answered, l.created_at,
            f.helpful, f.comment
     FROM assistant_logs l LEFT JOIN assistant_feedback f ON f.log_id = l.log_id
     ${clause} ORDER BY l.log_id DESC LIMIT ? OFFSET ?`,
    [...params, limit, (page - 1) * limit]
  );
  return { rows, total };
}

async function latestLog(question) {
  return one('SELECT log_id FROM assistant_logs WHERE question = ? ORDER BY log_id DESC LIMIT 1', [String(question).slice(0, 1000)]);
}

module.exports = { search, suggest, assistantSources, logAssistant, logFeedback, assistantLogs, latestLog };
