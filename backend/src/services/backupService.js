// src/services/backupService.js — JSON content backups on disk.
const fs = require('fs/promises');
const path = require('path');
const config = require('../config');
const ApiError = require('../utils/ApiError');
const contentRepository = require('../repositories/contentRepository');
const { q, one } = require('../config/db');
const { record } = require('../utils/audit');

async function create(user) {
  const data = await contentRepository.dump();
  await fs.mkdir(config.paths.backupsDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `dsti-content-${stamp}.json`;
  const body = JSON.stringify(data, null, 1);
  await fs.writeFile(path.join(config.paths.backupsDir, fileName), body, { mode: 0o640 });
  const result = await q(
    'INSERT INTO backups (file_name, size_bytes, created_by) VALUES (?, ?, ?)',
    [fileName, Buffer.byteLength(body), user?.id || null]
  );
  await record(user, 'BACKUP_CREATE', fileName, `${data.items.length} items`, '');
  return { id: result.insertId, file_name: fileName, size_bytes: Buffer.byteLength(body), items: data.items.length };
}

async function list() {
  const rows = await q(
    `SELECT b.backup_id AS id, b.file_name, b.size_bytes, b.created_at, u.username
     FROM backups b LEFT JOIN users u ON u.user_id = b.created_by ORDER BY b.backup_id DESC LIMIT 100`
  );
  return rows;
}

async function restore(id, user, confirm) {
  if (confirm !== true) throw new ApiError(400, 'Restore must be confirmed with { "confirm": true }.');
  const row = await one('SELECT file_name FROM backups WHERE backup_id = ?', [id]);
  if (!row) throw new ApiError(404, 'Backup not found.');
  const filePath = path.join(config.paths.backupsDir, path.basename(row.file_name));
  let parsed;
  try {
    parsed = JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch {
    throw new ApiError(404, 'The backup file is missing or unreadable.');
  }
  const result = await contentRepository.restore(parsed.items || []);
  await record(user, 'BACKUP_RESTORE', row.file_name, `${result.restored} items`, '');
  return result;
}

module.exports = { create, list, restore };
