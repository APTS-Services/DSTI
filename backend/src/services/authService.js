// src/services/authService.js — sign-in, lockout, password change and JWT.
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const authRepository = require('../repositories/authRepository');
const {
  createSession,
  destroySession,
  signToken,
  blockToken,
  publicUser,
  toUser
} = require('../middleware/auth');
const { createCaptcha, captchaExists, verifyCaptcha } = require('../utils/captcha');
const { publicKeySpki, decryptSecret, passwordProblems, safeEqual } = require('../utils/security');
const { record } = require('../utils/audit');

const GENERIC_FAIL = 'Invalid username, password or CAPTCHA.';
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);
const LOCK_MINUTES = authRepository.LOCK_MINUTES;

const captcha = () => {
  const { id, svg } = createCaptcha();
  return { id, image: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}` };
};

const publicKey = () => ({ key: publicKeySpki });

const lockedUntil = (row) => {
  if (!row?.locked_until) return null;
  const date = new Date(`${String(row.locked_until).replace(' ', 'T')}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** Frontend (cookie session) sign-in — CAPTCHA + RSA-encrypted password. */
async function login({ username, password, captchaId, captcha: captchaAnswer, req, res }) {
  const uname = typeof username === 'string' ? username.trim().toLowerCase().slice(0, 50) : '';
  const validCaptcha = captchaExists(captchaId);
  const secret = validCaptcha ? decryptSecret(password, captchaId) : null;
  const captchaOk = verifyCaptcha(captchaId, typeof captchaAnswer === 'string' ? captchaAnswer : '');
  const row = uname ? await authRepository.findForLogin(uname) : null;

  const lock = lockedUntil(row);
  if (lock && lock > new Date()) {
    await bcrypt.compare('x', DUMMY_HASH);
    await record(row ? { id: row.user_id, username: row.username } : null, 'LOGIN_LOCKED', uname, { ip: req.ip }, req.ip);
    throw new ApiError(423, `Account temporarily locked after repeated failures. Try again in ${LOCK_MINUTES} minutes.`);
  }

  const passOk = await bcrypt.compare(secret || '', row?.password_hash || DUMMY_HASH);
  if (!captchaOk || !secret || !row || !row.is_active || !passOk) {
    if (row && row.is_active) await authRepository.recordFailedLogin(row.user_id);
    await record(row ? { id: row.user_id, username: row.username } : null, 'LOGIN_FAILED', uname, captchaOk ? '' : 'captcha', req.ip);
    throw new ApiError(401, GENERIC_FAIL);
  }

  await authRepository.resetFailedLogins(row.user_id);
  const csrf = await createSession(req, res, row);
  await record({ id: row.user_id, username: row.username }, 'LOGIN', row.username, '', req.ip);
  return { user: publicUser(toUser(row, csrf)), csrf };
}

async function logout(req, res) {
  if (req.user) await record({ id: req.user.id, username: req.user.username }, 'LOGOUT', req.user.username, '', req.ip);
  await blockToken(req.token);
  await destroySession(req, res);
  return { ok: true };
}

function me(req) {
  if (!req.user) return { user: null };
  return { user: publicUser(req.user), csrf: req.user.csrf };
}

async function changePassword(req, res, { currentPassword, newPassword }) {
  if (!req.user) throw new ApiError(401, 'Authentication required.');
  const current = decryptSecret(currentPassword, req.user.csrf);
  const next = decryptSecret(newPassword, req.user.csrf);
  if (!current || !next) throw new ApiError(400, 'Invalid request.');

  const row = await authRepository.findWithPassword(req.user.id);
  if (!row || !(await bcrypt.compare(current, row.password_hash))) {
    await record(req.user, 'PASSWORD_CHANGE_FAILED', row?.username || req.user.username, '', req.ip);
    throw new ApiError(400, 'Current password is incorrect.');
  }
  const problems = passwordProblems(next, row.username);
  if (problems.length) throw new ApiError(400, `New password ${problems.join(', ')}.`);

  const history = await authRepository.passwordHistory(row.user_id);
  for (const previous of [{ password_hash: row.password_hash }, ...history]) {
    if (await bcrypt.compare(next, previous.password_hash)) {
      throw new ApiError(400, 'New password must differ from your last 3 passwords.');
    }
  }

  const hash = await bcrypt.hash(next, 12);
  await authRepository.addPasswordHistory(row.user_id, row.password_hash);
  await authRepository.updatePassword(row.user_id, hash, { mustChange: false });
  await authRepository.endSessions(row.user_id);
  await destroySession(req, res);
  const refreshed = await authRepository.findForLogin(row.username);
  const csrf = await createSession(req, res, refreshed);
  await record(req.user, 'PASSWORD_CHANGED', row.username, '', req.ip);
  return { ok: true, csrf };
}

/* ----------------------------- /api/v1 -------------------------------- */

async function apiLogin({ email, password, req }) {
  const identifier = String(email || '').trim().toLowerCase().slice(0, 190);
  if (!identifier || typeof password !== 'string' || !password) {
    throw new ApiError(400, 'Email and password are required.');
  }
  const row = await authRepository.findForLogin(identifier);
  const lock = lockedUntil(row);
  if (lock && lock > new Date()) {
    await bcrypt.compare('x', DUMMY_HASH);
    throw new ApiError(423, `Account temporarily locked. Try again in ${LOCK_MINUTES} minutes.`);
  }
  const ok = await bcrypt.compare(password, row?.password_hash || DUMMY_HASH);
  if (!row || !row.is_active || !ok) {
    if (row && row.is_active) await authRepository.recordFailedLogin(row.user_id);
    await record(row ? { id: row.user_id, username: row.username } : null, 'LOGIN_FAILED', identifier, { api: true }, req.ip);
    throw new ApiError(401, 'Invalid email or password.');
  }
  await authRepository.resetFailedLogins(row.user_id);
  const token = signToken(row);
  await record({ id: row.user_id, username: row.username }, 'LOGIN', row.username, { api: true }, req.ip);
  const decoded = jwt.decode(token) || {};
  return {
    token,
    token_type: 'Bearer',
    expires_in: decoded.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 0,
    user: {
      id: row.user_id,
      username: row.username,
      name: row.full_name,
      email: row.email,
      role: row.role_name
    }
  };
}

async function apiLogout(req) {
  await blockToken(req.token);
  if (req.user) await record(req.user, 'LOGOUT', req.user.username, { api: true }, req.ip);
  return { ok: true };
}

function apiRefresh(req) {
  if (!req.user) throw new ApiError(401, 'Authentication required.');
  return { token: signToken({ user_id: req.user.id, username: req.user.username, role: req.user.roleKey }), token_type: 'Bearer' };
}

async function apiMe(req) {
  if (!req.user) throw new ApiError(401, 'Authentication required.');
  return {
    id: req.user.id,
    username: req.user.username,
    name: req.user.name,
    email: req.user.email,
    role: req.user.roleKey
  };
}

/** Password change for API clients: plain over HTTPS, no browser RSA transport. */
async function apiChangePassword(req, { currentPassword, newPassword }) {
  if (!req.user) throw new ApiError(401, 'Authentication required.');
  const row = await authRepository.findWithPassword(req.user.id);
  if (!row || !(await bcrypt.compare(String(currentPassword || ''), row.password_hash))) {
    throw new ApiError(400, 'Current password is incorrect.');
  }
  const problems = passwordProblems(String(newPassword || ''), row.username);
  if (problems.length) throw new ApiError(400, `New password ${problems.join(', ')}.`);
  const history = await authRepository.passwordHistory(row.user_id);
  for (const previous of [{ password_hash: row.password_hash }, ...history]) {
    if (await bcrypt.compare(newPassword, previous.password_hash)) {
      throw new ApiError(400, 'New password must differ from your last 3 passwords.');
    }
  }
  await authRepository.addPasswordHistory(row.user_id, row.password_hash);
  await authRepository.updatePassword(row.user_id, await bcrypt.hash(newPassword, 12), { mustChange: false });
  await authRepository.endSessions(row.user_id);
  await record(req.user, 'PASSWORD_CHANGED', row.username, { api: true }, req.ip);
  return { ok: true };
}

async function forgotPassword({ email }) {
  // Always answer the same way so the endpoint cannot be used to enumerate users.
  const identifier = String(email || '').trim().toLowerCase();
  if (identifier) {
    const row = await authRepository.findForLogin(identifier);
    if (row) await record({ id: row.user_id, username: row.username }, 'PASSWORD_RESET_REQUESTED', identifier, '', '');
  }
  return { ok: true, message: 'If the address belongs to an account, a reset link has been sent.' };
}

module.exports = {
  captcha,
  publicKey,
  login,
  logout,
  me,
  changePassword,
  apiLogin,
  apiLogout,
  apiRefresh,
  apiMe,
  apiChangePassword,
  forgotPassword,
  safeEqual
};
