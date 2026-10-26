// src/app.js — Express application (API + uploaded files only).
const crypto = require('crypto');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const path = require('path');

const config = require('./config');
const mountRoutes = require('./routes');
const logger = require('./utils/logger');
const securityHeaders = require('./middleware/securityHeaders');
const errorMiddleware = require('./middleware/errorMiddleware');
const { asyncHandler } = require('./utils/http');
const publicService = require('./services/publicService');

function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);

  // Request correlation id (also returned as X-Request-ID).
  app.use((req, res, next) => {
    req.id = crypto.randomUUID();
    res.setHeader('X-Request-ID', req.id);
    next();
  });

  morgan.token('id', (req) => req.id || '-');
  app.use(
    morgan(':id :remote-addr :method :url :status :res[content-length] :response-time ms', {
      stream: logger.stream
    })
  );

  app.use(compression({ filter: (req, res) => (req.path.toLowerCase().endsWith('.pdf') ? false : compression.filter(req, res)) }));

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (config.corsOrigins.includes(origin)) return callback(null, true);
        // Development convenience: the React dev server may be opened as
        // localhost or 127.0.0.1 on any port (5173, 4173, ...). Never in production.
        if (!config.isProduction && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return callback(null, true);
        logger.warn(`CORS blocked origin: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Authorization', 'Content-Type', 'X-CSRF-Token', 'X-Requested-With', 'Accept', 'If-None-Match'],
      exposedHeaders: ['ETag', 'X-Request-ID'],
      credentials: true,
      maxAge: 86400
    })
  );

  app.use(securityHeaders);
  app.use(cookieParser());

  // The backup restore endpoint accepts larger bodies; everything else is small.
  const jsonSmall = express.json({ limit: config.limits.jsonBody });
  app.use((req, res, next) => {
    if (req.path === '/api/admin/restore') return next();
    return jsonSmall(req, res, next);
  });
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  mountRoutes(app);

  // Search-engine files generated from the CMS content.
  app.get(
    '/sitemap.xml',
    asyncHandler(async (req, res) => {
      res.type('application/xml').setHeader('Cache-Control', 'public, max-age=3600');
      res.send(await publicService.sitemapXml());
    })
  );
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain').send(`User-agent: *\nDisallow: /admin\nDisallow: /api/\nSitemap: ${config.publicOrigin}/sitemap.xml\n`);
  });

  // Uploaded documents and images.
  app.use(
    '/uploads',
    express.static(config.paths.uploadsDir, {
      dotfiles: 'deny',
      index: false,
      maxAge: '7d',
      setHeaders(res, file) {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; media-src 'self'; object-src 'self'");
        if (file.toLowerCase().endsWith('.pdf')) res.setHeader('Content-Disposition', `inline; filename="${path.basename(file)}"`);
      }
    })
  );
  app.use('/uploads', (req, res) => res.status(404).json({ error: 'File not found.' }));

  // JSON 404s — this server never renders HTML pages.
  app.use('/api', (req, res) => {
    if (req.path.startsWith('/api/v1')) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'API endpoint not found' } });
    }
    return res.status(404).json({ error: 'API endpoint not found', path: req.originalUrl });
  });
  app.use((req, res) => res.status(404).json({ error: 'Not found', path: req.originalUrl }));

  app.use(errorMiddleware);
  return app;
}

module.exports = { createApp };
