// Server-side image CAPTCHA. Answers live only in server memory, are single-use
// and expire after five minutes.
import svgCaptcha from 'svg-captcha';
import { randomToken } from './security.js';

const TTL_MS = 5 * 60 * 1000;
const MAX_ENTRIES = 5000;
const store = new Map();

function prune() {
  const now = Date.now();
  for (const [id, entry] of store) if (entry.expires < now) store.delete(id);
  while (store.size > MAX_ENTRIES) store.delete(store.keys().next().value);
}

export function createCaptcha() {
  prune();
  const c = svgCaptcha.create({ size: 5, noise: 3, ignoreChars: '0oO1iIlL', color: false, background: '#f1f4fa', width: 150, height: 48 });
  const id = randomToken(16);
  store.set(id, { text: c.text.toLowerCase(), expires: Date.now() + TTL_MS });
  return { id, svg: c.data };
}

/** Checks and consumes a CAPTCHA. Any attempt (right or wrong) invalidates it. */
export function verifyCaptcha(id, answer) {
  if (typeof id !== 'string' || typeof answer !== 'string') return false;
  const entry = store.get(id);
  store.delete(id);
  return Boolean(entry && entry.expires >= Date.now() && entry.text === answer.trim().toLowerCase());
}

export function captchaExists(id) {
  const entry = store.get(id);
  return Boolean(entry && entry.expires >= Date.now());
}

/** Test helper only — never exposed over HTTP. */
export function peekCaptcha(id) {
  return store.get(id)?.text;
}
