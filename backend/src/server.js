// Entry point.
import env from './config/env.js';
import { createApp } from './app.js';
import { closePool, query } from './db/pool.js';

const app = createApp();
const server = app.listen(env.port, () => {
  console.log(`DSTI API listening on http://localhost:${env.port} (${env.nodeEnv})`);
});
server.headersTimeout = 20000;
server.requestTimeout = 30000;

// Remove expired sessions every 15 minutes.
const sweep = setInterval(() => {
  query('DELETE FROM sessions WHERE expires_at < UTC_TIMESTAMP()').catch(() => {});
}, 15 * 60 * 1000);
sweep.unref();

const shutdown = () => {
  server.close(async () => {
    await closePool();
    process.exit(0);
  });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
