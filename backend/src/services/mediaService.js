// src/services/mediaService.js — store uploaded files and their metadata.
const fs = require('fs/promises');
const path = require('path');
const config = require('../config');
const ApiError = require('../utils/ApiError');
const mediaRepository = require('../repositories/mediaRepository');
const { randomToken } = require('../utils/security');
const { record } = require('../utils/audit');
const { cleanString } = require('../utils/validate');

async function saveFile(file, user, req) {
  if (!file || !file.detected) throw new ApiError(400, 'Please choose a file to upload.');
  const storedName = `${randomToken(16)}.${file.detected.ext}`;
  await fs.mkdir(config.paths.uploadsDir, { recursive: true });
  await fs.writeFile(path.join(config.paths.uploadsDir, storedName), file.buffer, { mode: 0o640 });

  const original = cleanString(file.originalname, 200).replace(/[^\w.\- ()]/g, '_') || storedName;
  const filePath = `/uploads/${storedName}`;
  const sizeKb = Math.max(1, Math.ceil(file.size / 1024));
  const id = await mediaRepository.insert({
    fileName: original,
    filePath,
    mime: file.detected.mime,
    sizeKb,
    uploadedBy: user?.id || null
  });
  await record(user, 'UPLOAD', storedName, original, req?.ip || '');
  return {
    file_id: id,
    file_name: original,
    file_path: filePath,
    url: filePath,
    mime_type: file.detected.mime,
    file_size_kb: sizeKb,
    size_bytes: file.size
  };
}

async function listForAdmin() {
  return mediaRepository.listForAdmin();
}

async function list(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 50));
  const { rows, total } = await mediaRepository.list({ page, limit });
  return {
    rows: rows.map((row) => ({
      id: row.file_id,
      file_name: row.file_name,
      file_path: row.file_path,
      mime_type: row.mime_type,
      file_size_kb: row.file_size_kb,
      alt_text: { en: row.alt_text_en || '', te: row.alt_text_te || '' },
      uploaded_at: row.uploaded_at
    })),
    meta: { page, limit, total: Number(total) || 0, pages: Math.max(1, Math.ceil((Number(total) || 0) / limit)) }
  };
}

async function updateAlt(id, body) {
  const row = await mediaRepository.getById(id);
  if (!row) throw new ApiError(404, 'File not found.');
  const alt = body?.alt_text && typeof body.alt_text === 'object' ? body.alt_text : null;
  await mediaRepository.updateAlt(id, {
    altEn: alt ? alt.en : body?.alt_text_en,
    altTe: alt ? alt.te : body?.alt_text_te
  });
  return mediaRepository.getById(id);
}

/** Path on disk for a stored media row (null when the file is missing). */
function absolutePath(row) {
  if (!row?.file_path) return null;
  const name = path.basename(row.file_path);
  return path.join(config.paths.uploadsDir, name);
}

async function remove(id, user, req) {
  const row = await mediaRepository.getById(id);
  if (!row) throw new ApiError(404, 'File not found.');
  const diskPath = absolutePath(row);
  if (diskPath) await fs.rm(diskPath, { force: true });
  await mediaRepository.remove(id);
  await record(user, 'UPLOAD_DELETE', path.basename(row.file_path || ''), '', req?.ip || '');
  return { ok: true };
}

module.exports = { saveFile, listForAdmin, list, updateAlt, remove, absolutePath };
