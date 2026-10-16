// Hardening middleware: security headers, strict CSP, host and method checks.
import helmet from 'helmet';
import env from '../config/env.js';

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      mediaSrc: ["'self'"],
      frameSrc: ['https://www.youtube-nocookie.com'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      manifestSrc: ["'self'"],
      workerSrc: ["'self'"],
      ...(env.isProd ? { upgradeInsecureRequests: [] } : {}),
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'same-origin' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  strictTransportSecurity: env.isProd ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  frameguard: { action: 'deny' },
});

export function permissionsPolicy(req, res, next) {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()');
  next();
}

const ALLOWED_METHODS = new Set(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE']);

export function methodGuard(req, res, next) {
  if (!ALLOWED_METHODS.has(req.method)) {
    res.setHeader('Allow', 'GET, HEAD, POST, PUT, PATCH, DELETE');
    return res.status(405).end();
  }
  return next();
}

export function hostGuard(req, res, next) {
  if (!env.allowedHosts.length) return next();
  const host = String(req.headers.host || '').toLowerCase();
  if (!env.allowedHosts.includes(host)) return res.status(400).send('Invalid host');
  return next();
}

/** Admin and auth responses must never be cached by browsers or proxies. */
export function noStore(req, res, next) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  next();
}

/** Rejects cross-site state-changing requests based on the Origin header. */
export function sameOrigin(req, res, next) {
  if (['GET', 'HEAD'].includes(req.method)) return next();
  const origin = req.get('origin');
  if (!origin) return next();
  const host = req.get('host');
  try {
    const o = new URL(origin);
    if (o.host === host || origin === env.publicOrigin) return next();
  } catch {
    /* fall through */
  }
  return res.status(403).json({ error: 'Cross-site request blocked.' });
}
