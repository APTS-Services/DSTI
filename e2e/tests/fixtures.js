// Runs the real API (on the dsti_test database) and a static server for the
// built website inside the test worker, so the tests can read CAPTCHA answers.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { test as base, expect } from '@playwright/test';
import { API_PORT, E2E_ENV, ROOT, SITE_PORT } from './env.js';

Object.assign(process.env, E2E_ENV);
const require = createRequire(import.meta.url);

export const ADMIN_PASSWORD = 'E2e!Secure#2026';
const SITE_DIR = path.join(ROOT, 'e2e', '.site');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.json': 'application/json', '.config': 'text/plain' };

/** Static host for the built site with the single-page-app fallback; search-engine files come from the API. */
function siteServer() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (/^\/(sitemap\.xml|robots\.txt|uploads\/)/.test(url.pathname)) {
      const upstream = http.request({ port: API_PORT, path: req.url, method: req.method, headers: req.headers }, (r) => { res.writeHead(r.statusCode, r.headers); r.pipe(res); });
      return req.pipe(upstream);
    }
    let file = path.join(SITE_DIR, decodeURIComponent(url.pathname));
    if (!file.startsWith(SITE_DIR) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(SITE_DIR, 'index.html');
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    return fs.createReadStream(file).pipe(res);
  });
}

export const test = base.extend({
  server: [async ({}, use) => {
    // Record each CAPTCHA's answer from the generated image before the app
    // modules take their reference to createCaptcha.
    const captcha = require(path.join(ROOT, 'backend/src/utils/captcha.js'));
    const answers = new Map();
    const original = captcha.createCaptcha;
    captcha.createCaptcha = () => {
      const result = original();
      answers.set(result.id, [...result.svg.matchAll(/>([A-Z0-9])<\/text>/g)].map((m) => m[1]).join(''));
      return result;
    };
    const { createApp } = require(path.join(ROOT, 'backend/src/app.js'));
    const db = require(path.join(ROOT, 'backend/src/config/db.js'));
    const api = createApp().listen(API_PORT, '127.0.0.1');
    const site = siteServer().listen(SITE_PORT);
    await use({ peek: (id) => answers.get(id) });
    api.closeAllConnections?.();
    site.closeAllConnections?.();
    await new Promise((r) => api.close(r));
    await new Promise((r) => site.close(r));
    await db.pool.end();
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
