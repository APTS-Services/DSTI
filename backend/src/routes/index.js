// src/routes/index.js — mounts every API router.
const publicRoutes = require('./public');
const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const v1PublicRoutes = require('./v1/public');
const v1AdminRoutes = require('./v1/admin');
const { loadSession } = require('../middleware/auth');

function mountRoutes(app) {
  // Public website (React contract)
  app.use('/api/public', publicRoutes);

  // CMS (cookie session + CSRF)
  app.use('/api/auth', loadSession, authRoutes);
  app.use('/api/admin', loadSession, adminRoutes);

  // Public REST API
  app.use('/api/v1', v1PublicRoutes);

  // Admin REST API (JWT or session)
  app.use('/api/v1/admin', v1AdminRoutes);

  // Health check used by uptime monitoring
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
}

module.exports = mountRoutes;
