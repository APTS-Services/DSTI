// tests/api.test.js — integration tests against a real MySQL database.
//
// Requires `npm run db:setup` (and optionally `npm run seed`) plus the .env
// credentials. Run with: npm test
process.env.NODE_ENV = 'test';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

// Patch the CAPTCHA before the app modules destructure it: automated tests
// cannot read the generated SVG. Production code is untouched.
const captcha = require('../src/utils/captcha');
captcha.createCaptcha = () => ({ id: 'test-captcha', svg: '<svg xmlns="http://www.w3.org/2000/svg"/>' });
captcha.captchaExists = (id) => Boolean(id);
captcha.verifyCaptcha = () => true;

const { createApp } = require('../src/app');
const jwt = require('jsonwebtoken');
const { q } = require('../src/config/db');
const config = require('../src/config');
const bcrypt = require('bcryptjs');

// The suite signs in with its own administrator account so it never depends on
// (or overwrites) the password of the real CMS administrator.
const ADMIN_USER = 'api-suite-admin';
const ADMIN_PASS = 'SuiteAdmin@12345';
const ADMIN_EMAIL = 'api-suite-admin@example.com';

let server;
let base;
let cookie = '';
let csrf = '';
let token = '';
let createdFaqId = null;
let createdPageSlug = `api-test-page-${Date.now()}`;
let uploadedMediaId = null;
let feedbackId = null;
let downloadDocId = null;
let downloadMediaId = null;
let downloadMediaPath = null;

async function api(path, { method = 'GET', body, headers = {}, auth = 'session', raw = false } = {}) {
  const options = { method, headers: { Accept: 'application/json', ...headers } };
  if (raw) {
    options.body = body;
  } else if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }
  if (auth === 'session' && cookie) options.headers.Cookie = cookie;
  if (auth === 'session' && csrf && method !== 'GET') options.headers['X-CSRF-Token'] = csrf;
  if (auth === 'token' && token) options.headers.Authorization = `Bearer ${token}`;
  const res = await fetch(base + path, options);
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { res, json, status: res.status };
}

