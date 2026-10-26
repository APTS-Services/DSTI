// src/services/userService.js — user accounts shared by the CMS and /api/v1.
const bcrypt = require('bcryptjs');
const ApiError = require('../utils/ApiError');
const usersRepository = require('../repositories/usersRepository');
const { decryptSecret, passwordProblems } = require('../utils/security');
const { EMAIL_RE } = require('../utils/validate');
const { roleKey } = require('../middleware/auth');
const { record } = require('../utils/audit');
const { q } = require('../config/db');

const ROLE_KEYS = ['admin', 'approver', 'editor', 'viewer'];
const normaliseRole = (value) => {
  const key = roleKey(value);
  return ROLE_KEYS.includes(key) ? key : null;
};

async function list() {
  return usersRepository.list();
}

async function roles() {
  return usersRepository.roles();
}

function validate({ username, fullName, email, role, password, requirePassword }) {
  const errors = [];
  if (username !== undefined && !/^[a-z][a-z0-9._-]{2,49}$/.test(username)) {
    errors.push('Username must be 3-50 characters: letters, digits, dot, dash or underscore.');
  }
  if (fullName !== undefined && fullName.length < 2) errors.push('Full name is required.');
  if (email !== undefined && !EMAIL_RE.test(email)) errors.push('A valid e-mail address is required.');
  if (role === null) errors.push('Role must be one of: Administrator, Publisher, Editor, Viewer.');
  if (requirePassword && typeof password !== 'string') errors.push('A temporary password is required.');
  if (typeof password === 'string' && password) {
    errors.push(...passwordProblems(password, username || '').map((problem) => `Password ${problem}.`));
  }
  return errors;
}

async function createAccount(body, actor, { encrypted = false, csrf = null } = {}) {
  const username = String(body.username || '').trim().toLowerCase();
  const fullName = String(body.full_name || body.name || '').trim().slice(0, 150);
  const email = String(body.email || '').trim().toLowerCase().slice(0, 190);
  const role = normaliseRole(body.role);
  const password = encrypted ? decryptSecret(body.password, csrf) : body.password;
  const errors = validate({ username, fullName, email, role, password, requirePassword: true });
  if (errors.length) throw new ApiError(400, errors.join(' '), errors);
  if (await usersRepository.findByUsername(username)) throw new ApiError(409, 'This username is already in use.');
  if (await usersRepository.findByEmail(email)) throw new ApiError(409, 'This e-mail address is already in use.');

  const id = await usersRepository.create({
    username,
    full_name: fullName,
    email,
    role,
    password_hash: await bcrypt.hash(password, 12),
    is_active: body.is_active === false || body.is_active === 0 ? 0 : 1,
    must_change_password: 1
  });
  await record(actor, 'USER_CREATE', username, role, '');
  return { id, ok: true };
}

async function updateAccount(id, body, actor, { encrypted = false, csrf = null } = {}) {
  const row = await usersRepository.getById(id);
  if (!row) throw new ApiError(404, 'User not found.');
  const role = body.role !== undefined ? normaliseRole(body.role) : row.role;
  const fullName = body.full_name !== undefined ? String(body.full_name).trim().slice(0, 150) : row.full_name;
  const email = body.email !== undefined ? String(body.email).trim().toLowerCase().slice(0, 190) : row.email;
  const errors = validate({ username: row.username, fullName, email, role });
  if (errors.length) throw new ApiError(400, errors.join(' '), errors);
  if (Number(id) === Number(actor.id) && (role !== 'admin' || body.is_active === false || body.is_active === 0)) {
    throw new ApiError(400, 'You cannot remove your own administrator access.');
  }
  if (email !== row.email) {
    const clash = await usersRepository.findByEmail(email);
    if (clash && Number(clash.user_id) !== Number(id)) throw new ApiError(409, 'This e-mail address is already in use.');
  }
  const isActive = body.is_active === undefined ? row.is_active : body.is_active ? 1 : 0;
  await usersRepository.update(id, { full_name: fullName, email, role, is_active: isActive });

  let password = body.password;
  if (encrypted && password) password = decryptSecret(password, csrf);
  if (password) {
    const problems = passwordProblems(password, row.username);
    if (problems.length) throw new ApiError(400, `Password ${problems.join(', ')}.`);
    await usersRepository.setPasswordHash(id, await bcrypt.hash(password, 12), true);
    await q('DELETE FROM sessions WHERE user_id = ?', [id]);
  }
  if (body.unlock) await usersRepository.unlock(id);
  if (!isActive) await q('DELETE FROM sessions WHERE user_id = ?', [id]);
  await record(actor, 'USER_UPDATE', row.username, role, '');
  return { ok: true };
}

async function setStatus(id, isActive, actor) {
  if (Number(id) === Number(actor.id)) throw new ApiError(400, 'You cannot deactivate your own account.');
  const row = await usersRepository.getById(id);
  if (!row) throw new ApiError(404, 'User not found.');
  await q('UPDATE users SET is_active = ? WHERE user_id = ?', [isActive ? 1 : 0, id]);
  if (!isActive) await q('DELETE FROM sessions WHERE user_id = ?', [id]);
  await record(actor, 'USER_UPDATE', row.username, isActive ? 'active' : 'inactive', '');
  return { ok: true };
}

async function remove(id, actor) {
  if (Number(id) === Number(actor.id)) throw new ApiError(400, 'You cannot delete your own account.');
  const row = await usersRepository.getById(id);
  if (!row) throw new ApiError(404, 'User not found.');
  await usersRepository.remove(id);
  await record(actor, 'USER_DELETE', row.username, '', '');
  return { ok: true };
}

module.exports = { list, roles, createAccount, updateAccount, setStatus, remove };
