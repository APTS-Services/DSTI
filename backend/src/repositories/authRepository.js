// src/repositories/authRepository.js — SQL for sign-in, lockout and passwords.
const config = require('../config');
const { q, one } = require('../config/db');

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

async function findForLogin(identifier) {
  return one(
    `SELECT u.*, r.role_name FROM users u JOIN roles r ON r.role_id = u.role_id
     WHERE (u.username = ? OR u.email = ?) AND u.is_active = 1
     LIMIT 1`,
    [identifier, identifier]
  );
}

async function findWithPassword(userId) {
  return one('SELECT user_id, username, password_hash FROM users WHERE user_id = ? AND is_active = 1', [userId]);
}

async function recordFailedLogin(userId) {
  const row = await one('SELECT failed_logins FROM users WHERE user_id = ?', [userId]);
  const attempts = Number(row?.failed_logins || 0) + 1;
  if (attempts >= MAX_ATTEMPTS) {
    await q(
      `UPDATE users SET failed_logins = 0, locked_until = DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? MINUTE) WHERE user_id = ?`,
      [LOCK_MINUTES, userId]
    );
    return { locked: true };
  }
  await q('UPDATE users SET failed_logins = ? WHERE user_id = ?', [attempts, userId]);
  return { locked: false };
}

async function resetFailedLogins(userId) {
  await q('UPDATE users SET failed_logins = 0, locked_until = NULL, last_login_at = UTC_TIMESTAMP() WHERE user_id = ?', [userId]);
}

async function updatePassword(userId, hash, { mustChange = false } = {}) {
  await q(
    'UPDATE users SET password_hash = ?, must_change_password = ?, password_changed_at = UTC_TIMESTAMP() WHERE user_id = ?',
    [hash, mustChange ? 1 : 0, userId]
  );
}

async function passwordHistory(userId, limit = 3) {
  return q('SELECT password_hash FROM password_history WHERE user_id = ? ORDER BY id DESC LIMIT ?', [userId, limit]);
}

async function addPasswordHistory(userId, hash) {
  await q('INSERT INTO password_history (user_id, password_hash) VALUES (?, ?)', [userId, hash]);
}

async function endSessions(userId) {
  await q('DELETE FROM sessions WHERE user_id = ?', [userId]);
}

async function cleanup() {
  await q(
    'DELETE FROM sessions WHERE expires_at < UTC_TIMESTAMP() OR last_seen_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL ? MINUTE)',
    [config.sessionIdleMinutes]
  );
  await q('DELETE FROM jwt_blocklist WHERE expires_at < UTC_TIMESTAMP()');
}

module.exports = {
  MAX_ATTEMPTS,
  LOCK_MINUTES,
  findForLogin,
  findWithPassword,
  recordFailedLogin,
  resetFailedLogins,
  updatePassword,
  passwordHistory,
  addPasswordHistory,
  endSessions,
  cleanup
};
