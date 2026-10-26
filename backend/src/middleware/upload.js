// src/middleware/upload.js — single-file uploads held in memory, then saved
// by the media service after the real file signature has been checked.
const multer = require('multer');
const path = require('path');
const config = require('../config');
const ApiError = require('../utils/ApiError');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.limits.maxUploadBytes, files: 1, fields: 8 }
});

const TYPES = {
  pdf: { mime: 'application/pdf', test: (b) => b.subarray(0, 5).toString('latin1') === '%PDF-' },
  png: { mime: 'image/png', test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  jpg: { mime: 'image/jpeg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  webp: { mime: 'image/webp', test: (b) => b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP' },
  mp4: { mime: 'video/mp4', test: (b) => b.subarray(4, 8).toString('latin1') === 'ftyp' },
  vtt: { mime: 'text/vtt', test: (b) => /^WEBVTT/.test(b.subarray(0, 20).toString('latin1')) }
};
const ALIASES = { jpeg: 'jpg' };

/** Returns { ext, mime } when the buffer is an allowed file type. */
function detectFileType(buffer, originalName) {
  const rawExt = path.extname(originalName || '').slice(1).toLowerCase();
  const ext = ALIASES[rawExt] || rawExt;
  const type = TYPES[ext];
  if (!type || !buffer || buffer.length < 4 || !type.test(buffer)) return null;
  // Block double-extension tricks (evil.php.pdf already fails the signature,
  // but reject script-like stems explicitly too).
  return /\.(php|phtml|js|mjs|html?|svg|exe|sh|bat|cmd)\b/i.test((originalName || '').replace(/\.[^.]+$/, ''))
    ? null
    : { ext, mime: type.mime };
}

const singleFile = (field = 'file') => (req, res, next) => {
  upload.single(field)(req, res, (err) => {
    if (err) return next(err);
    if (!req.file) return next(new ApiError(400, 'Please choose a file to upload.'));
    const detected = detectFileType(req.file.buffer, req.file.originalname);
    if (!detected) {
      return next(new ApiError(400, 'Only PDF, PNG, JPG, WEBP, MP4 and VTT files are allowed.'));
    }
    req.file.detected = detected;
    return next();
  });
};

module.exports = { singleFile, detectFileType, ALLOWED_EXTENSIONS: Object.keys(TYPES) };
