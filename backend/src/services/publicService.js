// src/services/publicService.js — every unauthenticated /api/v1 read.
const config = require('../config');
const { q, one } = require('../config/db');
const { getResource } = require('../content/resources');
const baseRepository = require('../repositories/baseRepository');
const analyticsService = require('./analyticsService');
const { resolveRows, resolveRow, normaliseLang, pick } = require('../utils/bilingual');
const { pagePath } = require('../content/pagePaths');
const { pageParams, meta, likeTerm } = require('../utils/http');
const ApiError = require('../utils/ApiError');

const nowSql = 'UTC_TIMESTAMP()';

function listMeta(page, limit, total) {
  return meta(page, limit, total);
}

async function listResource(key, query) {
  const resource = getResource(key);
  if (!resource) throw new ApiError(404, 'Unknown resource.');
  const lang = normaliseLang(query.lang);
  const { page, limit, offset } = pageParams(query);
  const filters = {};
  for (const filter of ['section', 'category', 'status']) {
    if (query[filter]) filters[filter] = query[filter];
  }
  const result = await baseRepository.listPublic(key, {
    filters,
    search: query.q,
    sort: query.sort,
    order: query.order || 'desc',
    page,
    limit
  });
  return {
    data: resolveRows(result.rows, resource.bi, lang),
    meta: listMeta(page, limit, result.total)
  };
}

async function getPage(slug, lang) {
  const row = await one("SELECT * FROM pages WHERE slug = ? AND status = 'published'", [slug]);
  if (!row) throw new ApiError(404, 'Page not found.');
  return resolveRow(row, getResource('pages').bi, lang);
}

async function listPages(query) {
  const resource = getResource('pages');
  const lang = normaliseLang(query.lang);
  const { page, limit } = pageParams(query);
  const result = await baseRepository.listPublic('pages', {
    filters: { section: query.section },
    search: query.q,
    sort: query.sort || 'display_order',
    order: query.order || 'asc',
    page,
    limit
  });
  return { data: resolveRows(result.rows, resource.bi, lang), meta: listMeta(page, limit, result.total) };
}

async function footerPages(lang) {
  const rows = await q(
    "SELECT * FROM pages WHERE show_in_footer = 1 AND status = 'published' ORDER BY display_order, page_id"
  );
  return resolveRows(rows, getResource('pages').bi, lang);
}

async function home(lang) {
  const [banners, news, audiences, quickLinks, storyPanels, almanac, social, upcoming] = await Promise.all([
    q('SELECT * FROM banners WHERE is_active = 1 ORDER BY display_order, banner_id LIMIT 8'),
    q(
      `SELECT * FROM news_updates WHERE status = 'published' AND publish_date <= UTC_DATE()
       AND (expiry_date IS NULL OR expiry_date >= UTC_DATE()) ORDER BY publish_date DESC LIMIT 6`
    ),
    q('SELECT * FROM audience_cards ORDER BY display_order, card_id'),
    q("SELECT * FROM quick_links WHERE is_active = 1 AND link_group = 'home_quick' ORDER BY display_order, link_id LIMIT 12"),
    q('SELECT * FROM story_panels WHERE is_active = 1 ORDER BY display_order, panel_id LIMIT 12'),
    q(
      `SELECT * FROM almanac_entries WHERE month_no = MONTH(UTC_DATE()) AND day_no = DAY(UTC_DATE())
       ORDER BY entry_type, entry_id LIMIT 10`
    ),
    q('SELECT * FROM social_links WHERE is_active = 1 ORDER BY display_order, social_id'),
    q(
      `SELECT * FROM events WHERE status = 'published' AND start_datetime >= ${nowSql}
       ORDER BY start_datetime LIMIT 3`
    )
  ]);
  return {
    banners: resolveRows(banners, { title: ['title_en', 'title_te'], message: ['message_en', 'message_te'] }, lang),
    news: resolveRows(news, { title: ['title_en', 'title_te'] }, lang),
    audienceCards: resolveRows(audiences, { title: ['title_en', 'title_te'], description: ['description_en', 'description_te'] }, lang),
    quickLinks: resolveRows(quickLinks, { label: ['label_en', 'label_te'] }, lang),
    storyPanels: resolveRows(storyPanels, { title: ['title_en', 'title_te'], text: ['text_en', 'text_te'] }, lang),
    almanac: resolveRows(almanac, { title: ['title_en', 'title_te'], description: ['description_en', 'description_te'] }, lang),
    socialLinks: social,
    upcomingEvents: resolveRows(upcoming, getResource('events').bi, lang)
  };
}

