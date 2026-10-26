// src/utils/captcha.js — small self-hosted CAPTCHA (no third-party service).
// Codes live in memory for five minutes and can be used once.
const crypto = require('crypto');

const TTL_MS = 5 * 60 * 1000;
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const store = new Map();

function prune() {
  const now = Date.now();
  for (const [id, entry] of store) {
    if (entry.expires < now) store.delete(id);
  }
}

const randomCode = () =>
  Array.from({ length: 5 }, () => ALPHABET[crypto.randomInt(0, ALPHABET.length)]).join('');

function svgFor(code) {
  const chars = code.split('');
  const noise = Array.from({ length: 7 }, () => {
    const x1 = crypto.randomInt(0, 140);
    const y1 = crypto.randomInt(0, 48);
    const x2 = crypto.randomInt(0, 140);
    const y2 = crypto.randomInt(0, 48);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#9aa7c7" stroke-width="1" opacity="0.5"/>`;
  }).join('');
  const letters = chars
    .map((char, i) => {
      const rotate = crypto.randomInt(-16, 17);
      const y = 26 + crypto.randomInt(-3, 4);
      return `<text x="${16 + i * 21}" y="${y}" font-family="Georgia,serif" font-size="24" font-weight="700" fill="#1a2b4a" transform="rotate(${rotate} ${16 + i * 21} ${y})">${char}</text>`;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="48" viewBox="0 0 140 48" role="img" aria-label="Security code"><rect width="140" height="48" fill="#eef2f8"/>${noise}${letters}</svg>`;
}

/** Creates a CAPTCHA and returns { id, svg }. */
function createCaptcha() {
  prune();
  const code = randomCode();
  const id = crypto.randomBytes(16).toString('hex');
  store.set(id, { answer: code.toLowerCase(), expires: Date.now() + TTL_MS });
  return { id, svg: svgFor(code) };
}

function captchaExists(id) {
  prune();
  return Boolean(id && store.has(id));
}

/** Verifies (and consumes) an answer. Comparison is case-insensitive. */
function verifyCaptcha(id, answer) {
  prune();
  const entry = store.get(id);
  if (!entry) return false;
  store.delete(id);
  if (entry.expires < Date.now()) return false;
  return typeof answer === 'string' && answer.trim().toLowerCase() === entry.answer;
}

const timer = setInterval(prune, 5 * 60 * 1000);
if (typeof timer.unref === 'function') timer.unref();

module.exports = { createCaptcha, verifyCaptcha, captchaExists };
