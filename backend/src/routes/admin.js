// CMS API. Every route requires a signed-in user, a valid CSRF token and the
// appropriate role.
import fs from 'node:fs/promises';
import path from 'node:path';
import express, { Router } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import env from '../config/env.js';
import { getPool, query } from '../db/pool.js';
import { collections, getCollection, getSetting, settings } from '../content/schemas.js';
import { bumpVersion, deleteItem, getItem, getSettings, insertItem, listItems, newKey, putSettings, updateItem } from '../content/store.js';
import { cleanString, sanitize } from '../content/validate.js';
import { requireAuth, requireCsrf, requireRole } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/errors.js';
import { audit } from '../utils/audit.js';
import { passwordProblems, randomToken, decryptSecret } from '../utils/security.js';

const router = Router();
router.use(requireAuth, requireCsrf);

const ADMIN = 'Administrator';
const PUBLISHER = 'Publisher';
const canPublish = (user) => user.role === ADMIN || user.role === PUBLISHER;

// ---------- Schemas ----------
router.get('/schemas', (req, res) => {
  const visibleSettings = Object.fromEntries(Object.entries(settings).filter(([, s]) => s.roles.includes(req.user.role)));
  res.json({ collections, settings: visibleSettings });
});

// ---------- Dashboard ----------
router.get('/dashboard', asyncHandler(async (req, res) => {
  const counts = await query("SELECT collection, COUNT(*) AS n, SUM(status = 'draft') AS drafts FROM content WHERE collection <> '_settings' GROUP BY collection");
  const [fb] = await query("SELECT COUNT(*) AS total, SUM(status = 'new') AS unread FROM feedback");
  const [visits] = await query('SELECT COALESCE(SUM(visitors), 0) AS total, COALESCE(SUM(CASE WHEN visit_date = UTC_DATE() THEN visitors END), 0) AS today FROM visits');
  const recent = await query('SELECT username, action, target, created_at FROM audit_log ORDER BY id DESC LIMIT 8');
  const openTenders = (await listItems('tenders')).filter((t) => t.status === 'open').length;
  res.json({
    counts: Object.fromEntries(counts.map((c) => [c.collection, { total: Number(c.n), drafts: Number(c.drafts) }])),
    feedback: { total: Number(fb.total), unread: Number(fb.unread || 0) },
    visits: { total: Number(visits.total), today: Number(visits.today) },
    openTenders,
    recent: canPublish(req.user) ? recent : [],
  });
}));

// ---------- Collections ----------
function collectionOr404(req) {
  const schema = getCollection(req.params.collection);
  if (!schema) throw new HttpError(404, 'Unknown section.');
  return schema;
}

router.get('/content/:collection', asyncHandler(async (req, res) => {
  collectionOr404(req);
  res.json({ items: await listItems(req.params.collection, { includeDrafts: true }) });
}));

router.get('/content/:collection/:key', asyncHandler(async (req, res) => {
  collectionOr404(req);
  const item = await getItem(req.params.collection, req.params.key);
  if (!item) throw new HttpError(404, 'Item not found.');
  res.json({ item });
}));

function readMeta(req, existing) {
  const order = Number.isInteger(Number(req.body?._order)) ? Math.max(-9999, Math.min(9999, Number(req.body._order))) : (existing?._order ?? 0);
  let status = req.body?._status === 'draft' ? 'draft' : 'published';
  // Editors prepare content; publishing is reserved for Publishers and Administrators.
  if (!canPublish(req.user)) status = existing ? existing._status : 'draft';
  return { order, status };
}

router.post('/content/:collection', asyncHandler(async (req, res) => {
  const schema = collectionOr404(req);
  const { value, errors } = sanitize(schema.fields, req.body);
  if (errors.length) return res.status(400).json({ error: 'Please correct the errors.', errors });
  const key = schema.keyField ? value[schema.keyField] : newKey(req.params.collection);
  if (await getItem(req.params.collection, key)) return res.status(409).json({ error: 'An item with this identifier already exists.' });
  const meta = readMeta(req, null);
  await insertItem(req.params.collection, key, value, { ...meta, userId: req.user.id });
  await audit(req, 'CREATE', `${req.params.collection}/${key}`, meta.status);
  res.status(201).json({ item: await getItem(req.params.collection, key) });
}));