async function news(query) {
  const lang = normaliseLang(query.lang);
  const { page, limit } = pageParams(query);
  const parts = [
    "status = 'published'",
    'publish_date <= UTC_DATE()',
    '(expiry_date IS NULL OR expiry_date >= UTC_DATE())'
  ];
  const params = [];
  if (String(query.ticker) === 'true') parts.push('is_ticker = 1');
  const where = `WHERE ${parts.join(' AND ')}`;
  const [{ total }] = await q(`SELECT COUNT(*) AS total FROM news_updates ${where}`, params);
  const rows = await q(
    `SELECT * FROM news_updates ${where} ORDER BY publish_date DESC, news_id DESC LIMIT ? OFFSET ?`,
    [...params, limit, (page - 1) * limit]
  );
  return { data: resolveRows(rows, getResource('news').bi, lang), meta: listMeta(page, limit, total) };
}

async function almanac(query) {
  const lang = normaliseLang(query.lang);
  const parts = [];
  const params = [];
  if (query.date && /^\d{4}-\d{2}-\d{2}$/.test(query.date)) {
    const [, month, day] = query.date.split('-').map(Number);
    parts.push('month_no = ?', 'day_no = ?');
    params.push(month, day);
  } else if (query.month) {
    const month = Number(query.month);
    if (month >= 1 && month <= 12) {
      parts.push('month_no = ?');
      params.push(month);
    }
  } else {
    parts.push('month_no = MONTH(UTC_DATE())', 'day_no = DAY(UTC_DATE())');
  }
  if (query.type) {
    parts.push('entry_type = ?');
    params.push(query.type);
  }
  const where = parts.length ? `WHERE ${parts.join(' AND ')}` : '';
  const rows = await q(`SELECT * FROM almanac_entries ${where} ORDER BY entry_type, title_en LIMIT 100`, params);
  return resolveRows(rows, getResource('almanac').bi, lang);
}

async function awardsList(query) {
  const lang = normaliseLang(query.lang);
  const parts = ["status = 'published'"];
  const params = [];
  if (query.year) {
    parts.push('award_year = ?');
    params.push(Number(query.year));
  }
  const rows = await q(
    `SELECT * FROM awards WHERE ${parts.join(' AND ')} ORDER BY award_year DESC, award_id`,
    params
  );
  return resolveRows(rows, getResource('awards').bi, lang);
}

async function awardYears() {
  const rows = await q("SELECT DISTINCT award_year FROM awards WHERE status = 'published' ORDER BY award_year DESC");
  return rows.map((row) => Number(row.award_year));
}

async function awardsByYear(year, lang) {
  const rows = await q('SELECT * FROM awards WHERE award_year = ? AND status = ? ORDER BY award_id', [year, 'published']);
  if (!rows.length) throw new ApiError(404, 'No awards for this year.');
  return { year: Number(year), awards: resolveRows(rows, getResource('awards').bi, lang) };
}

async function organisations(query) {
  const lang = normaliseLang(query.lang);
  return listResource('organisations', { ...query, lang });
}

