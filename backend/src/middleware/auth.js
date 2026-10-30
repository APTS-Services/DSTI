// src/middleware/auth.js — session cookies for the CMS, JWT bearer for /api/v1.
//
// Both transports resolve to the same req.user object:
//   { id, username, name, email, role, roleKey, mustChangePassword, csrf }
// `role` is the label the admin UI expects (Administrator/Publisher/Editor),
// `roleKey` is the database role name (admin/approver/editor/viewer).
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { q, one } = require('../config/db');
const { sha256 } = require('../utils/security');
const logger = require('../utils/logger');

// Over HTTPS the __Host- prefix makes the browser refuse the cookie unless it
// is Secure, host-only and scoped to "/", so a sub-domain cannot plant one.
const SESSION_COOKIE = config.isProduction ? '__Host-dsti_sid' : 'dsti_sid';
const cookieOptions = () => ({ httpOnly: true, sameSite: 'strict', secure: config.isProduction, path: '/' });
const ROLE_LABELS = {
  admin: 'Administrator',
  approver: 'Publisher',
  editor: 'Editor',
  viewer: 'Viewer'
};
const ROLE_KEYS = { Administrator: 'admin', Publisher: 'approver', Editor: 'editor', Viewer: 'viewer' };

const roleLabel = (roleKey) => ROLE_LABELS[roleKey] || 'Editor';
const roleKey = (label) => ROLE_KEYS[label] || (ROLE_LABELS[label] ? label : String(label || 'editor').toLowerCase());

function toUser(row, csrf = null) {
  if (!row) return null;
  return {
    id: row.user_id,
    username: row.username,
    name: row.full_name,
    email: row.email,
    role: roleLabel(row.role_name),
    roleKey: row.role_name,
    mustChangePassword: Boolean(row.must_change_password),
    csrf
  };
}

async function findUserById(id) {
  return one(
    `SELECT u.*, r.role_name FROM users u JOIN roles r ON r.role_id = u.role_id
     WHERE u.user_id = ? AND u.is_active = 1`,
    [id]
  );
}

/** Issues a JWT for the /api/v1 admin surface. */
function signToken(row) {
  return jwt.sign(
    { sub: row.user_id, username: row.username, role: row.role_name },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn, algorithm: 'HS256' }
  );
}

/**
 * Creates a server-side login session and sets the httpOnly cookie. Only the
 * SHA-256 of the session id is stored, so a database leak cannot be replayed
 * as a live session. A user has one session at a time: signing in ends the
 * previous one.
 */
async function createSession(req, res, row) {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const csrf = crypto.randomBytes(32).toString('hex');
  await q('DELETE FROM sessions WHERE user_id = ?', [row.user_id]);
  await q(
    `INSERT INTO sessions (session_id, user_id, csrf_token, ip, user_agent, expires_at)
     VALUES (?, ?, ?, ?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? HOUR))`,
    [
      sha256(sessionId),
      row.user_id,
      csrf,
      String(req.ip || '').slice(0, 64),
      String(req.get('user-agent') || '').slice(0, 255),
      config.sessionMaxHours
    ]
  );
  // A browser-session cookie: closing the browser also ends the sign-in.
  res.cookie(SESSION_COOKIE, sessionId, cookieOptions());
  return csrf;
}

/** Revokes the current session cookie and clears it. */
async function destroySession(req, res) {
  const sessionId = req.cookies?.[SESSION_COOKIE];
  if (sessionId) {
    try {
      await q('DELETE FROM sessions WHERE session_id = ?', [sha256(sessionId)]);
    } catch (err) {
      logger.error(`[auth] session cleanup failed: ${err.message}`);
    }
  }
  res.clearCookie(SESSION_COOKIE, cookieOptions());
}

/**
 * Resolves the caller from a session cookie or a Bearer token.
 * Always calls next(); routes decide whether authentication is required.
 */