router.put('/content/:collection/:key', asyncHandler(async (req, res) => {
  const schema = collectionOr404(req);
  const existing = await getItem(req.params.collection, req.params.key);
  if (!existing) throw new HttpError(404, 'Item not found.');
  const { value, errors } = sanitize(schema.fields, req.body);
  if (errors.length) return res.status(400).json({ error: 'Please correct the errors.', errors });
  const renamed = schema.keyField ? value[schema.keyField] : req.params.key;
  if (renamed !== req.params.key && (await getItem(req.params.collection, renamed))) {
    return res.status(409).json({ error: 'An item with this identifier already exists.' });
  }
  const meta = readMeta(req, existing);
  await updateItem(req.params.collection, req.params.key, value, { ...meta, userId: req.user.id, newKey: renamed });
  await audit(req, 'UPDATE', `${req.params.collection}/${renamed}`, meta.status);
  res.json({ item: await getItem(req.params.collection, renamed) });
}));

router.delete('/content/:collection/:key', requireRole(ADMIN, PUBLISHER), asyncHandler(async (req, res) => {
  collectionOr404(req);
  if (!(await deleteItem(req.params.collection, req.params.key))) throw new HttpError(404, 'Item not found.');
  await audit(req, 'DELETE', `${req.params.collection}/${req.params.key}`);
  res.json({ ok: true });
}));

// ---------- Settings ----------
function settingOr403(req) {
  const schema = getSetting(req.params.name);
  if (!schema) throw new HttpError(404, 'Unknown settings group.');
  if (!schema.roles.includes(req.user.role)) throw new HttpError(403, 'You do not have permission to do this.');
  return schema;
}

router.get('/settings/:name', asyncHandler(async (req, res) => {
  settingOr403(req);
  res.json({ item: await getSettings(req.params.name) });
}));

router.put('/settings/:name', asyncHandler(async (req, res) => {
  const schema = settingOr403(req);
  const { value, errors } = sanitize(schema.fields, req.body);
  if (errors.length) return res.status(400).json({ error: 'Please correct the errors.', errors });
  await putSettings(req.params.name, value, req.user.id);
  await audit(req, 'SETTINGS', req.params.name);
  res.json({ item: value });
}));

// ---------- Uploads ----------
const TYPES = {
  pdf: { mime: 'application/pdf', test: (b) => b.subarray(0, 5).toString('latin1') === '%PDF-' },
  png: { mime: 'image/png', test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  jpg: { mime: 'image/jpeg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  webp: { mime: 'image/webp', test: (b) => b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP' },
  mp4: { mime: 'video/mp4', test: (b) => b.subarray(4, 8).toString('latin1') === 'ftyp' },
};
const EXT_ALIASES = { jpeg: 'jpg' };

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxUploadBytes, files: 1, fields: 5 },
});

router.post('/uploads', upload.single('file'), asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'Please choose a file.' });
  const rawExt = path.extname(file.originalname).slice(1).toLowerCase();
  const ext = EXT_ALIASES[rawExt] || rawExt;
  const type = TYPES[ext];
  // Both the extension and the actual file signature must match an allowed type.
  if (!type || !type.test(file.buffer) || /\.(php|js|html?|svg|exe|sh)\b/i.test(file.originalname.replace(/\.[^.]+$/, ''))) {
    return res.status(400).json({ error: 'Only PDF, PNG, JPG, WEBP and MP4 files are allowed.' });
  }
  const stored = `${randomToken(16)}.${ext}`;
  await fs.mkdir(env.uploadDir, { recursive: true });
  await fs.writeFile(path.join(env.uploadDir, stored), file.buffer, { mode: 0o640 });
  const original = cleanString(file.originalname, 200).replace(/[^\w.\- ()]/g, '_');
  await query('INSERT INTO uploads (stored_name, original_name, mime, size_bytes, uploaded_by) VALUES (?, ?, ?, ?, ?)', [stored, original, type.mime, file.size, req.user.id]);
  await audit(req, 'UPLOAD', stored, original);
  res.status(201).json({ url: `/uploads/${stored}`, name: original, size: file.size, mime: type.mime });
}));

router.get('/uploads', asyncHandler(async (req, res) => {
  const rows = await query('SELECT id, stored_name, original_name, mime, size_bytes, created_at FROM uploads ORDER BY id DESC LIMIT 500');
  res.json({ items: rows.map((r) => ({ ...r, url: `/uploads/${r.stored_name}` })) });
}));

