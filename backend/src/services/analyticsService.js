// src/services/analyticsService.js — anonymous hit counter and reports.
const repository = require('../repositories/analyticsRepository');
const { cleanString } = require('../utils/validate');
const { hashVisitor } = require('../utils/security');
const { ApiError } = require('../utils/http');

const PATH_RE = /^\/[A-Za-z0-9\-/_]*$/;

function deviceFrom(req) {
  const ua = String(req.get('user-agent') || '').toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(ua)) return 'tablet';
  if (/mobi|android|iphone|ipod/.test(ua)) return 'mobile';
  if (ua) return 'desktop';
  return 'other';
}

/** Records one page view. Paths under /admin and malformed paths are ignored. */
async function trackView({ path, lang = 'en', newVisitor = false }, req) {
  const pagePath = cleanString(path, 300);
  if (!pagePath || !PATH_RE.test(pagePath) || pagePath.startsWith('/admin')) return { ok: true };
  await repository.recordView({
    path: pagePath,
    lang: lang === 'te' ? 'te' : 'en',
    visitorHash: hashVisitor(`${req.ip || ''}|${req.get('user-agent') || ''}`),
    device: deviceFrom(req),
    newVisitor: newVisitor === true
  });
  return { ok: true };
}

async function publicStats() {
  const totals = await repository.totals();
  return {
    total: totals.visitors,
    today: totals.today.visitors,
    pageViews: totals.views,
    lastUpdated: await repository.lastUpdated()
  };
}

async function visitors() {
  const totals = await repository.totals();
  return { total: totals.visitors, today: totals.today.visitors };
}

/** Shape the React admin analytics page expects. */
async function compatAnalytics() {
  const days = await repository.daily({ limitDays: 30 });
  const pages = await repository.topPages({ limit: 15 });
  const totals = await repository.totals();
  return {
    days: days.map((d) => ({ date: d.date, visitors: d.visitors })),
    pages,
    totals: { visitors: totals.visitors, pageViews: totals.views }
  };
}

async function summary() {
  const totals = await repository.totals();
  return {
    views: totals.views,
    visitors: totals.visitors,
    today: totals.today,
    thisMonth: totals.month
  };
}

async function daily(query) {
  if (query.from && !/^\d{4}-\d{2}-\d{2}$/.test(query.from)) throw new ApiError(400, 'from must be YYYY-MM-DD.');
  if (query.to && !/^\d{4}-\d{2}-\d{2}$/.test(query.to)) throw new ApiError(400, 'to must be YYYY-MM-DD.');
  return repository.daily({ from: query.from, to: query.to });
}

module.exports = {
  trackView,
  publicStats,
  visitors,
  compatAnalytics,
  summary,
  daily,
  topPages: (query) =>
    repository.topPages({
      from: query.from,
      to: query.to,
      limit: Math.min(100, Math.max(1, parseInt(query.limit, 10) || 15))
    }),
  devices: (query) => repository.devices(query),
  topDownloads: () => repository.topDownloads()
};
