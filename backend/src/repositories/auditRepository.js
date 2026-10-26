// src/repositories/auditRepository.js — audit_log reads for the CMS and API.
const { q } = require('../config/db');

async function recent(limit = 8) {
  return q(
    `SELECT audit_id AS id, username, action, target, details, ip_address AS ip, created_at
     FROM audit_log ORDER BY audit_id DESC LIMIT ?`,
    [limit]
  );
}

async function listForAdmin(limit = 500) {
  return q(
    `SELECT audit_id AS id, username, action, target, details, ip_address AS ip, created_at
     FROM audit_log ORDER BY audit_id DESC LIMIT ?`,
    [limit]
  );
}

async function list({ user, action, table, from, to, page = 1, limit = 50 }) {
  const where = [];
  const params = [];
  if (user) {
    where.push('(username LIKE ? OR user_id = ?)');
    params.push(`%${user}%`, Number(user) || 0);
  }
  if (action) {
    where.push('action = ?');
    params.push(action);
  }
  if (table) {
    where.push('table_name = ?');
    params.push(table);
  }
  if (from) {
    where.push('created_at >= ?');
    params.push(`${from} 00:00:00`);
  }
  if (to) {
    where.push('created_at <= ?');
    params.push(`${to} 23:59:59`);
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [{ total }] = await q(`SELECT COUNT(*) AS total FROM audit_log ${clause}`, params);
  const rows = await q(
    `SELECT audit_id AS id, user_id, username, action, table_name, record_id, target, details, ip_address AS ip, created_at
     FROM audit_log ${clause} ORDER BY audit_id DESC LIMIT ? OFFSET ?`,
    [...params, limit, (page - 1) * limit]
  );
  return { rows, total };
}

module.exports = { recent, listForAdmin, list };