router.delete('/uploads/:id', requireRole(ADMIN, PUBLISHER), asyncHandler(async (req, res) => {
  const [row] = await query('SELECT stored_name FROM uploads WHERE id = ?', [Number(req.params.id) || 0]);
  if (!row) throw new HttpError(404, 'File not found.');
  await fs.rm(path.join(env.uploadDir, path.basename(row.stored_name)), { force: true });
  await query('DELETE FROM uploads WHERE id = ?', [Number(req.params.id)]);
  await audit(req, 'UPLOAD_DELETE', row.stored_name);
  res.json({ ok: true });
}));

// ---------- Feedback ----------
router.get('/feedback', requireRole(ADMIN, PUBLISHER), asyncHandler(async (req, res) => {
  res.json({ items: await query('SELECT * FROM feedback ORDER BY id DESC LIMIT 1000') });
}));

router.patch('/feedback/:id', requireRole(ADMIN, PUBLISHER), asyncHandler(async (req, res) => {
  const status = ['new', 'read', 'resolved'].includes(req.body?.status) ? req.body.status : null;
  if (!status) return res.status(400).json({ error: 'Invalid status.' });
  await query('UPDATE feedback SET status = ? WHERE id = ?', [status, Number(req.params.id) || 0]);
  await audit(req, 'FEEDBACK', `feedback/${req.params.id}`, status);
  res.json({ ok: true });
}));

router.delete('/feedback/:id', requireRole(ADMIN), asyncHandler(async (req, res) => {
  await query('DELETE FROM feedback WHERE id = ?', [Number(req.params.id) || 0]);
  await audit(req, 'FEEDBACK_DELETE', `feedback/${req.params.id}`);
  res.json({ ok: true });
}));

// ---------- Analytics ----------
router.get('/analytics', asyncHandler(async (req, res) => {
  const days = await query("SELECT DATE_FORMAT(visit_date, '%Y-%m-%d') AS date, visitors FROM visits WHERE visit_date >= UTC_DATE() - INTERVAL 29 DAY ORDER BY visit_date");
  const pages = await query('SELECT path, SUM(hits) AS hits FROM page_views WHERE view_date >= UTC_DATE() - INTERVAL 29 DAY GROUP BY path ORDER BY hits DESC LIMIT 15');
  const [totals] = await query('SELECT COALESCE(SUM(visitors), 0) AS visitors FROM visits');
  const [views] = await query('SELECT COALESCE(SUM(hits), 0) AS views FROM page_views');
  res.json({
    days: days.map((d) => ({ date: d.date, visitors: Number(d.visitors) })),
    pages: pages.map((p) => ({ path: p.path, hits: Number(p.hits) })),
    totals: { visitors: Number(totals.visitors), pageViews: Number(views.views) },
  });
}));

// ---------- Users (Administrator only) ----------
const ROLES = ['Administrator', 'Publisher', 'Editor'];

router.get('/users', requireRole(ADMIN), asyncHandler(async (req, res) => {
  res.json({ items: await query('SELECT id, username, full_name, email, role, is_active, must_change_password, locked_until, last_login_at, created_at FROM users ORDER BY id') });
}));

function userFields(body) {
  const errors = [];
  const out = {
    username: cleanString(body.username, 50).toLowerCase(),
    full_name: cleanString(body.full_name, 120),
    email: cleanString(body.email, 160),
    role: ROLES.includes(body.role) ? body.role : null,
    is_active: body.is_active === false || body.is_active === 0 ? 0 : 1,
  };
  if (!/^[a-z][a-z0-9._-]{2,49}$/.test(out.username)) errors.push('Username must be 3-50 characters: letters, digits, dot, dash or underscore.');
  if (out.full_name.length < 2) errors.push('Full name is required.');
  if (out.email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(out.email)) errors.push('E-mail address is invalid.');
  if (!out.role) errors.push('Role is invalid.');
  return { out, errors };
}

router.post('/users', requireRole(ADMIN), asyncHandler(async (req, res) => {
  const { out, errors } = userFields(req.body || {});
  const password = decryptSecret(req.body?.password, req.user.csrf);
  const problems = passwordProblems(password || '', out.username);
  if (problems.length) errors.push(`Password ${problems.join(', ')}.`);
  if (errors.length) return res.status(400).json({ error: errors.join(' '), errors });
  const [dup] = await query('SELECT id FROM users WHERE username = ?', [out.username]);
  if (dup) return res.status(409).json({ error: 'This username is already taken.' });
  const hash = await bcrypt.hash(password, 12);
  await query('INSERT INTO users (username, full_name, email, role, password_hash, must_change_password, is_active) VALUES (?, ?, ?, ?, ?, 1, ?)', [
    out.username, out.full_name, out.email, out.role, hash, out.is_active,
  ]);
  await audit(req, 'USER_CREATE', out.username, out.role);
  res.status(201).json({ ok: true });
}));