async function organisation(slug, lang) {
  const row = await one("SELECT * FROM organisations WHERE slug = ? AND status = 'published'", [slug]);
  if (!row) throw new ApiError(404, 'Organisation not found.');
  const [policies, institutions] = await Promise.all([
    q(
      `SELECT p.policy_id, p.slug, p.name_en, p.name_te
       FROM entity_links l JOIN policies p ON p.policy_id = l.to_id
       WHERE l.from_type = 'organisation' AND l.from_id = ? AND l.to_type = 'policy' AND p.status = 'published'
       ORDER BY p.display_order LIMIT 10`,
      [row.org_id]
    ),
    q(
      `SELECT di.inst_id, di.name_en, di.name_te, di.category, d.slug AS district_slug
       FROM district_institutions di JOIN districts d ON d.district_id = di.district_id
       WHERE di.org_id = ? AND di.status = 'published' LIMIT 20`,
      [row.org_id]
    )
  ]);
  return {
    ...resolveRow(row, getResource('organisations').bi, lang),
    institutions,
    relatedPolicies: resolveRows(policies, getResource('policies').bi, lang)
  };
}

async function policies(query) {
  return listResource('policies', query);
}

async function policy(slug, lang) {
  const row = await one("SELECT * FROM policies WHERE slug = ? AND status = 'published'", [slug]);
  if (!row) throw new ApiError(404, 'Policy not found.');
  return resolveRow(row, getResource('policies').bi, lang);
}

async function districts(lang) {
  const rows = await q(
    `SELECT d.*,
       (SELECT COUNT(*) FROM district_institutions di WHERE di.district_id = d.district_id AND di.status = 'published') AS institutions
     FROM districts d ORDER BY d.name_en`
  );
  return resolveRows(rows, getResource('districts').bi, lang);
}

async function district(slug, lang) {
  const row = await one('SELECT * FROM districts WHERE slug = ?', [slug]);
  if (!row) throw new ApiError(404, 'District not found.');
  const institutions = await q(
    `SELECT di.*, s.name_en AS sector_en, s.name_te AS sector_te
     FROM district_institutions di LEFT JOIN sectors s ON s.sector_id = di.sector_id
     WHERE di.district_id = ? AND di.status = 'published' ORDER BY di.name_en`,
    [row.district_id]
  );
  return {
    ...resolveRow(row, getResource('districts').bi, lang),
    institutions: resolveRows(institutions, getResource('district-institutions').bi, lang)
  };
}

async function districtInstitutions(query) {
  const lang = normaliseLang(query.lang);
  const { page, limit } = pageParams(query);
  const parts = ["di.status = 'published'"];
  const params = [];
  if (query.district) {
    parts.push('d.slug = ?');
    params.push(query.district);
  }
  if (query.category) {
    parts.push('di.category = ?');
    params.push(query.category);
  }
  if (query.sector) {
    parts.push('s.slug = ?');
    params.push(query.sector);
  }
  if (query.q) {
    parts.push('(di.name_en LIKE ? OR di.name_te LIKE ? OR di.description_en LIKE ?)');
    const term = `%${likeTerm(query.q)}%`;
    params.push(term, term, term);
  }
  const where = `WHERE ${parts.join(' AND ')}`;
  const from = 'FROM district_institutions di JOIN districts d ON d.district_id = di.district_id LEFT JOIN sectors s ON s.sector_id = di.sector_id';
  const [{ total }] = await q(`SELECT COUNT(*) AS total ${from} ${where}`, params);
  const rows = await q(
    `SELECT di.*, d.slug AS district_slug, d.name_en AS district_en, d.name_te AS district_te, s.slug AS sector_slug
     ${from} ${where} ORDER BY d.name_en, di.name_en LIMIT ? OFFSET ?`,
    [...params, limit, (page - 1) * limit]
  );
  return { data: resolveRows(rows, getResource('district-institutions').bi, lang), meta: listMeta(page, limit, total) };
}

async function districtInstitution(id, lang) {
  const row = await one(
    `SELECT di.*, d.slug AS district_slug, d.name_en AS district_en, s.slug AS sector_slug
     FROM district_institutions di JOIN districts d ON d.district_id = di.district_id
     LEFT JOIN sectors s ON s.sector_id = di.sector_id
     WHERE di.inst_id = ? AND di.status = 'published'`,
    [id]
  );
  if (!row) throw new ApiError(404, 'Institution not found.');
  return resolveRow(row, getResource('district-institutions').bi, lang);
}

