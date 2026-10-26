// Fetch wrapper for the DSTI API.
//
// Every request goes to the single Express backend (VITE_API_BASE_URL, default
// http://localhost:5000) and never to the React dev server, so the API works on
// 5173, 4173, a static host or the production domain without a proxy.
const RAW_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/** Origin of the backend, without a trailing slash (a "/api" suffix is tolerated). */
export const API_BASE_URL = String(RAW_BASE).replace(/\/+$/, '').replace(/\/api$/i, '');

/** Absolute URL for an API path such as "/api/public/content". */
export const apiUrl = (path = '') => `${API_BASE_URL}${String(path).startsWith('/') ? '' : '/'}${path}`;

/**
 * Absolute URL for a file served by the backend (/uploads/...). Frontend
 * assets (/images/...), data: URIs and complete URLs are returned unchanged.
 */
export const assetUrl = (path) => {
  const value = String(path || '');
  if (!value) return '';
  if (/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(value)) return value;
  return value.startsWith('/uploads/') ? apiUrl(value) : value;
};

let csrfToken = null;
export const setCsrf = (t) => {
  csrfToken = t || null;
};
export const getCsrf = () => csrfToken;

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.error || `Request failed (${status})`);
    this.status = status;
    this.body = body || {};
  }
}

const listeners = new Set();
/** Subscribe to authentication failures (expired session). */
export const onUnauthorized = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export async function api(path, { method = 'GET', body, form, headers = {} } = {}) {
  const opts = { method, credentials: 'include', headers: { Accept: 'application/json', ...headers } };
  if (csrfToken && method !== 'GET') opts.headers['X-CSRF-Token'] = csrfToken;
  if (form) opts.body = form;
  else if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(apiUrl(path), opts);
  if (res.status === 204) return null;
  const isJson = (res.headers.get('content-type') || '').includes('json');
  const data = isJson ? await res.json().catch(() => ({})) : null;
  if (!res.ok) {
    if (res.status === 401 && path.startsWith('/api/admin')) listeners.forEach((fn) => fn());
    throw new ApiError(res.status, data);
  }
  return data;
}

// ---- Password transport encryption (RSA-OAEP / SHA-256 via Web Crypto) ----
let keyPromise = null;
const b64ToBuf = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
const bufToB64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));

async function serverKey() {
  if (!keyPromise) {
    keyPromise = api('/api/auth/key').then(({ key }) =>
      crypto.subtle.importKey('spki', b64ToBuf(key), { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt']),
    );
    keyPromise.catch(() => {
      keyPromise = null;
    });
  }
  return keyPromise;
}

/** Encrypts a secret together with a server-issued nonce. */
export async function encryptSecret(secret, nonce) {
  if (!window.crypto?.subtle) throw new Error('Secure sign-in requires HTTPS (or localhost).');
  const key = await serverKey();
  const data = new TextEncoder().encode(JSON.stringify({ p: secret, n: nonce }));
  return bufToB64(await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, data));
}