router.put('/users/:id', requireRole(ADMIN), asyncHandler(async (req, res) => {
  const id = Number(req.params.id) || 0;
  const [user] = await query('SELECT id, username FROM users WHERE id = ?', [id]);
  if (!user) throw new HttpError(404, 'User not found.');
  const { out, errors } = userFields({ ...req.body, username: user.username });
  if (id === req.user.id && (out.role !== ADMIN || !out.is_active)) errors.push('You cannot remove your own administrator access.');
  if (errors.length) return res.status(400).json({ error: errors.join(' '), errors });
  await query('UPDATE users SET full_name = ?, email = ?, role = ?, is_active = ? WHERE id = ?', [out.full_name, out.email, out.role, out.is_active, id]);
  if (req.body?.unlock) await query('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?', [id]);
  if (req.body?.password) {
    const password = decryptSecret(req.body.password, req.user.csrf);
    const problems = passwordProblems(password || '', user.username);
    if (problems.length) return res.status(400).json({ error: `Password ${problems.join(', ')}.` });
    await query('UPDATE users SET password_hash = ?, must_change_password = 1 WHERE id = ?', [await bcrypt.hash(password, 12), id]);
  }
  if (!out.is_active || req.body?.password) await query('DELETE FROM sessions WHERE user_id = ?', [id]);
  await audit(req, 'USER_UPDATE', user.username, out.role);
  res.json({ ok: true });
}));

router.delete('/users/:id', requireRole(ADMIN), asyncHandler(async (req, res) => {
  const id = Number(req.params.id) || 0;
  if (id === req.user.id) return res.status(400).json({ error: 'You cannot delete your own account.' });
  const [user] = await query('SELECT username FROM users WHERE id = ?', [id]);
  if (!user) throw new HttpError(404, 'User not found.');
  await query('DELETE FROM users WHERE id = ?', [id]);
  await audit(req, 'USER_DELETE', user.username);
  res.json({ ok: true });
}));

// ---------- Audit log ----------
router.get('/audit', requireRole(ADMIN), asyncHandler(async (req, res) => {
  res.json({ items: await query('SELECT id, username, action, target, details, ip, created_at FROM audit_log ORDER BY id DESC LIMIT 500') });
}));

// ---------- Backup & restore (Administrator only) ----------
router.get('/backup', requireRole(ADMIN), asyncHandler(async (req, res) => {
  const rows = await query('SELECT collection, item_key, data, status, sort_order FROM content ORDER BY collection, sort_order, id');
  const backup = {
    format: 'dsti-content-backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    items: rows.map((r) => ({ ...r, data: JSON.parse(r.data) })),
  };
  await audit(req, 'BACKUP_EXPORT', '', `${rows.length} items`);
  res.setHeader('Content-Disposition', `attachment; filename="dsti-content-${new Date().toISOString().slice(0, 10)}.json"`);
  res.json(backup);
}));

router.post('/restore', requireRole(ADMIN), express.json({ limit: '20mb' }), asyncHandler(async (req, res) => {
  const b = req.body;
  if (!b || b.format !== 'dsti-content-backup' || !Array.isArray(b.items)) return res.status(400).json({ error: 'This is not a valid DSTI backup file.' });
  const rows = [];
  const errors = [];
  for (const it of b.items) {
    const schema = it.collection === '_settings' ? getSetting(it.item_key) : getCollection(it.collection);
    if (!schema || typeof it.item_key !== 'string' || !/^[a-z0-9-]{1,80}$/i.test(it.item_key)) continue;
    const { value, errors: e } = sanitize(schema.fields, it.data);
    if (e.length) errors.push(...e.slice(0, 3));
    rows.push([it.collection, it.item_key, JSON.stringify(value), it.status === 'draft' ? 'draft' : 'published', Number(it.sort_order) || 0]);
  }
  if (!rows.length) return res.status(400).json({ error: 'The backup contains no usable content.' });
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM content');
    for (const r of rows) {
      await conn.execute('INSERT INTO content (collection, item_key, data, status, sort_order, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?)', [...r, req.user.id, req.user.id]);
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
  bumpVersion();
  await audit(req, 'BACKUP_RESTORE', '', `${rows.length} items`);
  res.json({ ok: true, restored: rows.length, warnings: errors.slice(0, 20) });
}));

export default router;