function encryptPassword(password, nonce) {
  return api('/api/auth/key').then(({ json }) => {
    const key = crypto.createPublicKey({ key: Buffer.from(json.key, 'base64'), format: 'der', type: 'spki' });
    const cipher = crypto.publicEncrypt(
      { key, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
      Buffer.from(JSON.stringify({ p: password, n: nonce }), 'utf8')
    );
    return cipher.toString('base64');
  });
}

before(async () => {
  // A dedicated administrator for this run (created directly, deleted afterwards).
  await q('DELETE FROM users WHERE username = ?', [ADMIN_USER]);
  const roles = await q("SELECT role_id FROM roles WHERE role_name = 'admin'");
  if (!roles.length) throw new Error('The admin role is missing: run npm run db:setup first.');
  await q(
    `INSERT INTO users (username, full_name, email, password_hash, role_id, is_active, must_change_password)
     VALUES (?, 'API Test Administrator', ?, ?, ?, 1, 0)`,
    [ADMIN_USER, ADMIN_EMAIL, await bcrypt.hash(ADMIN_PASS, 10), roles[0].role_id]
  );

  const app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  // Remove anything the test created.
  if (createdFaqId) await q('DELETE FROM faqs WHERE faq_id = ?', [createdFaqId]);
  await q('DELETE FROM pages WHERE slug = ?', [createdPageSlug]);
  if (uploadedMediaId) await q('DELETE FROM media_files WHERE file_id = ?', [uploadedMediaId]);
  if (feedbackId) await q('DELETE FROM feedback WHERE feedback_id = ?', [feedbackId]);
  if (downloadDocId) await q('DELETE FROM documents WHERE doc_id = ?', [downloadDocId]);
  if (downloadMediaId) await q('DELETE FROM media_files WHERE file_id = ?', [downloadMediaId]);
  if (downloadMediaPath) {
    await fs.rm(path.join(config.paths.uploadsDir, path.basename(downloadMediaPath)), { force: true }).catch(() => {});
  }
  await q("DELETE FROM assistant_logs WHERE question LIKE 'zzzqqq%' OR question = 'What is the drone policy?'");
  // Remove the suite's own administrator (sessions and password history cascade).
  await q('DELETE FROM users WHERE username = ?', [ADMIN_USER]);
  // The tracking test deletes its own page_view; bring today's summary back in
  // line with the remaining rows so the suite leaves analytics unchanged.
  await q('DELETE FROM daily_stats WHERE stat_date = UTC_DATE()');
  await q(
    `INSERT INTO daily_stats (stat_date, total_views, unique_visitors)
     SELECT UTC_DATE(), COUNT(*), COUNT(DISTINCT visitor_hash) FROM page_views WHERE DATE(viewed_at) = UTC_DATE()`
  );
  await q('DELETE FROM daily_stats WHERE stat_date = UTC_DATE() AND total_views = 0');
  server.closeAllConnections?.();
  await new Promise((resolve) => server.close(resolve));
  await require('../src/config/db').pool.end();
});

test('health and public site bundle', async () => {
  const health = await api('/api/v1/health');
  assert.equal(health.status, 200);
  assert.equal(health.json.success, true);

  // Counters shown on the home page come from these COUNT(*) values.
  const counts = await api('/api/public/counts');
  assert.equal(counts.status, 200);
  assert.ok(counts.json.organisations >= 1, 'organisations counted from the database');
  assert.ok(counts.json.policies >= 1, 'policies counted from the database');
  assert.ok(counts.json.districts >= 1, 'districts counted from the database');
  assert.equal(counts.json.orders, counts.json.documents + counts.json.tenders);
  const v1Counts = await api('/api/v1/stats/site');
  assert.equal(v1Counts.status, 200);
  assert.equal(v1Counts.json.data.districts, counts.json.districts);

  const content = await api('/api/public/content');
  assert.equal(content.status, 200);
  assert.ok(content.json.collections, 'bundle has collections');
  assert.ok(Array.isArray(content.json.collections.pages));
  assert.ok(content.json.settings.site, 'public settings present');
  assert.ok(!content.json.settings.system, 'private settings are not public');

  const etag = content.res.headers.get('etag');
  assert.ok(etag, 'bundle sends an ETag');
  const cached = await api('/api/public/content', { headers: { 'If-None-Match': etag } });
  assert.equal(cached.status, 304);
});

test('public /api/v1 reads and bilingual fallback', async () => {
  const pages = await api('/api/v1/pages');
  assert.equal(pages.status, 200);
  assert.ok(Array.isArray(pages.json.data));

  const mission = await api('/api/v1/pages/mission');
  assert.equal(mission.status, 200);
  assert.equal(typeof mission.json.data.title, 'string');
  assert.ok(mission.json.data.title.length > 0);
  const telugu = await api('/api/v1/pages/mission?lang=te');
  assert.ok(typeof telugu.json.data.title === 'string' && telugu.json.data.title.length > 0);

  const missing = await api('/api/v1/pages/does-not-exist');
  assert.equal(missing.status, 404);
  assert.equal(missing.json.success, false);
  assert.equal(missing.json.error.code, 'NOT_FOUND');

  await api('/api/v1/organisations');
  await api('/api/v1/policies');
  await api('/api/v1/documents');
  await api('/api/v1/tenders');
  await api('/api/v1/faqs');
  await api('/api/v1/events');
  await api('/api/v1/districts');
  await api('/api/v1/districts/visakhapatnam');
  await api('/api/v1/district-map');
  await api('/api/v1/connections');
  await api('/api/v1/almanac');
  await api('/api/v1/news');
  await api('/api/v1/awards');
  await api('/api/v1/contact/officers');
  await api('/api/v1/contact/office');
  await api('/api/v1/settings/public');

  const search = await api('/api/v1/search?q=drone');
  assert.equal(search.status, 200);
  assert.ok(search.json.data.length > 0, 'search finds the drone policy');
});

test('assistant answers from site content and logs unknown questions', async () => {
  const answer = await api('/api/v1/assistant/ask', {
    method: 'POST',
    body: { question: 'What is the drone policy?', lang: 'en' }
  });
  assert.equal(answer.status, 200);
  assert.equal(answer.json.success, true);
  assert.equal(answer.json.data.answered, true);
  assert.ok(answer.json.data.sources.length > 0);
  assert.ok(answer.json.data.answer.includes('Drone'));

  const unknown = await api('/api/v1/assistant/ask', {
    method: 'POST',
    body: { question: 'zzzqqq nonmatchingterm', lang: 'en' }
  });
  assert.equal(unknown.status, 200);
  assert.equal(unknown.json.data.answered, false);
});

test('page tracking and visitor counter', async () => {
  const hit = await api('/api/v1/track/view', {
    method: 'POST',
    body: { path: '/api-test', lang: 'en', newVisitor: true }
  });
  assert.equal(hit.status, 204);
  const stats = await api('/api/v1/stats/visitors');
  assert.equal(stats.status, 200);
  assert.ok(stats.json.data.total >= 0);
  await q("DELETE FROM page_views WHERE page_path = '/api-test'");
});

test('feedback submission validates and stores', async () => {
  const invalid = await api('/api/v1/feedback', {
    method: 'POST',
    body: { name: 'A', email: 'bad', message: 'short' }
  });
  assert.equal(invalid.status, 400);

  const good = await api('/api/v1/feedback', {
    method: 'POST',
    body: {
      name: 'API Tester',
      email: 'tester@example.com',
      phone: '9876543210',
      subject: 'Automated test',
      message: 'This feedback was created by the integration test suite.',
      captchaId: 'test-captcha',
      captcha: 'any'
    }
  });
  assert.equal(good.status, 201);
  assert.match(good.json.data.reference, /^FB-\d+$/);
  const row = await q('SELECT feedback_id FROM feedback WHERE email = ? ORDER BY feedback_id DESC LIMIT 1', ['tester@example.com']);
  feedbackId = row[0]?.feedback_id;
  assert.ok(feedbackId);
});

test('CMS sign-in (CAPTCHA + RSA password) and session', async () => {
  const cap = await api('/api/auth/captcha');
  assert.equal(cap.status, 200);
  const id = cap.json.id;
  const encrypted = await encryptPassword(ADMIN_PASS, id);

  const wrong = await encryptPassword('wrong-password', id);
  const failed = await api('/api/auth/login', {
    method: 'POST',
    body: { username: ADMIN_USER, password: wrong, captchaId: id, captcha: 'x' }
  });
  assert.equal(failed.status, 401);

  const login = await api('/api/auth/login', {
    method: 'POST',
    body: { username: ADMIN_USER, password: encrypted, captchaId: id, captcha: 'x' }
  });
  assert.equal(login.status, 200);
  assert.ok(login.json.user);
  assert.ok(login.json.csrf);
  csrf = login.json.csrf;
  const setCookie = login.res.headers.getSetCookie?.() || [login.res.headers.get('set-cookie')];
  cookie = setCookie[0].split(';')[0];

  const me = await api('/api/auth/me');
  assert.equal(me.json.user.username, ADMIN_USER);
});

async function signIn() {
  const cap = await api('/api/auth/captcha', { auth: 'none' });
  const login = await api('/api/auth/login', {
    method: 'POST',
    auth: 'none',
    body: { username: ADMIN_USER, password: await encryptPassword(ADMIN_PASS, cap.json.id), captchaId: cap.json.id, captcha: 'x' }
  });
  assert.equal(login.status, 200);
  const setCookie = login.res.headers.getSetCookie?.() || [login.res.headers.get('set-cookie')];
  return { cookie: setCookie[0].split(';')[0], raw: setCookie[0], csrf: login.json.csrf };
}

test('session hardening: strict cookie, hashed id, single session, idle timeout', async () => {
  const first = await signIn();
  assert.match(first.raw, /HttpOnly/i);
  assert.match(first.raw, /SameSite=Strict/i);
  assert.doesNotMatch(first.raw, /Max-Age|Expires/i, 'browser-session cookie');

  // Only the SHA-256 of the cookie value is stored.
  const id = first.cookie.split('=')[1];
  const stored = await q('SELECT session_id FROM sessions WHERE session_id = ?', [id]);
  assert.equal(stored.length, 0, 'raw session id is not in the database');
  const hashed = await q('SELECT session_id FROM sessions WHERE session_id = ?', [crypto.createHash('sha256').update(id).digest('hex')]);
  assert.equal(hashed.length, 1);

  // Signing in again ends the earlier session.
  const second = await signIn();
  const old = await api('/api/auth/me', { auth: 'none', headers: { Cookie: first.cookie } });
  assert.equal(old.json.user, null);

  // An idle session expires.
  const key = crypto.createHash('sha256').update(second.cookie.split('=')[1]).digest('hex');
  await q('UPDATE sessions SET last_seen_at = DATE_SUB(UTC_TIMESTAMP(), INTERVAL 2 HOUR) WHERE session_id = ?', [key]);
  const idle = await api('/api/auth/me', { auth: 'none', headers: { Cookie: second.cookie } });
  assert.equal(idle.json.user, null);

  // Cross-origin writes and unused HTTP methods are refused.
  const third = await signIn();
  cookie = third.cookie;
  csrf = third.csrf;
  const forged = await api('/api/admin/content/faqs', { method: 'POST', headers: { Origin: 'https://evil.example' }, body: { q: { en: 'x' }, a: { en: 'y' } } });
  assert.equal(forged.status, 403);
  const trace = await api('/api/health', { method: 'TRACE', auth: 'none' }).catch(() => ({ status: 405 }));
  assert.equal(trace.status, 405);
  const noCsrfLogout = await api('/api/auth/logout', { method: 'POST', auth: 'none', headers: { Cookie: cookie, 'X-CSRF-Token': 'wrong' } });
  assert.equal(noCsrfLogout.status, 403);
});

test('CMS schemas, dashboard and settings', async () => {
  const schemas = await api('/api/admin/schemas');
  assert.equal(schemas.status, 200);
  assert.ok(schemas.json.collections.pages);
  assert.ok(schemas.json.settings.site);
  assert.ok(schemas.json.settings.system, 'administrators can manage system settings');

  const dashboard = await api('/api/admin/dashboard');
  assert.equal(dashboard.status, 200);
  assert.ok(dashboard.json.counts.pages.total >= 1);
  assert.ok(typeof dashboard.json.visits.total === 'number');

  const home = await api('/api/admin/settings/home');
  assert.equal(home.status, 200);
  const updated = await api('/api/admin/settings/home', {
    method: 'PUT',
    body: { ...home.json.item, showAlmanac: true }
  });
  assert.equal(updated.status, 200);
});

test('CMS collection create, update, read and delete', async () => {
  const created = await api('/api/admin/content/faqs', {
    method: 'POST',
    body: {
      q: { en: 'API test question', te: 'API పరీక్ష ప్రశ్న' },
      a: { en: 'API test answer', te: 'API పరీక్ష సమాధానం' },
      _status: 'published',
      _order: 5
    }
  });
  assert.equal(created.status, 201);
  createdFaqId = Number(created.json.item.id);
  assert.ok(createdFaqId);

  const listed = await api('/api/admin/content/faqs');
  assert.ok(listed.json.items.some((item) => Number(item.id) === createdFaqId));

  const update = await api(`/api/admin/content/faqs/${createdFaqId}`, {
    method: 'PUT',
    body: { q: { en: 'API test question updated', te: '' }, a: { en: 'Updated answer', te: '' }, _status: 'draft', _order: 3 }
  });
  assert.equal(update.status, 200);
  assert.equal(update.json.item._status, 'draft');

  const single = await api(`/api/admin/content/faqs/${createdFaqId}`);
  assert.equal(single.json.item.id, String(createdFaqId));

  const removed = await api(`/api/admin/content/faqs/${createdFaqId}`, { method: 'DELETE' });
  assert.equal(removed.status, 200);
  createdFaqId = null;
});

test('CMS media upload and delete', async () => {
  const form = new FormData();
  const pdf = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<<>>\n%%EOF\n');
  form.append('file', new Blob([pdf], { type: 'application/pdf' }), 'api-test.pdf');
  const upload = await api('/api/admin/uploads', { method: 'POST', body: form, raw: true });
  assert.equal(upload.status, 201);
  assert.match(upload.json.url, /^\/uploads\//);

  const files = await api('/api/admin/uploads');
  const stored = files.json.items.find((item) => item.original_name === 'api-test.pdf');
  assert.ok(stored);
  uploadedMediaId = stored.id;

  const removed = await api(`/api/admin/uploads/${uploadedMediaId}`, { method: 'DELETE' });
  assert.equal(removed.status, 200);
  uploadedMediaId = null;
});

test('v1 admin login, generic resource CRUD and publish status', async () => {
  const login = await api('/api/v1/admin/auth/login', {
    method: 'POST',
    auth: 'none',
    body: { email: ADMIN_EMAIL, password: ADMIN_PASS }
  });
  assert.equal(login.status, 200);
  token = login.json.data.token;
  assert.ok(token);

  const payload = jwt.decode(token);
  assert.ok(payload.sub);

  const unauthorised = await api('/api/v1/admin/users', { auth: 'none' });
  assert.equal(unauthorised.status, 401);

  const users = await api('/api/v1/admin/users', { auth: 'token' });
  assert.equal(users.status, 200);
  assert.ok(users.json.data.some((user) => user.username === ADMIN_USER));

  const create = await api('/api/v1/admin/pages', {
    method: 'POST',
    auth: 'token',
    body: {
      slug: createdPageSlug,
      section: 'about',
      title_en: 'API test page',
      title_te: 'API పరీక్ష పేజీ',
      body_en: 'Created by the integration test suite.',
      status: 'draft'
    }
  });
  assert.equal(create.status, 201);
  const pageId = create.json.data.page_id;
  assert.ok(pageId);

  const draft = await api(`/api/v1/pages/${createdPageSlug}`);
  assert.equal(draft.status, 404, 'drafts are not public');

  const publish = await api(`/api/v1/admin/pages/${pageId}/status`, {
    method: 'PATCH',
    auth: 'token',
    body: { status: 'published' }
  });
  assert.equal(publish.status, 200);

  const published = await api(`/api/v1/pages/${createdPageSlug}`);
  assert.equal(published.status, 200);
  assert.equal(published.json.data.title, 'API test page');

  const update = await api(`/api/v1/admin/pages/${pageId}`, {
    method: 'PUT',
    auth: 'token',
    body: { title_te: 'నవీకరించిన పేజీ' }
  });
  assert.equal(update.status, 200);
  assert.equal(update.json.data.title_en, 'API test page', 'partial update keeps other columns');

  const del = await api(`/api/v1/admin/pages/${pageId}`, { method: 'DELETE', auth: 'token' });
  assert.equal(del.status, 200);
});

test('document download increments the counter', async () => {
  const form = new FormData();
  const pdf = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<<>>\n%%EOF\n');
  form.append('file', new Blob([pdf], { type: 'application/pdf' }), 'download-test.pdf');
  const upload = await api('/api/v1/admin/media/upload', { method: 'POST', auth: 'token', body: form, raw: true });
  assert.equal(upload.status, 201);
  downloadMediaId = upload.json.data.file_id;
  downloadMediaPath = upload.json.data.file_path;

  const document = await api('/api/v1/admin/documents', {
    method: 'POST',
    auth: 'token',
    body: {
      category_id: 1,
      doc_number: 'API/TEST/1',
      title_en: 'Download test document',
      doc_date: '2026-01-01',
      file_id: downloadMediaId,
      status: 'published'
    }
  });
  assert.equal(document.status, 201);
  downloadDocId = document.json.data.doc_id;

  const res = await fetch(`${base}/api/v1/documents/${downloadDocId}/download`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type') || '', /pdf/);
  const row = await q('SELECT download_count FROM documents WHERE doc_id = ?', [downloadDocId]);
  assert.equal(row[0].download_count, 1);
});

test('v1 admin stats, audit log and reindex', async () => {
  const summary = await api('/api/v1/admin/stats/summary', { auth: 'token' });
  assert.equal(summary.status, 200);
  assert.ok(typeof summary.json.data.visitors === 'number');

  const audit = await api('/api/v1/admin/audit-log?limit=5', { auth: 'token' });
  assert.equal(audit.status, 200);
  assert.ok(Array.isArray(audit.json.data));

  const reindex = await api('/api/v1/admin/search/reindex', { method: 'POST', auth: 'token', body: {} });
  assert.equal(reindex.status, 200);
  assert.equal(reindex.json.data.ok, true);
});

test('role guard blocks a viewer from writing', async () => {
  const username = `viewer${Date.now().toString().slice(-6)}`;
  const created = await api('/api/v1/admin/users', {
    method: 'POST',
    auth: 'token',
    body: {
      username,
      full_name: 'API Test Viewer',
      email: `${username}@example.com`,
      role: 'viewer',
      password: 'ViewerPass@12345'
    }
  });
  assert.equal(created.status, 201);

  const login = await api('/api/v1/admin/auth/login', {
    method: 'POST',
    auth: 'none',
    body: { email: `${username}@example.com`, password: 'ViewerPass@12345' }
  });
  assert.equal(login.status, 200);
  const viewerToken = login.json.data.token;

  const write = await api('/api/v1/admin/faqs', {
    method: 'POST',
    auth: 'none',
    headers: { Authorization: `Bearer ${viewerToken}` },
    body: { question_en: 'Should not be created', answer_en: 'Blocked' }
  });
  assert.equal(write.status, 403);

  const users = await api('/api/v1/admin/users', { auth: 'token' });
  const viewer = users.json.data.find((user) => user.username === username);
  await api(`/api/v1/admin/users/${viewer.id}`, { method: 'DELETE', auth: 'token' });
});

test('CMS password change through the sign-in endpoint (frontend flow)', async () => {
  const username = `editor${Date.now().toString().slice(-6)}`;
  const created = await api('/api/v1/admin/users', {
    method: 'POST',
    auth: 'token',
    body: {
      username,
      full_name: 'API Test Editor',
      email: `${username}@example.com`,
      role: 'editor',
      password: 'EditorPass@1234'
    }
  });
  assert.equal(created.status, 201);

  const cap = await api('/api/auth/captcha');
  const id = cap.json.id;
  const encrypted = await encryptPassword('EditorPass@1234', id);
  const login = await api('/api/auth/login', {
    method: 'POST',
    auth: 'none',
    body: { username, password: encrypted, captchaId: id, captcha: 'x' }
  });
  assert.equal(login.status, 200);
  const editorCookie = (login.res.headers.getSetCookie?.() || [login.res.headers.get('set-cookie')])[0].split(';')[0];
  const editorCsrf = login.json.csrf;

  const current = await encryptPassword('EditorPass@1234', editorCsrf);
  const next = await encryptPassword('EditorPass@5678', editorCsrf);
  const changed = await api('/api/auth/login', {
    method: 'POST',
    auth: 'none',
    headers: { Cookie: editorCookie, 'X-CSRF-Token': editorCsrf },
    body: { currentPassword: current, newPassword: next }
  });
  assert.equal(changed.status, 200);
  assert.ok(changed.json.csrf);

  const cap2 = await api('/api/auth/captcha');
  const id2 = cap2.json.id;
  const encrypted2 = await encryptPassword('EditorPass@5678', id2);
  const relogin = await api('/api/auth/login', {
    method: 'POST',
    auth: 'none',
    body: { username, password: encrypted2, captchaId: id2, captcha: 'x' }
  });
  assert.equal(relogin.status, 200);

  const users = await api('/api/v1/admin/users', { auth: 'token' });
  const editor = users.json.data.find((user) => user.username === username);
  await api(`/api/v1/admin/users/${editor.id}`, { method: 'DELETE', auth: 'token' });
});

test('logout invalidates the CMS session', async () => {
  const logout = await api('/api/auth/logout', { method: 'POST' });
  assert.equal(logout.status, 200);
  const me = await api('/api/auth/me', { auth: 'none', headers: { Cookie: cookie } });
  assert.equal(me.json.user, null);
});