async function districtMap() {
  const rows = await q(
    `SELECT d.district_id, d.slug, d.name_en, d.name_te, d.map_code, d.latitude, d.longitude,
       (SELECT COUNT(*) FROM district_institutions di WHERE di.district_id = d.district_id AND di.status = 'published') AS institutions
     FROM districts d ORDER BY d.name_en`
  );
  return rows.map((row) => ({ ...row, institutions: Number(row.institutions || 0) }));
}

async function connections(lang) {
  const [orgs, policies, sectors, links] = await Promise.all([
    q("SELECT org_id, slug, name_en, name_te, short_name FROM organisations WHERE status = 'published'"),
    q("SELECT policy_id, slug, name_en, name_te FROM policies WHERE status = 'published'"),
    q('SELECT sector_id, slug, name_en, name_te FROM sectors'),
    q('SELECT * FROM entity_links')
  ]);
  const nodes = [
    ...orgs.map((row) => ({ id: `organisation:${row.org_id}`, type: 'organisation', label: pick(row.name_en, row.name_te, lang), slug: row.slug })),
    ...policies.map((row) => ({ id: `policy:${row.policy_id}`, type: 'policy', label: pick(row.name_en, row.name_te, lang), slug: row.slug })),
    ...sectors.map((row) => ({ id: `sector:${row.sector_id}`, type: 'sector', label: pick(row.name_en, row.name_te, lang), slug: row.slug }))
  ];
  return {
    nodes,
    links: links.map((row) => ({
      source: `${row.from_type}:${row.from_id}`,
      target: `${row.to_type}:${row.to_id}`,
      relation: pick(row.relation_en, row.relation_te, lang)
    }))
  };
}

async function documents(query) {
  const lang = normaliseLang(query.lang);
  const { page, limit } = pageParams(query);
  const parts = ["d.status = 'published'"];
  const params = [];
  if (query.category) {
    parts.push('c.slug = ?');
    params.push(query.category);
  }
  if (query.year && /^\d{4}$/.test(query.year)) {
    parts.push('YEAR(d.doc_date) = ?');
    params.push(Number(query.year));
  }
  if (query.from) {
    parts.push('d.doc_date >= ?');
    params.push(query.from);
  }
  if (query.to) {
    parts.push('d.doc_date <= ?');
    params.push(query.to);
  }
  if (query.q) {
    const term = `%${likeTerm(query.q)}%`;
    parts.push('(d.title_en LIKE ? OR d.title_te LIKE ? OR d.doc_number LIKE ? OR d.description_en LIKE ?)');
    params.push(term, term, term, term);
  }
  const where = `WHERE ${parts.join(' AND ')}`;
  const from = 'FROM documents d JOIN document_categories c ON c.category_id = d.category_id';
  const [{ total }] = await q(`SELECT COUNT(*) AS total ${from} ${where}`, params);
  const sort = ['doc_date', 'title_en'].includes(query.sort) ? query.sort : 'doc_date';
  const order = String(query.order).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  const rows = await q(
    `SELECT d.*, c.slug AS category, c.name_en AS category_en, c.name_te AS category_te ${from} ${where}
     ORDER BY d.${sort} ${order}, d.doc_id DESC LIMIT ? OFFSET ?`,
    [...params, limit, (page - 1) * limit]
  );
  return {
    data: resolveRows(rows, getResource('documents').bi, lang).map((row) => ({
      ...row,
      category_name: pick(row.category_en, row.category_te, lang)
    })),
    meta: listMeta(page, limit, total)
  };
}

async function document(id, lang) {
  const row = await one(
    `SELECT d.*, c.slug AS category, c.name_en AS category_en, c.name_te AS category_te,
            m.file_path, m.file_name
     FROM documents d JOIN document_categories c ON c.category_id = d.category_id
     LEFT JOIN media_files m ON m.file_id = d.file_id
     WHERE d.doc_id = ? AND d.status = 'published'`,
    [id]
  );
  if (!row) throw new ApiError(404, 'Document not found.');
  return resolveRow(row, getResource('documents').bi, lang);
}

