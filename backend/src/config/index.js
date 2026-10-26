// src/config/index.js — central configuration hub.
// Loads .env once, validates required variables and exports a single object.
require('dotenv').config();
const path = require('path');
const logger = require('../utils/logger');

const env = process.env.NODE_ENV || 'development';

const config = {
  env,
  isProduction: env === 'production',
  port: Number(process.env.PORT) || 5000,
  host: process.env.HOST || '127.0.0.1',
  publicOrigin:
    process.env.PUBLIC_ORIGIN ||
    (process.env.CORS_ORIGIN || '').split(',')[0].trim() ||
    `http://${process.env.HOST || '127.0.0.1'}:${process.env.PORT || 5000}`,
  trustProxy: process.env.TRUST_PROXY === 'true',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  sessionTtlDays: Number(process.env.SESSION_TTL_DAYS) || 1,
  corsOrigins: (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    charset: 'utf8mb4_unicode_ci',
    // Return DATE/DATETIME columns as 'YYYY-MM-DD[ HH:MM:SS]' strings so the
    // API and the CMS always see the same values regardless of server timezone.
    dateStrings: true
  },
  paths: {
    // backend/uploads — never inside src/
    uploadsDir: path.join(__dirname, '..', '..', 'uploads'),
    backupsDir: path.join(__dirname, '..', '..', 'backups')
  },
  limits: {
    maxUploadBytes: Number(process.env.MAX_UPLOAD_MB || 25) * 1024 * 1024,
    jsonBody: '1mb',
    restoreBody: '20mb'
  }
};

const required = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_NAME'];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  logger.error(`Missing required environment variable(s): ${missing.join(', ')}`);
  process.exit(1);
}

module.exports = config;
