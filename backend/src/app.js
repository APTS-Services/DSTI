// Express application: security middleware, API routes and static hosting.
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import env from './config/env.js';
import { loadSession } from './middleware/auth.js';
import { errorHandler, notFound } from './middleware/errors.js';
import { apiLimiter } from './middleware/rateLimits.js';
import { hostGuard, methodGuard, noStore, permissionsPolicy, sameOrigin, securityHeaders } from './middleware/security.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import publicRoutes, { seoRouter } from './routes/public.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', env.trustProxy);
  app.set('etag', false);

  app.use(methodGuard, hostGuard, securityHeaders, permissionsPolicy, compression());

  const jsonSmall = express.json({ limit: '256kb' });
  app.use((req, res, next) => (req.path === '/api/admin/restore' ? next() : jsonSmall(req, res, next)));
  app.use(cookieParser());

  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use('/api', apiLimiter, sameOrigin);
  app.use('/api/public', publicRoutes);
  app.use('/api/auth', noStore, loadSession, authRoutes);
  app.use('/api/admin', noStore, loadSession, adminRoutes);
  app.use('/api', notFound);

  app.use(seoRouter);

  // Uploaded documents and images.
  app.use('/uploads', express.static(env.uploadDir, {
    dotfiles: 'deny',
    index: false,
    maxAge: '7d',
    setHeaders: (res, file) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      // Chrome's PDF viewer refuses sandboxed documents, so only non-PDF files get the sandbox.
      if (file.endsWith('.pdf')) res.setHeader('Content-Disposition', `inline; filename="${path.basename(file)}"`);
      else res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'; media-src 'self'; sandbox");
    },
  }));
  app.use('/uploads', (req, res) => res.status(404).send('Not found'));

  // Built frontend (production). Vite serves the frontend in development.
  if (fs.existsSync(path.join(env.frontendDist, 'index.html'))) {
    app.use(express.static(env.frontendDist, {
      index: false,
      maxAge: '1y',
      immutable: true,
      setHeaders: (res, file) => {
        if (!file.includes(`${path.sep}assets${path.sep}`)) res.setHeader('Cache-Control', 'public, max-age=3600');
      },
    }));
    const indexHtml = path.join(env.frontendDist, 'index.html');
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(indexHtml);
    });
  }

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
