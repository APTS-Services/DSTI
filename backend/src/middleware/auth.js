// Server-side sessions with an httpOnly cookie, CSRF protection and role checks.
import env from '../config/env.js';
import { query } from '../db/pool.js';
import { randomToken, safeEqual, sha256 } from '../utils/security.js';

export const COOKIE = env.isProd ? '__Host-dsti_sid' : 'dsti_sid';

const cookieOptions = () => ({
  httpOnly: true,
  secure: env.isProd,
  sameSite: 'strict',
  path: '/',
});

const toSql = (d) => d.toISOString().slice(0, 19).replace('T', ' ');
const fromSql = (s) => new Date(`${String(s).replace(' ', 'T')}Z`);

export async function createSession(req, res, userId) {
  // One active session per user: signing in elsewhere ends older sessions.
  await query('DELETE FROM sessions WHERE user_id = ?', [userId]);
  const token = randomToken(32);
  const csrf = randomToken(32);
  const now = Date.now();
  const expires = new Date(Math.min(now + env.session.idleMinutes * 60000, now + env.session.absoluteHours * 3600000));
  await query(
    'INSERT INTO sessions (id, user_id, csrf_token, ip, user_agent, created_at, last_seen_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [sha256(token), userId, csrf, String(req.ip || '').slice(0, 64), String(req.get('user-agent') || '').slice(0, 255), toSql(new Date(now)), toSql(new Date(now)), toSql(expires)],
  );
  res.cookie(COOKIE, token, cookieOptions());
  return csrf;
}

export async function destroySession(req, res) {
  const token = req.cookies?.[COOKIE];
  if (token) await query('DELETE FROM sessions WHERE id = ?', [sha256(token)]);
  res.clearCookie(COOKIE, cookieOptions());
}

/** Loads req.user if a valid session cookie is present. */
export async function loadSession(req, res, next) {
  const token = req.cookies?.[COOKIE];
  if (!token || typeof token !== 'string' || token.length !== 64) return next();
  try {
    const rows = await query(
      `SELECT s.id AS sid, s.csrf_token, s.created_at, s.last_seen_at, s.expires_at,
              u.id, u.username, u.full_name, u.email, u.role, u.must_change_password, u.is_active
         FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?`,
      [sha256(token)],
    );
    const row = rows[0];
    const now = Date.now();
    if (!row || !row.is_active || fromSql(row.expires_at).getTime() < now) {
      if (row) await query('DELETE FROM sessions WHERE id = ?', [row.sid]);
      res.clearCookie(COOKIE, cookieOptions());
      return next();
    }
    // Sliding idle timeout, capped by the absolute lifetime.
    if (now - fromSql(row.last_seen_at).getTime() > 30000) {
      const absolute = fromSql(row.created_at).getTime() + env.session.absoluteHours * 3600000;
      const expires = new Date(Math.min(now + env.session.idleMinutes * 60000, absolute));
      await query('UPDATE sessions SET last_seen_at = ?, expires_at = ? WHERE id = ?', [toSql(new Date(now)), toSql(expires), row.sid]);
    }
    req.user = {
      id: row.id,
      username: row.username,
      name: row.full_name,
      email: row.email,
      role: row.role,
      mustChangePassword: Boolean(row.must_change_password),
      csrf: row.csrf_token,
      sid: row.sid,
    };
    return next();
  } catch (err) {
    return next(err);
  }
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
  // Until the initial password is changed, only the password endpoints are reachable.
  if (req.user.mustChangePassword && !req.allowWithPendingPassword) {
    return res.status(403).json({ error: 'You must change your password before continuing.', code: 'PASSWORD_CHANGE_REQUIRED' });
  }
  return next();
}

export const allowPendingPassword = (req, res, next) => {
  req.allowWithPendingPassword = true;
  next();
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: 'You do not have permission to do this.' });
  return next();
};

/** Synchroniser-token CSRF check for every state-changing request. */
export function requireCsrf(req, res, next) {
  if (['GET', 'HEAD'].includes(req.method)) return next();
  if (!req.user || !safeEqual(req.get('x-csrf-token'), req.user.csrf)) {
    return res.status(403).json({ error: 'Security token missing or invalid. Please reload the page.' });
  }
  return next();
}
