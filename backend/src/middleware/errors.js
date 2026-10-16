// Uniform error handling. Internal details are logged, never sent to clients.
export function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'Request is too large.' });
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Malformed request.' });
  if (err?.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'File is too large.' });
  if (err?.status && err.status < 500) return res.status(err.status).json({ error: err.expose ? err.message : 'Bad request.' });
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}:`, err?.stack || err);
  return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
}

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.expose = true;
  }
}
