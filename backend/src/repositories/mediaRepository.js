// src/repositories/mediaRepository.js — media_files table.
const { q, one } = require('../config/db');

async function insert({ fileName, filePath, mime, sizeKb, altEn = null, altTe = null, uploadedBy = null }) {
  const result = await q(
    `INSERT INTO media_files (file_name, file_path, mime_type, file_size_kb, alt_text_en, alt_text_te, uploaded_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [fileName, filePath, mime, sizeKb, altEn, altTe, uploadedBy]
  );
  return result.insertId;
}

/** Legacy/CMS view (the admin media library). */
async function listForAdmin(limit = 500) {
  const rows = await q(
    'SELECT file_id, file_name, file_path, mime_type, file_size_kb, alt_text_en, alt_text_te, uploaded_at FROM media_files ORDER BY file_id DESC LIMIT ?',
    [limit]
  );
  return rows.map((row) => ({
    id: row.file_id,
    original_name: row.file_name,
    stored_name: String(row.file_path || '').split('/').pop(),
    url: row.file_path,
    mime: row.mime_type,
    size_bytes: Number(row.file_size_kb || 0) * 1024,
    created_at: row.uploaded_at
  }));
}

/** /api/v1 view. */
async function list({ page = 1, limit = 50 } = {}) {
  const offset = (page - 1) * limit;
  const rows = await q('SELECT * FROM media_files ORDER BY file_id DESC LIMIT ? OFFSET ?', [limit, offset]);
  const [{ total }] = await q('SELECT COUNT(*) AS total FROM media_files');
  return { rows, total };
}

async function getById(id) {
  return one('SELECT * FROM media_files WHERE file_id = ?', [id]);
}

async function getByPath(filePath) {
  return one('SELECT * FROM media_files WHERE file_path = ? LIMIT 1', [filePath]);
}

async function pathsByIds(ids) {
  const clean = [...new Set((ids || []).map(Number).filter(Boolean))];
  if (!clean.length) return new Map();
  const rows = await q(`SELECT file_id, file_path FROM media_files WHERE file_id IN (${clean.map(() => '?').join(',')})`, clean);
  return new Map(rows.map((row) => [row.file_id, row.file_path]));
}

async function updateAlt(id, { altEn, altTe }) {
  await q('UPDATE media_files SET alt_text_en = ?, alt_text_te = ? WHERE file_id = ?', [altEn || null, altTe || null, id]);
}

async function remove(id) {
  const row = await getById(id);
  await q('DELETE FROM media_files WHERE file_id = ?', [id]);
  return row;
}

module.exports = { insert, listForAdmin, list, getById, getByPath, pathsByIds, updateAlt, remove };
