// Authentication: CAPTCHA, encrypted password sign-in, lockout, password change.
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db/pool.js';
import { allowPendingPassword, createSession, destroySession, requireAuth, requireCsrf } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errors.js';
import { captchaLimiter, loginLimiter } from '../middleware/rateLimits.js';
import { audit } from '../utils/audit.js';
import { captchaExists, createCaptcha, verifyCaptcha } from '../utils/captcha.js';
import { decryptSecret, passwordProblems, publicKeySpki, safeEqual } from '../utils/security.js';

const router = Router();

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const GENERIC_FAIL = 'Invalid username, password or CAPTCHA.';
// A real bcrypt hash used to keep timing identical for unknown usernames.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

export const publicUser = (u) => ({
  id: u.id,
  username: u.username,
  name: u.name ?? u.full_name,
  email: u.email,
  role: u.role,
  mustChangePassword: Boolean(u.mustChangePassword ?? u.must_change_password),
});

router.get('/captcha', captchaLimiter, (req, res) => {
  const { id, svg } = createCaptcha();
  res.json({ id, image: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}` });
});

router.get('/key', (req, res) => res.json({ key: publicKeySpki }));

router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  const { username, password, captchaId, captcha } = req.body || {};
  const uname = typeof username === 'string' ? username.trim().toLowerCase().slice(0, 50) : '';
  // Decrypt first: the nonce inside the ciphertext must be this CAPTCHA's id.
  const valid = captchaExists(captchaId);
  const secret = valid ? decryptSecret(password, captchaId) : null;
  const captchaOk = verifyCaptcha(captchaId, typeof captcha === 'string' ? captcha : '');
  req.auditUser = uname;

  const rows = uname ? await query('SELECT * FROM users WHERE username = ?', [uname]) : [];
  const user = rows[0];

  if (user?.locked_until && new Date(`${user.locked_until.replace(' ', 'T')}Z`) > new Date()) {
    await bcrypt.compare('x', DUMMY_HASH);
    await audit(req, 'LOGIN_LOCKED', uname);
    return res.status(423).json({ error: `Account temporarily locked after repeated failures. Try again in ${LOCK_MINUTES} minutes.` });
  }

  const passOk = await bcrypt.compare(secret || '', user?.password_hash || DUMMY_HASH);
  if (!captchaOk || !secret || !user || !user.is_active || !passOk) {
    if (user) {
      const attempts = user.failed_attempts + 1;
      const lock = attempts >= MAX_ATTEMPTS;
      await query(
        `UPDATE users SET failed_attempts = ?, locked_until = ${lock ? 'DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? MINUTE)' : 'NULL'} WHERE id = ?`,
        lock ? [0, LOCK_MINUTES, user.id] : [attempts, user.id],
      );
    }
    await audit(req, 'LOGIN_FAILED', uname, captchaOk ? '' : 'captcha');
    return res.status(401).json({ error: GENERIC_FAIL });
  }

  await query('UPDATE users SET failed_attempts = 0, locked_until = NULL, last_login_at = UTC_TIMESTAMP() WHERE id = ?', [user.id]);
  const csrf = await createSession(req, res, user.id);
  req.user = { id: user.id, username: user.username };
  await audit(req, 'LOGIN', user.username);
  return res.json({ user: publicUser(user), csrf });
}));

router.post('/logout', asyncHandler(async (req, res) => {
  if (req.user && !safeEqual(req.get('x-csrf-token'), req.user.csrf)) return res.status(403).json({ error: 'Security token missing or invalid.' });
  if (req.user) await audit(req, 'LOGOUT', req.user.username);
  await destroySession(req, res);
  res.json({ ok: true });
}));

// Returns the signed-in user, or { user: null } (no error) for anonymous visitors.
router.get('/me', (req, res) => {
  if (!req.user) return res.json({ user: null });
  return res.json({ user: publicUser(req.user), csrf: req.user.csrf });
});

router.post('/change-password', allowPendingPassword, requireAuth, requireCsrf, asyncHandler(async (req, res) => {
  const current = decryptSecret(req.body?.currentPassword, req.user.csrf);
  const next = decryptSecret(req.body?.newPassword, req.user.csrf);
  if (!current || !next) return res.status(400).json({ error: 'Invalid request.' });

  const [user] = await query('SELECT id, username, password_hash FROM users WHERE id = ?', [req.user.id]);
  if (!(await bcrypt.compare(current, user.password_hash))) {
    await audit(req, 'PASSWORD_CHANGE_FAILED', user.username);
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }
  const problems = passwordProblems(next, user.username);
  if (problems.length) return res.status(400).json({ error: `New password ${problems.join(', ')}.` });

  const history = await query('SELECT password_hash FROM password_history WHERE user_id = ? ORDER BY id DESC LIMIT 3', [user.id]);
  for (const h of [{ password_hash: user.password_hash }, ...history]) {
    if (await bcrypt.compare(next, h.password_hash)) return res.status(400).json({ error: 'New password must differ from your last 3 passwords.' });
  }

  const hash = await bcrypt.hash(next, 12);
  await query('INSERT INTO password_history (user_id, password_hash) VALUES (?, ?)', [user.id, user.password_hash]);
  await query('UPDATE users SET password_hash = ?, must_change_password = 0, password_changed_at = UTC_TIMESTAMP() WHERE id = ?', [hash, user.id]);
  // Invalidate every session and start a fresh one.
  await destroySession(req, res);
  const csrf = await createSession(req, res, user.id);
  await audit(req, 'PASSWORD_CHANGED', user.username);
  return res.json({ ok: true, csrf });
}));

export default router;