async function documentDownload(id) {
  const row = await one(
    `SELECT d.doc_id, d.title_en, d.file_id, m.file_path, m.file_name
     FROM documents d LEFT JOIN media_files m ON m.file_id = d.file_id
     WHERE d.doc_id = ? AND d.status = 'published'`,
    [id]
  );
  if (!row) throw new ApiError(404, 'Document not found.');
  if (!row.file_path) throw new ApiError(404, 'No file is attached to this document.');
  await q('UPDATE documents SET download_count = download_count + 1 WHERE doc_id = ?', [id]);
  return { filePath: row.file_path, fileName: row.file_name || `document-${id}.pdf` };
}

async function documentCategories(lang) {
  const rows = await q('SELECT * FROM document_categories ORDER BY display_order, category_id');
  return resolveRows(rows, getResource('document-categories').bi, lang);
}

async function faqs(lang) {
  const rows = await q("SELECT * FROM faqs WHERE status = 'published' ORDER BY display_order, faq_id");
  return resolveRows(rows, getResource('faqs').bi, lang);
}

async function rti(query = {}) {
  return documents({ ...query, category: 'rti', limit: Math.min(100, Number(query.limit) || 100) });
}

async function tenders(query) {
  const lang = normaliseLang(query.lang);
  const { page, limit } = pageParams(query);
  const parts = ["t.publish_status = 'published'"];
  const params = [];
  if (query.status) {
    parts.push('t.status = ?');
    params.push(query.status);
  }
  if (query.from) {
    parts.push('t.published_date >= ?');
    params.push(query.from);
  }
  if (query.to) {
    parts.push('t.published_date <= ?');
    params.push(query.to);
  }
  if (query.q) {
    const term = `%${likeTerm(query.q)}%`;
    parts.push('(t.title_en LIKE ? OR t.title_te LIKE ? OR t.tender_number LIKE ?)');
    params.push(term, term, term);
  }
  const where = `WHERE ${parts.join(' AND ')}`;
  const [{ total }] = await q(`SELECT COUNT(*) AS total FROM tenders t ${where}`, params);
  const rows = await q(
    `SELECT t.*, m.file_path, m.file_name FROM tenders t LEFT JOIN media_files m ON m.file_id = t.file_id
     ${where} ORDER BY t.published_date DESC, t.tender_id DESC LIMIT ? OFFSET ?`,
    [...params, limit, (page - 1) * limit]
  );
  return { data: resolveRows(rows, getResource('tenders').bi, lang), meta: listMeta(page, limit, total) };
}

async function tender(id, lang) {
  const row = await one(
    `SELECT t.*, m.file_path, m.file_name FROM tenders t LEFT JOIN media_files m ON m.file_id = t.file_id
     WHERE t.tender_id = ? AND t.publish_status = 'published'`,
    [id]
  );
  if (!row) throw new ApiError(404, 'Tender not found.');
  return resolveRow(row, getResource('tenders').bi, lang);
}

async function tenderDownload(id, kind = 'tender') {
  const row = await one(
    `SELECT t.tender_id, t.tender_number, t.file_id, t.corrigendum_file_id,
            m.file_path, m.file_name, c.file_path AS corrigendum_path, c.file_name AS corrigendum_name
     FROM tenders t
     LEFT JOIN media_files m ON m.file_id = t.file_id
     LEFT JOIN media_files c ON c.file_id = t.corrigendum_file_id
     WHERE t.tender_id = ? AND t.publish_status = 'published'`,
    [id]
  );
  if (!row) throw new ApiError(404, 'Tender not found.');
  const useCorrigendum = kind === 'corrigendum';
  const filePath = useCorrigendum ? row.corrigendum_path : row.file_path;
  const fileName = useCorrigendum ? row.corrigendum_name : row.file_name;
  if (!filePath) throw new ApiError(404, 'No file is attached to this tender.');
  return { filePath, fileName: fileName || `tender-${row.tender_number}.pdf` };
}

async function scienceStories(query) {
  return listResource('science-stories', query);
}

