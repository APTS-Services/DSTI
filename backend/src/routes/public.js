// Public, unauthenticated endpoints.
import { Router } from 'express';
import env from '../config/env.js';
import { query } from '../db/pool.js';
import { getSettings, publicBundle } from '../content/store.js';
import { cleanString } from '../content/validate.js';
import { asyncHandler } from '../middleware/errors.js';
import { feedbackLimiter, hitLimiter } from '../middleware/rateLimits.js';
import { verifyCaptcha } from '../utils/captcha.js';
import { sendMail } from '../utils/mailer.js';

const router = Router();

// All published content in one response; revalidated cheaply with ETag.
router.get('/content', asyncHandler(async (req, res) => {
  const { body, etag } = await publicBundle();
  res.setHeader('ETag', etag);
  res.setHeader('Cache-Control', 'no-cache');
  if (req.get('if-none-match') === etag) return res.status(304).end();
  res.type('application/json').send(body);
}));

router.post('/feedback', feedbackLimiter, asyncHandler(async (req, res) => {
  const b = req.body || {};
  if (!verifyCaptcha(b.captchaId, typeof b.captcha === 'string' ? b.captcha : '')) {
    return res.status(400).json({ error: 'The CAPTCHA answer is incorrect. Please try again.', field: 'captcha' });
  }
  const data = {
    name: cleanString(b.name, 100),
    email: cleanString(b.email, 160),
    phone: cleanString(b.phone, 20),
    subject: cleanString(b.subject, 150),
    message: cleanString(b.message, 2000),
  };
  const errors = {};
  if (data.name.length < 2 || !/^[\p{L}\p{M} .'-]+$/u.test(data.name)) errors.name = 'Please enter your name (letters only).';
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(data.email)) errors.email = 'Please enter a valid e-mail address.';
  if (data.phone && !/^[6-9]\d{9}$/.test(data.phone)) errors.phone = 'Please enter a valid 10-digit mobile number.';
  if (data.message.length < 10) errors.message = 'Please enter a message of at least 10 characters.';
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Please correct the highlighted fields.', fields: errors });

  const result = await query('INSERT INTO feedback (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)', [
    data.name, data.email, data.phone, data.subject, data.message,
  ]);
  const { feedbackNotifyEmail } = await getSettings('system');
  const sent = await sendMail({
    to: feedbackNotifyEmail,
    subject: `[DSTI website] New feedback #${result.insertId}`,
    text: `New feedback received on the DSTI website.\n\nName: ${data.name}\nE-mail: ${data.email}\nSubject: ${data.subject}\n\nSign in to the CMS to read and respond.`,
  });
  if (sent) await query('UPDATE feedback SET notified = 1 WHERE id = ?', [result.insertId]);
  return res.status(201).json({ ok: true, reference: `FB-${String(result.insertId).padStart(5, '0')}` });
}));

// Privacy-friendly hit counter: no cookies, no IP stored.
router.post('/hit', hitLimiter, asyncHandler(async (req, res) => {
  const path = cleanString(req.body?.path, 120);
  const firstVisit = req.body?.newVisitor === true;
  if (!/^\/[A-Za-z0-9\-/_]*$/.test(path) || path.startsWith('/admin')) return res.status(204).end();
  await query('INSERT INTO page_views (view_date, path, hits) VALUES (UTC_DATE(), ?, 1) ON DUPLICATE KEY UPDATE hits = hits + 1', [path]);
  if (firstVisit) await query('INSERT INTO visits (visit_date, visitors) VALUES (UTC_DATE(), 1) ON DUPLICATE KEY UPDATE visitors = visitors + 1');
  return res.status(204).end();
}));

router.get('/stats', asyncHandler(async (req, res) => {
  const [total] = await query('SELECT COALESCE(SUM(visitors), 0) AS total FROM visits');
  const [today] = await query('SELECT COALESCE(SUM(visitors), 0) AS today FROM visits WHERE visit_date = UTC_DATE()');
  const [updated] = await query("SELECT DATE_FORMAT(MAX(updated_at), '%Y-%m-%d') AS d FROM content");
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.json({ total: Number(total.total), today: Number(today.today), lastUpdated: updated.d });
}));

export default router;

// ---- sitemap.xml and robots.txt ----
const xml = (s) => String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));

const STATIC_PATHS = [
  '/', '/about', '/about/mission', '/about/objectives', '/about/organisation', '/about/awards',
  '/organisations', '/districts', '/how-it-connects', '/ict', '/ict/projects', '/policies', '/investors',
  '/ecitizen', '/ecitizen/rti', '/ecitizen/acts', '/ecitizen/government-orders', '/ecitizen/notifications',
  '/ecitizen/policies', '/ecitizen/guidelines', '/ecitizen/faqs', '/ecitizen/useful-links',
  '/ecitizen/it-act-2000', '/ecitizen/posh-act', '/tenders', '/media', '/media/science-stories',
  '/media/events', '/contact', '/screen-reader-access', '/help', '/sitemap',
];
const PAGE_ROUTES = new Set(['website-policy', 'privacy-policy', 'terms-of-use', 'copyright', 'disclaimer', 'hyperlink-policy', 'accessibility-statement']);

export const seoRouter = Router();

seoRouter.get('/sitemap.xml', asyncHandler(async (req, res) => {
  const { data } = await publicBundle();
  const paths = [
    ...STATIC_PATHS,
    ...data.collections.organisations.map((o) => `/organisations/${o.id}`),
    ...data.collections.policies.map((p) => `/policies/${p.id}`),
    ...data.collections.pages.filter((p) => PAGE_ROUTES.has(p.id)).map((p) => `/policies/${p.id}`),
  ];
  const urls = paths.map((p) => `  <url><loc>${xml(env.publicOrigin + p)}</loc></url>`).join('\n');
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
}));

seoRouter.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nDisallow: /admin\nDisallow: /api/\nSitemap: ${env.publicOrigin}/sitemap.xml\n`);
});
