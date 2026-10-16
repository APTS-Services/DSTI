// Functional and security tests for the DSTI API.
// Requires a MySQL/MariaDB test database (default name: dsti_test). See README.
process.env.NODE_ENV = 'test';
process.env.DB_NAME = process.env.TEST_DB_NAME || 'dsti_test';
process.env.ADMIN_USERNAME = 'admin';
process.env.ADMIN_PASSWORD = 'Init!alPass2026';
process.env.UPLOAD_DIR = './uploads-test';

const { test, before, after, describe } = await import('node:test');
const assert = (await import('node:assert/strict')).default;
const fs = await import('node:fs');
const request = (await import('supertest')).default;
const { createApp } = await import('../src/app.js');
const { seed, placeholderPdf } = await import('../src/db/seed.js');
const { closePool, query } = await import('../src/db/pool.js');
const { peekCaptcha } = await import('../src/utils/captcha.js');
const { encryptSecret } = await import('../src/utils/security.js');
const { bumpVersion } = await import('../src/content/store.js');
const { default: env } = await import('../src/config/env.js');

const app = createApp();
const ADMIN_NEW_PASSWORD = 'Str0ng!Secure#26';

async function captcha(agent) {
  const res = await agent.get('/api/auth/captcha').expect(200);
  assert.match(res.body.image, /^data:image\/svg\+xml;base64,/);
  return { id: res.body.id, answer: peekCaptcha(res.body.id) };
}

async function login(agent, username, password) {
  const c = await captcha(agent);
  return agent.post('/api/auth/login').send({ username, password: encryptSecret(password, c.id), captchaId: c.id, captcha: c.answer });
}

/** Signs in and returns { agent, csrf }. */
async function signIn(username, password) {
  const agent = request.agent(app);
  const res = await login(agent, username, password);
  assert.equal(res.status, 200, JSON.stringify(res.body));
  return { agent, csrf: res.body.csrf, user: res.body.user };
}

before(async () => {
  await query('SET FOREIGN_KEY_CHECKS = 0').catch(() => {});
  for (const t of ['sessions', 'password_history', 'users', 'content', 'uploads', 'feedback', 'visits', 'page_views', 'audit_log']) {
    await query(`DROP TABLE IF EXISTS ${t}`);
  }
  await query('SET FOREIGN_KEY_CHECKS = 1');
  await seed({ reset: true, quiet: true });
});

after(async () => {
  fs.rmSync(env.uploadDir, { recursive: true, force: true });
  await closePool();
});

