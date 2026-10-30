// Builds the website against the test API and resets the dsti_test database
// (schema, seed content and a first administrator) before the browser tests.
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { E2E_ENV, ROOT } from './tests/env.js';

const require = createRequire(import.meta.url);

export default async function globalSetup() {
  const env = { ...process.env, ...E2E_ENV };
  const backend = path.join(ROOT, 'backend');
  const run = (script, args = []) => execFileSync(process.execPath, [script, ...args], { cwd: backend, env, stdio: 'inherit' });

  run('src/db/setup.js');
  // A clean slate: the seed creates the administrator only when none exists.
  const mysql = require(path.join(backend, 'node_modules', 'mysql2', 'promise'));
  const db = await mysql.createConnection({ host: env.DB_HOST, port: Number(env.DB_PORT) || 3306, user: env.DB_USER, password: env.DB_PASS ?? env.DB_PASSWORD ?? '', database: env.DB_NAME });
  for (const table of ['sessions', 'password_history', 'feedback', 'audit_log', 'page_views', 'daily_stats']) await db.query(`DELETE FROM ${table}`);
  await db.query('DELETE FROM users');
  await db.end();
  run('src/db/seed.js', ['--reset']);

  if (!process.env.E2E_SKIP_BUILD) {
    execFileSync('npx', ['vite', 'build', '--outDir', path.join(ROOT, 'e2e', '.site'), '--emptyOutDir'], {
      cwd: path.join(ROOT, 'frontend'), env: { ...process.env, VITE_API_BASE_URL: E2E_ENV.API_ORIGIN }, stdio: 'inherit',
    });
  }
}

