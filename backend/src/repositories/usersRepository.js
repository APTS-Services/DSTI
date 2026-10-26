// src/repositories/usersRepository.js — CMS user accounts.
const { q, one } = require('../config/db');

const PUBLIC_COLUMNS = `u.user_id AS id, u.username, u.full_name, u.email, r.role_name AS role_key,
  u.is_active, u.must_change_password, u.locked_until, u.last_login_at, u.created_at`;

async function list() {
  const rows = await q(
    `SELECT ${PUBLIC_COLUMNS} FROM users u JOIN roles r ON r.role_id = u.role_id ORDER BY u.user_id`
  );
  const labels = { admin: 'Administrator', approver: 'Publisher', editor: 'Editor', viewer: 'Viewer' };
  return rows.map((row) => ({
    ...row,
    role: labels[row.role_key] || 'Editor',
    is_active: Boolean(row.is_active),
    must_change_password: Boolean(row.must_change_password)
  }));
}

async function getById(id) {
  return one(`SELECT ${PUBLIC_COLUMNS} FROM users u JOIN roles r ON r.role_id = u.role_id WHERE u.user_id = ?`, [id]);
}

async function findByUsername(username) {
  return one('SELECT user_id FROM users WHERE username = ?', [username]);
}

async function findByEmail(email) {
  return one('SELECT user_id FROM users WHERE email = ?', [email]);
}

async function roleId(roleName) {
  const row = await one('SELECT role_id FROM roles WHERE role_name = ?', [roleName]);
  return row ? row.role_id : null;
}

async function create({ username, full_name, email, role, password_hash, is_active = 1, must_change_password = 1 }) {
  const rid = await roleId(role);
  const result = await q(
    `INSERT INTO users (username, full_name, email, password_hash, role_id, is_active, must_change_password)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [username, full_name, email, password_hash, rid, is_active ? 1 : 0, must_change_password ? 1 : 0]
  );
  return result.insertId;
}

async function update(id, { full_name, email, role, is_active }) {
  const rid = await roleId(role);
  await q('UPDATE users SET full_name = ?, email = ?, role_id = ?, is_active = ? WHERE user_id = ?', [
    full_name, email, rid, is_active ? 1 : 0, id
  ]);
}

async function setPasswordHash(id, hash, mustChange = true) {
  await q('UPDATE users SET password_hash = ?, must_change_password = ? WHERE user_id = ?', [hash, mustChange ? 1 : 0, id]);
}

async function unlock(id) {
  await q('UPDATE users SET failed_logins = 0, locked_until = NULL WHERE user_id = ?', [id]);
}

async function remove(id) {
  await q('DELETE FROM users WHERE user_id = ?', [id]);
}

async function roles() {
  return q('SELECT role_id, role_name, description FROM roles ORDER BY role_id');
}

module.exports = { list, getById, findByUsername, findByEmail, create, update, setPasswordHash, unlock, remove, roles };
