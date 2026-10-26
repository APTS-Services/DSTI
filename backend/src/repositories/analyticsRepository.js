// src/repositories/analyticsRepository.js — privacy-friendly page views.
// Only a salted hash of the visitor identifier is stored; never an IP address.
const { q, one } = require('../config/db');

async function recordView({ path, lang = 'en', visitorHash = null, device = 'other', newVisitor = false }) {
  await q(
    'INSERT INTO page_views (page_path, lang, visitor_hash, device_type) VALUES (?, ?, ?, ?)',
    [String(path).slice(0, 300), lang === 'te' ? 'te' : 'en', visitorHash, device]
  );
  await q(
    `INSERT INTO daily_stats (stat_date, total_views, unique_visitors) VALUES (UTC_DATE(), 1, ?)
     ON DUPLICATE KEY UPDATE total_views = total_views + 1,
       unique_visitors = unique_visitors + VALUES(unique_visitors)`,
    [newVisitor ? 1 : 0]
  );
}

async function totals({ from, to } = {}) {
  const where = [];
  const params = [];
  if (from) {
    where.push('stat_date >= ?');
    params.push(from);
  }
  if (to) {
    where.push('stat_date <= ?');
    params.push(to);
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const row = await one(
    `SELECT COALESCE(SUM(total_views), 0) AS views, COALESCE(SUM(unique_visitors), 0) AS visitors FROM daily_stats ${clause}`,
    params
  );
  const today = await one('SELECT total_views AS views, unique_visitors AS visitors FROM daily_stats WHERE stat_date = UTC_DATE()');
  const month = await one(
    `SELECT COALESCE(SUM(total_views), 0) AS views, COALESCE(SUM(unique_visitors), 0) AS visitors
     FROM daily_stats WHERE stat_date >= DATE_FORMAT(UTC_DATE(), '%Y-%m-01')`
  );
  return {
    views: Number(row?.views || 0),
    visitors: Number(row?.visitors || 0),
    today: { views: Number(today?.views || 0), visitors: Number(today?.visitors || 0) },
    month: { views: Number(month?.views || 0), visitors: Number(month?.visitors || 0) }
  };
}

async function daily({ from, to, limitDays = 30 } = {}) {
  if (from && to) {
    const rows = await q(
      `SELECT DATE_FORMAT(stat_date, '%Y-%m-%d') AS date, total_views, unique_visitors
       FROM daily_stats WHERE stat_date BETWEEN ? AND ? ORDER BY stat_date`,
      [from, to]
    );
    return rows.map((r) => ({ date: r.date, visitors: Number(r.unique_visitors), views: Number(r.total_views) }));
  }
  const rows = await q(
    `SELECT DATE_FORMAT(stat_date, '%Y-%m-%d') AS date, total_views, unique_visitors
     FROM daily_stats WHERE stat_date >= DATE_SUB(UTC_DATE(), INTERVAL ? DAY) ORDER BY stat_date`,
    [limitDays - 1]
  );
  return rows.map((r) => ({ date: r.date, visitors: Number(r.unique_visitors), views: Number(r.total_views) }));
}

async function topPages({ from, to, limit = 15 } = {}) {
  const where = [];
  const params = [];
  if (from) {
    where.push('viewed_at >= ?');
    params.push(`${from} 00:00:00`);
  }
  if (to) {
    where.push('viewed_at <= ?');
    params.push(`${to} 23:59:59`);
  }
  if (!from && !to) {
    where.push('viewed_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 29 DAY)');
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const rows = await q(
    `SELECT page_path AS path, COUNT(*) AS hits FROM page_views ${clause}
     GROUP BY page_path ORDER BY hits DESC LIMIT ?`,
    [...params, limit]
  );
  return rows.map((r) => ({ path: r.path, hits: Number(r.hits) }));
}

async function devices({ from, to } = {}) {
  const where = ['viewed_at >= ?'];
  const params = [from ? `${from} 00:00:00` : '1970-01-01 00:00:00'];
  if (to) {
    where.push('viewed_at <= ?');
    params.push(`${to} 23:59:59`);
  }
  const rows = await q(
    `SELECT device_type, COUNT(*) AS hits FROM page_views WHERE ${where.join(' AND ')} GROUP BY device_type`,
    params
  );
  return rows.map((r) => ({ device: r.device_type || 'other', hits: Number(r.hits) }));
}

async function topDownloads(limit = 15) {
  const rows = await q(
    `SELECT d.doc_id AS id, d.title_en, d.title_te, d.download_count, c.slug AS category
     FROM documents d JOIN document_categories c ON c.category_id = d.category_id
     WHERE d.download_count > 0 ORDER BY d.download_count DESC LIMIT ?`,
    [limit]
  );
  return rows.map((r) => ({
    id: r.id,
    title: { en: r.title_en, te: r.title_te },
    category: r.category,
    downloads: Number(r.download_count)
  }));
}

async function lastUpdated() {
  const row = await one(
    `SELECT DATE_FORMAT(MAX(updated_at), '%Y-%m-%d') AS d FROM (
       SELECT updated_at FROM pages UNION ALL SELECT updated_at FROM cms_blocks
     ) t`
  );
  return row?.d || new Date().toISOString().slice(0, 10);
}

module.exports = { recordView, totals, daily, topPages, devices, topDownloads, lastUpdated };
