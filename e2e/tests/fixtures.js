// Starts the real backend (serving the production frontend build) inside the
// test worker, on a dedicated test database, so tests can read CAPTCHA answers.
import { test as base, expect } from '@playwright/test';

process.env.NODE_ENV = 'test';
process.env.DB_NAME = process.env.TEST_DB_NAME || 'dsti_test';
process.env.ADMIN_USERNAME = 'admin';
process.env.ADMIN_PASSWORD = 'Init!alPass2026';
process.env.UPLOAD_DIR = './uploads-e2e';
process.env.PUBLIC_ORIGIN = 'http://localhost:5055';

export const ADMIN_PASSWORD = 'E2e!Secure#2026';

export const test = base.extend({
  server: [async ({}, use) => {
    const { query, closePool } = await import('../../backend/src/db/pool.js');
    const { seed } = await import('../../backend/src/db/seed.js');
    const { createApp } = await import('../../backend/src/app.js');
    const captcha = await import('../../backend/src/utils/captcha.js');
    for (const t of ['sessions', 'password_history', 'users', 'content', 'uploads', 'feedback', 'visits', 'page_views', 'audit_log']) {
      await query('SET FOREIGN_KEY_CHECKS = 0');
      await query(`DROP TABLE IF EXISTS ${t}`);
    }
    await query('SET FOREIGN_KEY_CHECKS = 1');
    await seed({ reset: true, quiet: true });
    const server = createApp().listen(5055);
    await use({ peek: captcha.peekCaptcha, query });
    server.close();
    await closePool();
    const { default: env } = await import('../../backend/src/config/env.js');
    const fs = await import('node:fs');
    fs.rmSync(env.uploadDir, { recursive: true, force: true });
  }, { scope: 'worker', auto: true }],
});

/** Collects console errors and CSP violations for a page. */
export function watchErrors(page) {
  const errors = [];
  // HTTP 4xx responses deliberately triggered by validation tests are not script errors.
  page.on('console', (m) => { if (m.type() === 'error' && !/status of 4\d\d/.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

/** Waits for the CAPTCHA request on the page and returns its answer. */
export async function solveCaptcha(page, server, trigger) {
  const [res] = await Promise.all([page.waitForResponse((r) => r.url().includes('/api/auth/captcha')), trigger()]);
  const { id } = await res.json();
  return server.peek(id);
}

export { expect };