async function loadSession(req, res, next) {
  try {
    const header = req.get('authorization') || '';
    if (header.startsWith('Bearer ')) {
      const token = header.slice(7).trim();
      try {
        const payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
        const blocked = await one('SELECT 1 AS found FROM jwt_blocklist WHERE token_hash = ?', [sha256(token)]);
        if (blocked) return next();
        const row = await findUserById(payload.sub);
        if (row) {
          req.user = toUser(row);
          req.authType = 'jwt';
          req.token = token;
        }
      } catch {
        /* invalid/expired token: leave req.user unset */
      }
      return next();
    }

    const sessionId = req.cookies?.[SESSION_COOKIE];
    if (typeof sessionId === 'string' && /^[a-f0-9]{64}$/.test(sessionId)) {
      const key = sha256(sessionId);
      // Valid while active within the idle window and before the absolute limit.
      const session = await one(
        `SELECT s.session_id, s.user_id, s.csrf_token, s.expires_at, u.*, r.role_name
         FROM sessions s
         JOIN users u ON u.user_id = s.user_id
         JOIN roles r ON r.role_id = u.role_id
         WHERE s.session_id = ? AND s.expires_at > UTC_TIMESTAMP()
           AND s.last_seen_at > DATE_SUB(UTC_TIMESTAMP(), INTERVAL ? MINUTE) AND u.is_active = 1`,
        [key, config.sessionIdleMinutes]
      );
      if (session) {
        req.user = toUser(session, session.csrf_token);
        req.authType = 'session';
        req.sessionId = key;
        // Sliding idle window, written at most once a minute.
        q('UPDATE sessions SET last_seen_at = UTC_TIMESTAMP() WHERE session_id = ? AND last_seen_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 MINUTE)', [key]).catch(() => {});
      } else {
        q('DELETE FROM sessions WHERE session_id = ?', [key]).catch(() => {});
        res.clearCookie(SESSION_COOKIE, cookieOptions());
      }
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

const isV1 = (req) => String(req.originalUrl || '').split('?')[0].startsWith('/api/v1');

function deny(req, res, status, code, message) {
  if (isV1(req)) return res.status(status).json({ success: false, error: { code, message } });
  return res.status(status).json({ error: message });
}

function requireAuth(req, res, next) {
  if (!req.user) return deny(req, res, 401, 'UNAUTHORIZED', 'Authentication required.');
  return next();
}

/** CSRF protection for cookie-authenticated admin writes. */
function requireCsrf(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required.' });
  // Safe methods do not change state, and the browser client only sends the
  // token on writes.
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.authType === 'jwt') return next();
  const token = req.get('x-csrf-token');
  if (!token || token !== req.user.csrf) {
    return res.status(403).json({ error: 'Security token missing or invalid. Reload the page and try again.' });
  }
  return next();
}

/** Allows one of the given role labels (Administrator, Publisher, ...). */
function requireRole(...labels) {
  return (req, res, next) => {
    if (!req.user) return deny(req, res, 401, 'UNAUTHORIZED', 'Authentication required.');
    if (!labels.includes(req.user.role)) return deny(req, res, 403, 'FORBIDDEN', 'You do not have permission to do this.');
    return next();
  };
}

/** Allows one of the given database role keys (admin, approver, ...). */
function requireRoleKey(...keys) {
  return (req, res, next) => {
    if (!req.user) return deny(req, res, 401, 'UNAUTHORIZED', 'Authentication required.');
    if (!keys.includes(req.user.roleKey)) return deny(req, res, 403, 'FORBIDDEN', 'You do not have permission to do this.');
    return next();
  };
}

async function blockToken(token) {
  if (!token) return;
  try {
    const payload = jwt.decode(token) || {};
    const expires = payload.exp ? new Date(payload.exp * 1000) : new Date(Date.now() + 8 * 60 * 60 * 1000);
    await q('INSERT IGNORE INTO jwt_blocklist (token_hash, expires_at) VALUES (?, ?)', [sha256(token), expires]);
  } catch (err) {
    logger.error(`[auth] token blocklist failed: ${err.message}`);
  }
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    mustChangePassword: user.mustChangePassword
  };
}

module.exports = {
  SESSION_COOKIE,
  ROLE_LABELS,
  roleLabel,
  roleKey,
  toUser,
  findUserById,
  signToken,
  createSession,
  destroySession,
  loadSession,
  requireAuth,
  requireCsrf,
  requireRole,
  requireRoleKey,
  blockToken,
  publicUser
};