describe('public website API', () => {
  test('serves all published content in one bundle with ETag revalidation', async () => {
    const res = await request(app).get('/api/public/content').expect(200);
    assert.equal(res.body.collections.districts.length, 26, 'all 26 districts');
    assert.equal(res.body.collections.policies.length, 9);
    assert.ok(res.body.settings.site.name.en.includes('Science'));
    assert.equal(res.body.settings.system, undefined, 'private settings are not public');
    await request(app).get('/api/public/content').set('If-None-Match', res.headers.etag).expect(304);
  });

  test('sends strict security headers and hides the framework', async () => {
    const res = await request(app).get('/api/public/content');
    assert.match(res.headers['content-security-policy'], /default-src 'self'/);
    assert.match(res.headers['content-security-policy'], /script-src 'self'(;|$)/);
    assert.equal(res.headers['x-frame-options'], 'DENY');
    assert.equal(res.headers['x-content-type-options'], 'nosniff');
    assert.ok(res.headers['permissions-policy']);
    assert.equal(res.headers['x-powered-by'], undefined);
  });

  test('rejects TRACE / OPTIONS and unknown API routes', async () => {
    await request(app).trace('/api/public/content').expect(405);
    await request(app).options('/api/public/content').expect(405);
    const res = await request(app).get('/api/does-not-exist').expect(404);
    assert.deepEqual(res.body, { error: 'Not found' });
  });

  test('publishes sitemap.xml and robots.txt', async () => {
    const sm = await request(app).get('/sitemap.xml').expect(200);
    assert.match(sm.text, /<loc>.*\/policies\/drone<\/loc>/);
    const robots = await request(app).get('/robots.txt').expect(200);
    assert.match(robots.text, /Disallow: \/admin/);
  });

  test('serves seeded PDF documents with nosniff', async () => {
    const res = await request(app).get('/uploads/seed/go/GO-42-2026.pdf').expect(200);
    assert.equal(res.headers['content-type'], 'application/pdf');
    assert.equal(res.headers['x-content-type-options'], 'nosniff');
    await request(app).get('/uploads/../src/app.js').expect(404);
  });

  test('feedback requires a valid CAPTCHA and validates input', async () => {
    const agent = request.agent(app);
    let c = await captcha(agent);
    await agent.post('/api/public/feedback').send({ name: 'Ravi', email: 'ravi@example.com', message: 'Hello there team', captchaId: c.id, captcha: 'wrong' }).expect(400);
    // A CAPTCHA can be used only once.
    await agent.post('/api/public/feedback').send({ name: 'Ravi', email: 'ravi@example.com', message: 'Hello there team', captchaId: c.id, captcha: c.answer }).expect(400);

    c = await captcha(agent);
    const bad = await agent.post('/api/public/feedback').send({ name: '<script>', email: 'nope', message: 'short', captchaId: c.id, captcha: c.answer }).expect(400);
    assert.ok(bad.body.fields.email && bad.body.fields.message && bad.body.fields.name);

    c = await captcha(agent);
    const ok = await agent.post('/api/public/feedback').send({ name: 'Ravi Kumar', email: 'ravi@example.com', phone: '9876543210', subject: 'Website', message: 'Very useful <b>website</b>, thank you.', captchaId: c.id, captcha: c.answer.toUpperCase() }).expect(201);
    assert.match(ok.body.reference, /^FB-\d{5}$/);
    const [row] = await query('SELECT message FROM feedback ORDER BY id DESC LIMIT 1');
    assert.equal(row.message, 'Very useful website, thank you.', 'markup is stripped');
  });

  test('counts visitors without cookies', async () => {
    await request(app).post('/api/public/hit').send({ path: '/about', newVisitor: true }).expect(204);
    await request(app).post('/api/public/hit').send({ path: '/about' }).expect(204);
    await request(app).post('/api/public/hit').send({ path: '/admin/users', newVisitor: true }).expect(204);
    const stats = await request(app).get('/api/public/stats').expect(200);
    assert.equal(stats.body.today, 1);
    const [pv] = await query("SELECT SUM(hits) AS h FROM page_views WHERE path = '/about'");
    assert.equal(Number(pv.h), 2);
  });
});

