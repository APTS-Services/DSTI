// src/server.js — application entry point (API only).
const config = require('./config');
const { createApp } = require('./app');
const db = require('./config/db');
const logger = require('./utils/logger');
const { initCleanupJobs } = require('./services/cleanupService');

const app = createApp();
let server = null;
let shuttingDown = false;

function gracefulShutdown(source, exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`[${source}] Shutting down...`);
  const timer = setTimeout(() => process.exit(exitCode), 10000);
  timer.unref();
  if (!server) {
    clearTimeout(timer);
    return process.exit(exitCode);
  }
  server.close(() => {
    db.pool.end(() => {
      clearTimeout(timer);
      process.exit(exitCode);
    });
  });
}

process.on('unhandledRejection', (reason) => {
  logger.error(`[unhandledRejection] ${reason instanceof Error ? reason.stack : String(reason)}`);
  gracefulShutdown('unhandledRejection', 1);
});

process.on('uncaughtException', (err) => {
  logger.error(`[uncaughtException] ${err.stack || err.message}`);
  gracefulShutdown('uncaughtException', 1);
});

process.on('SIGTERM', () => gracefulShutdown('SIGTERM', 0));
process.on('SIGINT', () => gracefulShutdown('SIGINT', 0));

async function start() {
  try {
    await db.assertConnection();
    logger.info(`Connected to MySQL at ${config.db.host}:${config.db.port}/${config.db.database}`);
  } catch (err) {
    logger.error(`Database connection failed: ${err.message}`);
    process.exit(1);
  }

  initCleanupJobs();

  const onListening = () => {
    logger.info(`DSTI API listening on http://${config.host}:${config.port}`);
    logger.info(`Allowed CORS origins: ${config.corsOrigins.join(', ') || '(same-origin only)'}`);
    logger.info('Public API: /api/v1   CMS: /api/admin   Site bundle: /api/public/content');
  };
  // Bind to HOST (127.0.0.1 behind a reverse proxy) — never every interface by
  // default. A named pipe (iisnode) has no host.
  server = typeof config.port === 'number' ? app.listen(config.port, config.host, onListening) : app.listen(config.port, onListening);

  server.on('error', (err) => {
    logger.error(`[listen] ${err.message}`);
    if (err.code === 'EADDRINUSE') logger.error(`Port ${config.port} is already in use.`);
    process.exit(1);
  });
}

start();
