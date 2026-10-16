// Central configuration, read once from the environment.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const here = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(here, '../..');

// Tests use .env.test when present, otherwise .env (with DB_NAME overridden by the test runner).
const envFile = process.env.NODE_ENV === 'test' && fs.existsSync(path.join(ROOT, '.env.test')) ? '.env.test' : '.env';
dotenv.config({ path: path.join(ROOT, envFile), quiet: true });

const int = (v, d) => {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? d : n;
};
const list = (v) => (v || '').split(',').map((s) => s.trim()).filter(Boolean);

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  port: int(process.env.PORT, 5000),
  publicOrigin: (process.env.PUBLIC_ORIGIN || 'http://localhost:5173').replace(/\/$/, ''),
  allowedHosts: list(process.env.ALLOWED_HOSTS),
  trustProxy: int(process.env.TRUST_PROXY, 0),
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: int(process.env.DB_PORT, 3306),
    user: process.env.DB_USER || 'dsti_app',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dsti',
  },
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || '',
  },
  session: {
    idleMinutes: int(process.env.SESSION_IDLE_MINUTES, 20),
    absoluteHours: int(process.env.SESSION_ABSOLUTE_HOURS, 8),
  },
  uploadDir: path.resolve(ROOT, process.env.UPLOAD_DIR || './uploads'),
  maxUploadBytes: int(process.env.MAX_UPLOAD_MB, 10) * 1024 * 1024,
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: int(process.env.SMTP_PORT, 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || 'no-reply@dsti.ap.gov.in',
  },
  frontendDist: path.resolve(ROOT, process.env.FRONTEND_DIST || '../frontend/dist'),
};

export default env;