async function scienceStory(id, lang) {
  const row = await one(
    `SELECT s.*, m.file_path AS video_path, t.file_path AS thumbnail_path, c.file_path AS captions_path
     FROM science_stories s
     LEFT JOIN media_files m ON m.file_id = s.video_file_id
     LEFT JOIN media_files t ON t.file_id = s.thumbnail_id
     LEFT JOIN media_files c ON c.file_id = s.captions_file_id
     WHERE s.story_id = ? AND s.status = 'published'`,
    [id]
  );
  if (!row) throw new ApiError(404, 'Video not found.');
  return resolveRow(row, getResource('science-stories').bi, lang);
}

async function events(query) {
  const lang = normaliseLang(query.lang);
  const { page, limit } = pageParams(query);
  const parts = ["e.status = 'published'"];
  const params = [];
  if (query.when === 'upcoming') parts.push(`e.start_datetime >= ${nowSql}`);
  else if (query.when === 'past') parts.push(`e.start_datetime < ${nowSql}`);
  if (query.district) {
    parts.push('d.slug = ?');
    params.push(query.district);
  }
  if (query.month && /^\d{1,2}$/.test(query.month)) {
    parts.push('MONTH(e.start_datetime) = ?');
    params.push(Number(query.month));
  }
  if (query.year && /^\d{4}$/.test(query.year)) {
    parts.push('YEAR(e.start_datetime) = ?');
    params.push(Number(query.year));
  }
  const where = `WHERE ${parts.join(' AND ')}`;
  const from = 'FROM events e LEFT JOIN districts d ON d.district_id = e.district_id';
  const [{ total }] = await q(`SELECT COUNT(*) AS total ${from} ${where}`, params);
  const rows = await q(
    `SELECT e.*, d.slug AS district_slug, d.name_en AS district_en, d.name_te AS district_te ${from} ${where}
     ORDER BY e.start_datetime DESC LIMIT ? OFFSET ?`,
    [...params, limit, (page - 1) * limit]
  );
  return { data: resolveRows(rows, getResource('events').bi, lang), meta: listMeta(page, limit, total) };
}

async function event(slug, lang) {
  const row = await one(
    `SELECT e.*, d.slug AS district_slug, d.name_en AS district_en, d.name_te AS district_te
     FROM events e LEFT JOIN districts d ON d.district_id = e.district_id
     WHERE e.slug = ? AND e.status = 'published'`,
    [slug]
  );
  if (!row) throw new ApiError(404, 'Event not found.');
  return resolveRow(row, getResource('events').bi, lang);
}

async function office(lang) {
  const row = await one('SELECT * FROM office_contacts ORDER BY contact_id LIMIT 1');
  if (!row) throw new ApiError(404, 'Office details are not published yet.');
  return resolveRow(row, getResource('office-contacts').bi, lang);
}

async function officers(lang) {
  const rows = await q('SELECT * FROM officers WHERE is_active = 1 ORDER BY display_order, officer_id');
  return resolveRows(rows, getResource('officers').bi, lang);
}

async function quickLinks(query) {
  const lang = normaliseLang(query.lang);
  const parts = ['is_active = 1'];
  const params = [];
  if (query.group) {
    parts.push('link_group = ?');
    params.push(query.group);
  }
  const rows = await q(`SELECT * FROM quick_links WHERE ${parts.join(' AND ')} ORDER BY display_order, link_id`, params);
  return resolveRows(rows, getResource('quick-links').bi, lang);
}

async function socialLinks() {
  return q('SELECT * FROM social_links WHERE is_active = 1 ORDER BY display_order, social_id');
}

