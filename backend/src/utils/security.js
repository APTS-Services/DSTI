// Cryptographic helpers: random tokens, hashing and transport encryption of
// passwords (RSA-OAEP). The browser encrypts passwords with a key generated at
// start-up so that they are never sent in clear text, even inside TLS logs.
import crypto from 'node:crypto';

export const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');
export const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
export const publicKeySpki = publicKey.export({ type: 'spki', format: 'der' }).toString('base64');

/**
 * Decrypts a base64 RSA-OAEP(SHA-256) blob containing JSON {p, n} and checks
 * that the nonce `n` matches the one issued by the server (prevents replay).
 * Returns the secret, or null if anything is wrong.
 */
export function decryptSecret(blob, expectedNonce) {
  if (typeof blob !== 'string' || blob.length > 1024 || !expectedNonce) return null;
  try {
    const plain = crypto.privateDecrypt(
      { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
      Buffer.from(blob, 'base64'),
    );
    const { p, n } = JSON.parse(plain.toString('utf8'));
    if (typeof p !== 'string' || typeof n !== 'string') return null;
    const a = Buffer.from(n);
    const b = Buffer.from(String(expectedNonce));
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    return p;
  } catch {
    return null;
  }
}

/** Used by the automated tests to emulate the browser. */
export function encryptSecret(p, n) {
  return crypto
    .publicEncrypt({ key: publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, Buffer.from(JSON.stringify({ p, n })))
    .toString('base64');
}

export function safeEqual(a, b) {
  const x = Buffer.from(String(a || ''));
  const y = Buffer.from(String(b || ''));
  return x.length === y.length && x.length > 0 && crypto.timingSafeEqual(x, y);
}

/** Password policy: 10-64 chars, upper, lower, digit and special character. */
export function passwordProblems(pw, username = '') {
  const problems = [];
  if (typeof pw !== 'string' || pw.length < 10 || pw.length > 64) problems.push('must be 10 to 64 characters long');
  if (!/[A-Z]/.test(pw || '')) problems.push('must contain an uppercase letter');
  if (!/[a-z]/.test(pw || '')) problems.push('must contain a lowercase letter');
  if (!/[0-9]/.test(pw || '')) problems.push('must contain a digit');
  if (!/[^A-Za-z0-9]/.test(pw || '')) problems.push('must contain a special character');
  if (!/^[\x20-\x7E]*$/.test(pw || '')) problems.push('must use English keyboard characters only');
  if (username && (pw || '').toLowerCase().includes(username.toLowerCase())) problems.push('must not contain the username');
  return problems;
}
