// src/middleware/errorMiddleware.js — central error handler.
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const V1_CODES = {
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  413: 'PAYLOAD_TOO_LARGE',
  415: 'UNSUPPORTED_MEDIA_TYPE',
  423: 'ACCOUNT_LOCKED',
  429: 'RATE_LIMITED',
  500: 'INTERNAL_ERROR'
};

function duplicateMessage(err) {
  const sql = err.sqlMessage || '';
  if (sql.includes('username')) return 'This username is already in use.';
  if (sql.includes('email')) return 'This e-mail address is already in use.';
  if (sql.includes('slug')) return 'This identifier is already in use.';
  if (sql.includes('tender_number')) return 'This tender number already exists.';
  return 'A record with these details already exists.';
}

module.exports = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  let status = err.status || err.statusCode || 500;
  let message = 'Internal Server Error';
  let details;

  if (err instanceof ApiError) {
    status = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err && err.name === 'MulterError') {
    status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'The file is too large.' : 'The upload could not be processed.';
  } else if (err && err.type === 'entity.too.large') {
    status = 413;
    message = 'Request body is too large.';
  } else if (err && err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON in the request body.';
  } else if (err && err.message === 'Not allowed by CORS') {
    status = 403;
    message = 'This origin is not allowed to call the API.';
  } else if (err && err.code === 'ER_DUP_ENTRY') {
    status = 409;
    message = duplicateMessage(err);
  } else if (err && err.code === 'ER_NO_REFERENCED_ROW_2') {
    status = 400;
    message = 'A referenced record does not exist.';
  } else if (err && err.code === 'ER_ROW_IS_REFERENCED_2') {
    status = 409;
    message = 'This record is still referenced by other content and cannot be deleted.';
  } else if (err && err.code === 'ECONNREFUSED') {
    status = 503;
    message = 'The database is not reachable.';
  }

  const logLine = `[${req.id || '?'}] ${req.method} ${req.originalUrl} -> ${status} ${err && err.message}`;
  if (status >= 500) logger.error(`${logLine}\n${err && err.stack ? err.stack : ''}`);
  else logger.warn(logLine);

  if (status >= 500) {
    message = 'Internal Server Error';
    details = undefined;
  }

  if (String(req.originalUrl || '').split('?')[0].startsWith('/api/v1')) {
    const error = { code: err.code && !err.code.startsWith('ER_') ? err.code : V1_CODES[status] || 'ERROR', message };
    if (details !== undefined) error.details = details;
    return res.status(status).json({ success: false, error });
  }

  // Frontend-compatible shape (the admin client reads `error` / `errors`).
  const body = { error: message };
  if (details !== undefined) body.errors = Array.isArray(details) ? details : [String(details)];
  if (err.code && !String(err.code).startsWith('ER_')) body.code = err.code;
  return res.status(status).json(body);
};
