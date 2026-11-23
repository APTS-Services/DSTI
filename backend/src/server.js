// src/server.js — application entry point (API only).
const config = require('./config');
const { createApp } = require('./app');
const db = require('./config/db');
const logger = require('./utils/logger');
const { initCleanupJobs } = require('./services/cleanupService');

const app = createApp();
const SHUTDOWN_TIMEOUT_MS = 10000;
let server = null;
let shuttingDown = false;
let shutdownExitCode = 0;

function closePool() {
  return new Promise((resolve) => db.pool.end(() => resolve()));
}

async function gracefulShutdown(source, exitCode = 0) {
  if (shuttingDown) {
    logger.warn(`[${source}] Shutdown already in progress — forcing exit.`);
    process.exit(shutdownExitCode);
  }
  shuttingDown = true;
  shutdownExitCode = exitCode;
  logger.info(`[${source}] Shutting down...`);

  // A hung request must not keep the process (and the deploy) waiting forever.
  const forceExit = setTimeout(() => {
    logger.error(`[shutdown] Timed out after ${SHUTDOWN_TIMEOUT_MS} ms — forcing exit.`);
    if (server && typeof server.closeAllConnections === 'function') server.closeAllConnections();
    process.exit(shutdownExitCode);
  }, SHUTDOWN_TIMEOUT_MS);
  forceExit.unref();

  if (server) {
    // Stop accepting new requests, then release idle keep-alive sockets so a
    // browser or reverse proxy cannot delay shutdown just by holding them open.
    const closed = new Promise((resolve) => server.close(() => resolve()));
    if (typeof server.closeIdleConnections === 'function') server.closeIdleConnections();
    await closed;
  }

  await closePool();
  clearTimeout(forceExit);
  logger.info('Shutdown complete.');
  process.exit(shutdownExitCode);
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
    gracefulShutdown('listen', 1);
  });
}

if (require.main === module) start();

module.exports = { start, gracefulShutdown };
