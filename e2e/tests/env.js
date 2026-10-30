// Settings shared by the global set-up and the test fixtures.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const SITE_PORT = 5055;
export const API_PORT = 5056;

/** backend/.env values (DB credentials, JWT secret), without overriding the shell. */
function backendEnv() {
  const file = path.join(ROOT, 'backend', '.env');
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m) out[m[1]] = m[2].replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
  }
  return out;
}

export const E2E_ENV = {
  ...backendEnv(),
  NODE_ENV: 'test',
  DB_NAME: process.env.TEST_DB_NAME || 'dsti_test',
  ADMIN_USERNAME: 'admin',
  ADMIN_PASSWORD: 'Init!alPass2026',
  UPLOAD_DIR: path.join(ROOT, 'backend', 'uploads-e2e'),
  PUBLIC_ORIGIN: `http://localhost:${SITE_PORT}`,
  CORS_ORIGIN: `http://localhost:${SITE_PORT}`,
  API_ORIGIN: `http://localhost:${API_PORT}`,
};