async function sitemap(lang) {
  const [pages, orgs, policies, events] = await Promise.all([
    q("SELECT slug, section, title_en, title_te FROM pages WHERE status = 'published' ORDER BY display_order"),
    q("SELECT slug, name_en, name_te FROM organisations WHERE status = 'published' ORDER BY display_order"),
    q("SELECT slug, name_en, name_te FROM policies WHERE status = 'published' ORDER BY display_order"),
    q("SELECT slug, title_en, title_te FROM events WHERE status = 'published' ORDER BY start_datetime DESC LIMIT 100")
  ]);
  return {
    sections: [
      {
        title: 'Pages',
        items: pages.map((row) => ({
          label: pick(row.title_en, row.title_te, lang),
          url: pagePath(row.slug)
        }))
      },
      {
        title: 'Organisations',
        items: orgs.map((row) => ({ label: pick(row.name_en, row.name_te, lang), url: `/organisations/${row.slug}` }))
      },
      {
        title: 'Policies',
        items: policies.map((row) => ({ label: pick(row.name_en, row.name_te, lang), url: `/policies/${row.slug}` }))
      },
      {
        title: 'Events',
        items: events.map((row) => ({ label: pick(row.title_en, row.title_te, lang), url: `/media/events/${row.slug}` }))
      }
    ]
  };
}

const SITEMAP_STATIC = [
  '/', '/about', '/about/mission', '/about/objectives', '/about/organisation', '/about/awards',
  '/organisations', '/districts', '/how-it-connects', '/ict', '/ict/projects', '/policies', '/investors',
  '/ecitizen', '/ecitizen/rti', '/ecitizen/acts', '/ecitizen/government-orders', '/ecitizen/notifications',
  '/ecitizen/policies', '/ecitizen/guidelines', '/ecitizen/faqs', '/ecitizen/useful-links',
  '/ecitizen/it-act-2000', '/ecitizen/posh-act', '/tenders', '/media', '/media/science-stories',
  '/media/events', '/media/gallery', '/contact', '/feedback', '/screen-reader-access', '/help', '/sitemap'
];

async function sitemapXml() {
  const [pages, orgs, policies, events] = await Promise.all([
    q("SELECT slug, section FROM pages WHERE status = 'published'"),
    q("SELECT slug FROM organisations WHERE status = 'published'"),
    q("SELECT slug FROM policies WHERE status = 'published'"),
    q("SELECT slug FROM events WHERE status = 'published'")
  ]);
  const paths = [
    ...SITEMAP_STATIC,
    ...pages.map((row) => pagePath(row.slug)),
    ...orgs.map((row) => `/organisations/${row.slug}`),
    ...policies.map((row) => `/policies/${row.slug}`),
    ...events.map((row) => `/media/events/${row.slug}`)
  ];
  const escape = (value) => String(value).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
  const urls = paths.map((path) => `  <url><loc>${escape(config.publicOrigin + path)}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

async function health() {
  return { status: 'ok', uptime: Math.round(process.uptime()), time: new Date().toISOString() };
}

/**
 * Counts of the records the website publishes, straight from MySQL. The home
 * page counters and the district headings read these instead of any literal.
 */
async function counts() {
  const rows = await q(
    `SELECT
       (SELECT COUNT(*) FROM organisations WHERE status = 'published') AS organisations,
       (SELECT COUNT(*) FROM policies WHERE status = 'published') AS policies,
       (SELECT COUNT(*) FROM districts) AS districts,
       (SELECT COUNT(*) FROM documents WHERE status = 'published') AS documents,
       (SELECT COUNT(*) FROM tenders WHERE publish_status = 'published') AS tenders`
  );
  const row = rows[0] || {};
  const num = (value) => Number(value) || 0;
  return {
    organisations: num(row.organisations),
    policies: num(row.policies),
    districts: num(row.districts),
    documents: num(row.documents),
    tenders: num(row.tenders),
    // "Orders, documents & tenders" is one counter on the home page.
    orders: num(row.documents) + num(row.tenders)
  };
}

module.exports = {
  listResource,
  getPage,
  listPages,
  footerPages,
  home,
  counts,
  news,
  almanac,
  awardsList,
  awardYears,
  awardsByYear,
  organisations,
  organisation,
  policies,
  policy,
  districts,
  district,
  districtInstitutions,
  districtInstitution,
  districtMap,
  connections,
  documents,
  document,
  documentDownload,
  documentCategories,
  faqs,
  rti,
  tenders,
  tender,
  tenderDownload,
  scienceStories,
  scienceStory,
  events,
  event,
  office,
  officers,
  quickLinks,
  socialLinks,
  sitemap,
  sitemapXml,
  health,
  analyticsService
};
