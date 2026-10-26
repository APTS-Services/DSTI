// src/services/searchService.js — site search and autocomplete.
const repository = require('../repositories/searchRepository');
const { normaliseLang, pick } = require('../utils/bilingual');
const { cleanString } = require('../utils/validate');
const ApiError = require('../utils/ApiError');

async function search(query) {
  const term = cleanString(query.q, 120);
  if (!term) return { hits: [], total: 0 };
  const lang = normaliseLang(query.lang);
  const types = String(query.type || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const hits = await repository.search(term, lang, types);
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10));
  return {
    hits: hits.slice((page - 1) * limit, page * limit),
    total: hits.length,
    meta: { page, limit, total: hits.length, pages: Math.max(1, Math.ceil(hits.length / limit)) }
  };
}

async function suggest(query) {
  const term = cleanString(query.q, 80);
  if (!term) return [];
  return repository.suggest(term, normaliseLang(query.lang));
}

/**
 * Site search only. "Ask Vigyan Mitra" lives in assistantService, which composes
 * structured answers from the same published records.
 */
async function assistantFeedback({ log_id, logId, helpful, comment }) {
  const id = Number(log_id || logId);
  if (!Number.isFinite(id)) throw new ApiError(400, 'log_id is required.');
  if (typeof helpful !== 'boolean') throw new ApiError(400, 'helpful must be true or false.');
  await repository.logFeedback(id, helpful, comment);
  return { ok: true };
}

async function logs(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 50));
  const { rows, total } = await repository.assistantLogs({ answered: query.answered, page, limit });
  return {
    rows: rows.map((row) => ({
      id: row.log_id,
      question: row.question,
      answer: row.answer,
      source_url: row.source_url,
      lang: row.lang,
      answered: Boolean(row.was_answered),
      helpful: row.helpful === null ? null : Boolean(row.helpful),
      created_at: row.created_at
    })),
    meta: { page, limit, total: Number(total) || 0, pages: Math.max(1, Math.ceil((Number(total) || 0) / limit)) }
  };
}

module.exports = { search, suggest, assistantFeedback, logs, pick };