describe('authentication', () => {
  test('rejects a wrong CAPTCHA, plain-text passwords and wrong passwords with one generic message', async () => {
    const agent = request.agent(app);
    let c = await captcha(agent);
    let res = await agent.post('/api/auth/login').send({ username: 'admin', password: encryptSecret('Init!alPass2026', c.id), captchaId: c.id, captcha: 'zzzzz' });
    assert.equal(res.status, 401);
    c = await captcha(agent);
    res = await agent.post('/api/auth/login').send({ username: 'admin', password: 'Init!alPass2026', captchaId: c.id, captcha: c.answer });
    assert.equal(res.status, 401, 'unencrypted password is refused');
    res = await login(agent, 'admin', 'wrong-password');
    assert.equal(res.status, 401);
    res = await login(agent, 'nobody', 'whatever');
    assert.equal(res.status, 401);
    assert.equal(res.body.error, 'Invalid username, password or CAPTCHA.');
  });

  test('replayed ciphertext from an old CAPTCHA is refused', async () => {
    const agent = request.agent(app);
    const c1 = await captcha(agent);
    const blob = encryptSecret('Init!alPass2026', c1.id);
    const c2 = await captcha(agent);
    const res = await agent.post('/api/auth/login').send({ username: 'admin', password: blob, captchaId: c2.id, captcha: c2.answer });
    assert.equal(res.status, 401);
  });

  test('forces the initial password to be changed and enforces the password policy', async () => {
    const { agent, csrf, user } = await signIn('admin', 'Init!alPass2026');
    assert.equal(user.mustChangePassword, true);
    const blocked = await agent.get('/api/admin/schemas');
    assert.equal(blocked.status, 403);
    assert.equal(blocked.body.code, 'PASSWORD_CHANGE_REQUIRED');

    let res = await agent.post('/api/auth/change-password').set('X-CSRF-Token', csrf)
      .send({ currentPassword: encryptSecret('Init!alPass2026', csrf), newPassword: encryptSecret('weakpass', csrf) });
    assert.equal(res.status, 400);
    res = await agent.post('/api/auth/change-password').set('X-CSRF-Token', csrf)
      .send({ currentPassword: encryptSecret('Init!alPass2026', csrf), newPassword: encryptSecret('Init!alPass2026', csrf) });
    assert.equal(res.status, 400, 'cannot reuse the current password');
    res = await agent.post('/api/auth/change-password').set('X-CSRF-Token', csrf)
      .send({ currentPassword: encryptSecret('Init!alPass2026', csrf), newPassword: encryptSecret(ADMIN_NEW_PASSWORD, csrf) });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    await agent.get('/api/admin/schemas').set('X-CSRF-Token', res.body.csrf).expect(200);
  });

  test('session cookie is httpOnly and SameSite=Strict', async () => {
    const agent = request.agent(app);
    const res = await login(agent, 'admin', ADMIN_NEW_PASSWORD);
    const setCookie = res.headers['set-cookie'].join(';');
    assert.match(setCookie, /HttpOnly/i);
    assert.match(setCookie, /SameSite=Strict/i);
    assert.equal(res.headers['cache-control'], 'no-store, max-age=0');
  });

  test('signing in again ends the previous session; logout invalidates the session', async () => {
    const first = await signIn('admin', ADMIN_NEW_PASSWORD);
    const second = await signIn('admin', ADMIN_NEW_PASSWORD);
    assert.equal((await first.agent.get('/api/auth/me').expect(200)).body.user, null);
    await first.agent.get('/api/admin/schemas').expect(401);
    await second.agent.post('/api/auth/logout').set('X-CSRF-Token', second.csrf).expect(200);
    assert.equal((await second.agent.get('/api/auth/me').expect(200)).body.user, null);
  });

  test('locks an account after 5 failed attempts', async () => {
    const hash = (await query("SELECT password_hash FROM users WHERE username = 'admin'"))[0].password_hash;
    await query("INSERT INTO users (username, full_name, role, password_hash, must_change_password) VALUES ('victim', 'Victim', 'Editor', ?, 0)", [hash]);
    const agent = request.agent(app);
    for (let i = 0; i < 5; i += 1) assert.equal((await login(agent, 'victim', 'bad')).status, 401);
    const res = await login(agent, 'victim', ADMIN_NEW_PASSWORD);
    assert.equal(res.status, 423);
    await query("DELETE FROM users WHERE username = 'victim'");
  });
});

