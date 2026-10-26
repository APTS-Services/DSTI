// src/utils/http.js — response envelopes and request helpers.
const ApiError = require('./ApiError');

/** Wraps an async route handler so rejections reach the error middleware. */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/**
 * /api/v1 success envelope:
 *   { success: true, data: ..., meta?: {...} }
 */
function sendSuccess(res, data, meta) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.json(body);
}

function sendCreated(res, data, meta) {
  res.status(201);
  return sendSuccess(res, data, meta);
}

/**
 * /api/v1 error envelope:
 *   { success: false, error: { code, message, details? } }
 */
function sendError(res, status, code, message, details) {
  const error = { code, message };
  if (details !== undefined) error.details = details;
  return res.status(status).json({ success: false, error });
}

/** Reads page/limit query parameters with safe bounds. */
function pageParams(query, { defaultLimit = 20, maxLimit = 100 } = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, offset: (page - 1) * limit };
}

function meta(page, limit, total) {
  return { page, limit, total: Number(total) || 0, pages: Math.max(1, Math.ceil((Number(total) || 0) / limit)) };
}

/** Escapes % and _ for use inside a LIKE pattern. */
function likeTerm(value, max = 100) {
  return String(value || '').trim().slice(0, max).replace(/[\\%_]/g, (c) => `\\${c}`);
}

const ENUMS = {
  lang: ['en', 'te']
};

module.exports = { ApiError, asyncHandler, sendSuccess, sendCreated, sendError, pageParams, meta, likeTerm, ENUMS };
