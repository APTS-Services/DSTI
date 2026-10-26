// src/utils/security.js — cryptography helpers for the CMS.
const crypto = require('crypto');

// Keep both keys as KeyObjects: privateDecrypt() does not accept a raw DER
// buffer (it would try to parse the bytes as PEM).
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const publicKeySpki = publicKey.export({ type: 'spki', format: 'der' }).toString('base64');

/**
 * Decrypts a password sent by the browser with the server's RSA public key.
 * The plaintext is a JSON object { p: password, n: nonce }, so a ciphertext
 * can only be replayed against the nonce it was issued for.
 */
function decryptSecret(ciphertext, nonce) {
  if (typeof ciphertext !== 'string' || !ciphertext || !nonce) return null;
  try {
    const buffer = Buffer.from(ciphertext, 'base64');
    const plain = crypto.privateDecrypt(
      { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
      buffer
    );
    const parsed = JSON.parse(plain.toString('utf8'));
    if (!parsed || typeof parsed.p !== 'string' || parsed.n !== nonce) return null;
    return parsed.p;
  } catch {
    return null;
  }
}

const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');
const sha256 = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');

/** Constant-time string comparison. */
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

const COMMON = new Set([
  'password', 'password1', 'password123', '12345678', '123456789', 'qwerty123',
  'admin123', 'welcome1', 'letmein1', 'dsti1234', 'changeme'
]);

/** Returns a list of policy violations (empty = acceptable). */
function passwordProblems(password, identifier = '') {
  const problems = [];
  const value = String(password || '');
  if (value.length < 10) problems.push('must be at least 10 characters long');
  if (value.length > 64) problems.push('must be at most 64 characters long');
  if (!/[a-z]/.test(value)) problems.push('must include a lowercase letter');
  if (!/[A-Z]/.test(value)) problems.push('must include an uppercase letter');
  if (!/\d/.test(value)) problems.push('must include a digit');
  if (!/[^A-Za-z0-9]/.test(value)) problems.push('must include a symbol');
  if (!/^[\x20-\x7E]*$/.test(value)) problems.push('must use English keyboard characters only');
  if (value && COMMON.has(value.toLowerCase())) problems.push('is too common');
  const id = String(identifier || '').toLowerCase().split('@')[0];
  if (id && id.length >= 3 && value.toLowerCase().includes(id)) problems.push('must not contain your username');
  return problems;
}

/** Hashed visitor identifier for analytics — no raw IP is ever stored. */
function hashVisitor(value) {
  return sha256(`${value}|${process.env.JWT_SECRET || 'dsti'}`);
}

module.exports = { publicKeySpki, decryptSecret, randomToken, sha256, safeEqual, passwordProblems, hashVisitor };