describe('CMS', () => {
  let admin;
  before(async () => {
    admin = await signIn('admin', ADMIN_NEW_PASSWORD);
  });

  test('requires a CSRF token for every change', async () => {
    await admin.agent.post('/api/admin/content/news').send({ date: '2026-10-10', title: { en: 'x' } }).expect(403);
    await admin.agent.post('/api/admin/content/news').set('X-CSRF-Token', 'f'.repeat(64)).send({ date: '2026-10-10', title: { en: 'x' } }).expect(403);
  });

  test('blocks cross-site requests by Origin', async () => {
    await admin.agent.post('/api/admin/content/news').set('Origin', 'https://evil.example').set('X-CSRF-Token', admin.csrf).send({}).expect(403);
  });

  test('creates, publishes, edits and deletes content that appears on the public site', async () => {
    const created = await admin.agent.post('/api/admin/content/news').set('X-CSRF-Token', admin.csrf)
      .send({ date: '2026-10-15', title: { en: 'Test headline <script>alert(1)</script>', te: 'పరీక్ష' }, category: 'News', link: '/tenders', _status: 'published' })
      .expect(201);
    const key = created.body.item.id;
    assert.equal(created.body.item.title.en, 'Test headline alert(1)');
    let pub = await request(app).get('/api/public/content');
    assert.ok(pub.body.collections.news.some((n) => n.id === key));

    await admin.agent.put(`/api/admin/content/news/${key}`).set('X-CSRF-Token', admin.csrf)
      .send({ date: '2026-10-15', title: { en: 'Edited', te: '' }, category: 'News', _status: 'draft' }).expect(200);
    pub = await request(app).get('/api/public/content');
    assert.ok(!pub.body.collections.news.some((n) => n.id === key), 'drafts are hidden from the public');

    await admin.agent.delete(`/api/admin/content/news/${key}`).set('X-CSRF-Token', admin.csrf).expect(200);
    await admin.agent.get(`/api/admin/content/news/${key}`).set('X-CSRF-Token', admin.csrf).expect(404);
  });

  test('validates field types and rejects dangerous links', async () => {
    const res = await admin.agent.post('/api/admin/content/news').set('X-CSRF-Token', admin.csrf)
      .send({ date: 'not-a-date', title: { en: '' }, link: 'javascript:alert(1)', image: 'https://evil.example/x.png' })
      .expect(400);
    const text = res.body.errors.join(' ');
    assert.match(text, /Date/);
    assert.match(text, /Headline is required/);
    assert.match(text, /Link must be/);
    assert.match(text, /must be an uploaded file/);
    await admin.agent.get('/api/admin/content/no-such-thing').set('X-CSRF-Token', admin.csrf).expect(404);
  });

  test('prevents duplicate identifiers and supports renaming', async () => {
    await admin.agent.post('/api/admin/content/policies').set('X-CSRF-Token', admin.csrf).send({ id: 'drone', name: { en: 'Dup' } }).expect(409);
    const p = (await admin.agent.get('/api/admin/content/policies/space').set('X-CSRF-Token', admin.csrf).expect(200)).body.item;
    await admin.agent.put('/api/admin/content/policies/space').set('X-CSRF-Token', admin.csrf).send({ ...p, id: 'space-tech' }).expect(200);
    await admin.agent.get('/api/admin/content/policies/space-tech').set('X-CSRF-Token', admin.csrf).expect(200);
    await admin.agent.put('/api/admin/content/policies/space-tech').set('X-CSRF-Token', admin.csrf).send({ ...p, id: 'space' }).expect(200);
  });

  test('updates settings and the change is visible publicly', async () => {
    const cur = (await admin.agent.get('/api/admin/settings/contact').set('X-CSRF-Token', admin.csrf).expect(200)).body.item;
    await admin.agent.put('/api/admin/settings/contact').set('X-CSRF-Token', admin.csrf).send({ ...cur, phone: '+91 863 000 0000' }).expect(200);
    const pub = await request(app).get('/api/public/content');
    assert.equal(pub.body.settings.contact.phone, '+91 863 000 0000');
  });

  test('accepts genuine uploads and rejects disguised or dangerous files', async () => {
    const pdf = placeholderPdf('Upload test');
    const ok = await admin.agent.post('/api/admin/uploads').set('X-CSRF-Token', admin.csrf).attach('file', pdf, 'order.pdf').expect(201);
    assert.match(ok.body.url, /^\/uploads\/[a-f0-9]{32}\.pdf$/);
    await request(app).get(ok.body.url).expect(200).expect('content-type', 'application/pdf');

    await admin.agent.post('/api/admin/uploads').set('X-CSRF-Token', admin.csrf).attach('file', Buffer.from('MZ fake exe'), 'order.pdf').expect(400);
    await admin.agent.post('/api/admin/uploads').set('X-CSRF-Token', admin.csrf).attach('file', Buffer.from('<svg onload=alert(1)>'), 'logo.svg').expect(400);
    await admin.agent.post('/api/admin/uploads').set('X-CSRF-Token', admin.csrf).attach('file', pdf, 'shell.php.pdf').expect(400);
    const list = await admin.agent.get('/api/admin/uploads').set('X-CSRF-Token', admin.csrf).expect(200);
    assert.equal(list.body.items.length, 1);
  });

  test('reads feedback, analytics, users and audit log', async () => {
    const fb = await admin.agent.get('/api/admin/feedback').set('X-CSRF-Token', admin.csrf).expect(200);
    assert.ok(fb.body.items.length >= 1);
    await admin.agent.patch(`/api/admin/feedback/${fb.body.items[0].id}`).set('X-CSRF-Token', admin.csrf).send({ status: 'resolved' }).expect(200);
    const an = await admin.agent.get('/api/admin/analytics').set('X-CSRF-Token', admin.csrf).expect(200);
    assert.ok(an.body.totals.pageViews >= 2);
    const dash = await admin.agent.get('/api/admin/dashboard').set('X-CSRF-Token', admin.csrf).expect(200);
    assert.ok(dash.body.counts.tenders.total > 0);
    const audit = await admin.agent.get('/api/admin/audit').set('X-CSRF-Token', admin.csrf).expect(200);
    assert.ok(audit.body.items.some((a) => a.action === 'LOGIN'));
    assert.ok(audit.body.items.some((a) => a.action === 'LOGIN_FAILED'));
  });

  test('role-based access: editors draft, publishers publish, only admins manage users', async () => {
    await admin.agent.post('/api/admin/users').set('X-CSRF-Token', admin.csrf)
      .send({ username: 'editor1', full_name: 'Content Editor', role: 'Editor', password: encryptSecret('weak', admin.csrf) }).expect(400);
    await admin.agent.post('/api/admin/users').set('X-CSRF-Token', admin.csrf)
      .send({ username: 'editor1', full_name: 'Content Editor', role: 'Editor', password: encryptSecret('Edit0r!Pass26', admin.csrf) }).expect(201);
    await admin.agent.post('/api/admin/users').set('X-CSRF-Token', admin.csrf)
      .send({ username: 'editor1', full_name: 'Dup', role: 'Editor', password: encryptSecret('Edit0r!Pass26', admin.csrf) }).expect(409);

    const ed = await signIn('editor1', 'Edit0r!Pass26');
    const res = await ed.agent.post('/api/auth/change-password').set('X-CSRF-Token', ed.csrf)
      .send({ currentPassword: encryptSecret('Edit0r!Pass26', ed.csrf), newPassword: encryptSecret('N3w!EditorPass', ed.csrf) }).expect(200);
    const csrf = res.body.csrf;

    const item = await ed.agent.post('/api/admin/content/faqs').set('X-CSRF-Token', csrf)
      .send({ q: { en: 'Editor question?' }, a: { en: 'Answer.' }, _status: 'published' }).expect(201);
    assert.equal(item.body.item._status, 'draft', 'editors cannot publish');
    await ed.agent.delete(`/api/admin/content/faqs/${item.body.item.id}`).set('X-CSRF-Token', csrf).expect(403);
    await ed.agent.get('/api/admin/users').set('X-CSRF-Token', csrf).expect(403);
    await ed.agent.get('/api/admin/feedback').set('X-CSRF-Token', csrf).expect(403);
    await ed.agent.get('/api/admin/settings/system').set('X-CSRF-Token', csrf).expect(403);
    await ed.agent.get('/api/admin/backup').set('X-CSRF-Token', csrf).expect(403);
    const schemas = await ed.agent.get('/api/admin/schemas').set('X-CSRF-Token', csrf).expect(200);
    assert.equal(schemas.body.settings.site, undefined);

    await admin.agent.delete(`/api/admin/content/faqs/${item.body.item.id}`).set('X-CSRF-Token', admin.csrf).expect(200);
  });

  test('admin cannot delete or demote themselves', async () => {
    const me = (await admin.agent.get('/api/auth/me')).body.user;
    await admin.agent.delete(`/api/admin/users/${me.id}`).set('X-CSRF-Token', admin.csrf).expect(400);
    await admin.agent.put(`/api/admin/users/${me.id}`).set('X-CSRF-Token', admin.csrf).send({ full_name: 'Admin', role: 'Editor' }).expect(400);
  });

  test('exports and restores a full content backup', async () => {
    const backup = (await admin.agent.get('/api/admin/backup').set('X-CSRF-Token', admin.csrf).expect(200)).body;
    assert.equal(backup.format, 'dsti-content-backup');
    const before = backup.items.length;
    await query("DELETE FROM content WHERE collection = 'districts'");
    bumpVersion();
    let pub = await request(app).get('/api/public/content');
    assert.equal(pub.body.collections.districts.length, 0);
    const res = await admin.agent.post('/api/admin/restore').set('X-CSRF-Token', admin.csrf).send(backup).expect(200);
    assert.equal(res.body.restored, before);
    pub = await request(app).get('/api/public/content');
    assert.equal(pub.body.collections.districts.length, 26);
    await admin.agent.post('/api/admin/restore').set('X-CSRF-Token', admin.csrf).send({ hello: 'world' }).expect(400);
  });
});
