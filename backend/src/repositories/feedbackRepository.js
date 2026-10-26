// src/repositories/feedbackRepository.js — feedback table.
const { q, one } = require('../config/db');

async function insert({ name, email, phone = '', subject = '', message, ipHash = null }) {
  const result = await q(
    'INSERT INTO feedback (name, email, phone, subject, message, ip_hash) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, phone, subject, message, ipHash]
  );
  return result.insertId;
}

async function markNotified(id) {
  await q('UPDATE feedback SET notified_at = UTC_TIMESTAMP() WHERE feedback_id = ?', [id]);
}

/** Shape used by the React admin. */
function toAdmin(row) {
  return {
    id: row.feedback_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    status: row.status === 'replied' || row.status === 'closed' ? 'resolved' : row.status,
    notified: Boolean(row.notified_at),
    handled_by: row.handled_by,
    created_at: row.created_at
  };
}

async function listForAdmin(limit = 1000) {
  const rows = await q('SELECT * FROM feedback ORDER BY feedback_id DESC LIMIT ?', [limit]);
  return rows.map(toAdmin);
}

async function list({ status, from, to, page = 1, limit = 20 }) {
  const where = [];
  const params = [];
  if (status) {
    where.push('status = ?');
    params.push(status);
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
  const [{ total }] = await q(`SELECT COUNT(*) AS total FROM feedback ${clause}`, params);
  const rows = await q(`SELECT * FROM feedback ${clause} ORDER BY feedback_id DESC LIMIT ? OFFSET ?`, [
    ...params,
    limit,
    (page - 1) * limit
  ]);
  return { rows, total };
}

async function getById(id) {
  return one('SELECT * FROM feedback WHERE feedback_id = ?', [id]);
}

async function markRead(id) {
  await q("UPDATE feedback SET status = 'read' WHERE feedback_id = ? AND status = 'new'", [id]);
}

async function setStatus(id, status) {
  await q('UPDATE feedback SET status = ? WHERE feedback_id = ?', [status, id]);
}

async function setHandler(id, userId) {
  await q('UPDATE feedback SET handled_by = ? WHERE feedback_id = ?', [userId, id]);
}

async function remove(id) {
  await q('DELETE FROM feedback WHERE feedback_id = ?', [id]);
}

async function unreadCount() {
  const row = await one("SELECT COUNT(*) AS total, SUM(status = 'new') AS unread FROM feedback");
  return { total: Number(row?.total || 0), unread: Number(row?.unread || 0) };
}

async function allForExport() {
  return q('SELECT feedback_id, name, email, phone, subject, message, status, created_at FROM feedback ORDER BY feedback_id DESC');
}

module.exports = {
  insert, markNotified, listForAdmin, list, getById, markRead, setStatus, setHandler, remove, unreadCount, allForExport, toAdmin
};
