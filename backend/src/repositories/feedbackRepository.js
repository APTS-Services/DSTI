// src/repositories/feedbackRepository.js — feedback table.
const { q, one } = require('../config/db');

async function insert({ name, email, phone = '', category = null, subject = '', message, ipHash = null }) {
  const result = await q(
    'INSERT INTO feedback (name, email, phone, category, subject, message, ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, email, phone, category, subject, message, ipHash]
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
    category: row.category || '',
    subject: row.subject,
    message: row.message,
    status: row.status === 'closed' ? 'resolved' : row.status,
    response: row.response || '',
    responded_at: row.responded_at,
    resolved_at: row.resolved_at,
    notified: Boolean(row.notified_at),
    handled_by: row.handled_by,
    handler_name: row.handler_name || '',
    created_at: row.created_at
  };
}

async function listForAdmin(limit = 1000) {
  const rows = await q(
    `SELECT f.*, u.full_name AS handler_name FROM feedback f
     LEFT JOIN users u ON u.user_id = f.handled_by
     ORDER BY f.feedback_id DESC LIMIT ?`,
    [limit]
  );
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

/** Resolving (or closing) also stamps resolved_at once; it counts as answered. */
async function setStatus(id, status) {
  const done = ['replied', 'resolved', 'closed'].includes(status);
  await q(
    `UPDATE feedback SET status = ?,
       responded_at = CASE WHEN ? AND responded_at IS NULL THEN NOW() ELSE responded_at END,
       resolved_at = CASE WHEN ? THEN COALESCE(resolved_at, NOW()) ELSE NULL END
     WHERE feedback_id = ?`,
    [status, done, ['resolved', 'closed'].includes(status), id]
  );
}

async function saveResponse(id, response, userId) {
  await q(
    `UPDATE feedback SET response = ?, status = 'replied', handled_by = ?,
       responded_at = COALESCE(responded_at, NOW())
     WHERE feedback_id = ?`,
    [response, userId, id]
  );
}

const ANSWERED = "status IN ('replied','resolved','closed')";

/**
 * Aggregate figures for the public dashboard and the CMS: no personal data.
 * Response time is measured from receipt to the first reply (or resolution).
 */
async function stats() {
  const totals = await one(
    `SELECT COUNT(*) AS received,
            SUM(${ANSWERED}) AS answered,
            SUM(status = 'new') AS unread,
            SUM(created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS last30,
            AVG(CASE WHEN ${ANSWERED} AND responded_at IS NOT NULL
                     THEN TIMESTAMPDIFF(MINUTE, created_at, responded_at) END) AS avgMinutes,
            SUM(${ANSWERED} AND responded_at IS NOT NULL
                AND TIMESTAMPDIFF(HOUR, created_at, responded_at) <= 168) AS within7
     FROM feedback`
  );
  const months = await q(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS received, SUM(${ANSWERED}) AS answered
     FROM feedback WHERE created_at >= DATE_SUB(DATE_FORMAT(NOW(), '%Y-%m-01'), INTERVAL 5 MONTH)
     GROUP BY month ORDER BY month`
  );
  const categories = await q(
    `SELECT COALESCE(NULLIF(category, ''), 'General') AS category, COUNT(*) AS received, SUM(${ANSWERED}) AS answered
     FROM feedback GROUP BY 1 ORDER BY received DESC LIMIT 8`
  );
  return { totals, months, categories };
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
  return q(
    `SELECT feedback_id, name, email, phone, category, subject, message, status, response, created_at, responded_at
     FROM feedback ORDER BY feedback_id DESC`
  );
}

module.exports = {
  insert, markNotified, listForAdmin, list, getById, markRead, setStatus, saveResponse, setHandler, remove, unreadCount,
  stats, allForExport, toAdmin
};
