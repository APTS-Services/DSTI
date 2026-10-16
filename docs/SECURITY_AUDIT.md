# Security Audit Compliance Report — DSTI Website

Prepared for the CERT-In empanelled security audit before go-live, and kept up to date for the half-yearly audits.
Scope: public website, CMS (`/admin`), REST API (`/api`), file uploads (`/uploads`), hosting configuration.
Reference standards: OWASP Top 10 (2021), OWASP ASVS 4.0 (Level 2 controls), GIGW 3.0 security guidelines,
CERT-In "Guidelines for Secure Application Design, Development, Implementation & Operations".

Automated evidence: `backend/tests/api.test.js` (24 tests) and `e2e/tests/*.spec.js` (22 browser tests). Both pass.
Dependency scan: `npm audit` reports **0 known vulnerabilities** in `backend`, `frontend` and `e2e`.

## 1. Findings fixed during the review

The previous prototype had the following issues. All are fixed in this version.

| # | Finding (prototype) | Severity | Fix |
| --- | --- | --- | --- |
| 1 | CMS user names and passwords hard-coded in browser JavaScript; login checked only on the client | Critical | Server-side authentication with bcrypt (cost 12), sessions stored in the database |
| 2 | "Session" was a guessable token in `localStorage`, so admin pages could be opened by editing browser storage | Critical | Random 256-bit session id in an httpOnly, SameSite=Strict, Secure (`__Host-`) cookie; only its SHA-256 hash is stored |
| 3 | All CMS data (tenders, feedback, documents) lived only in the visitor's browser | High | Express + MySQL backend; feedback stored server-side |
| 4 | No CAPTCHA, rate limiting or lockout | High | Server-side image CAPTCHA (single use, 5-minute expiry), rate limits, lockout after 5 failures for 15 minutes |
| 5 | Third-party resources (Google Fonts) and no Content Security Policy | Medium | Fonts self-hosted; strict CSP with no `unsafe-inline` or `unsafe-eval`; only `youtube-nocookie.com` frames, loaded after the visitor presses play |
| 6 | Sample videos pointed to an unrelated YouTube video | Low | Removed; videos are added from the CMS |
| 7 | `web.config` with a hard-coded IP address from another project | Low | Removed; Host-header allow-list (`ALLOWED_HOSTS`) instead |
| 8 | Outdated dependencies with advisories (react-router open redirect, esbuild dev server) | Medium | Upgraded to React Router 7.18 and Vite 7 |

## 2. OWASP Top 10 controls

| OWASP 2021 | Controls in this application | Test evidence |
| --- | --- | --- |
| **A01 Broken Access Control** | Every `/api/admin` route requires a session, a CSRF token and a role (Administrator / Publisher / Editor). Editors cannot publish, delete, see feedback, settings, users, audit or backups. Admins cannot delete or demote themselves. Drafts and private settings are never in the public API. Directory listing is off; `..` paths return 404. | `role-based access…`, `admin cannot delete or demote themselves`, `drafts are hidden`, `admin pages are protected` |
| **A02 Cryptographic Failures** | HTTPS with HSTS (1 year, preload) in production. Passwords are hashed with bcrypt (cost 12) and never logged. In the browser, passwords are encrypted with RSA-OAEP-2048/SHA-256 together with a single-use server nonce, so a captured request cannot be replayed or read. Session ids are random 256-bit values; only their hashes are stored. | `rejects … plain-text passwords`, `replayed ciphertext … is refused`, `login sends no clear-text password` |
| **A03 Injection** | All SQL uses prepared statements (`mysql2` `execute` with placeholders); no string-built SQL from input. Every CMS write is validated against a schema: unknown fields are dropped, types enforced, lengths limited, markup stripped. React escapes all output, and there is no `dangerouslySetInnerHTML`, `eval` or `innerHTML` anywhere. Links must be `http(s)`, `mailto:`, `tel:` or a site path, so `javascript:` URLs are rejected. Sitemap output is XML-escaped. | `validates field types and rejects dangerous links`, `markup is stripped`, stored-XSS test on news titles |
| **A04 Insecure Design** | Draft → publish workflow; least-privilege roles; single active session per user; idle timeout of 20 minutes and absolute limit of 8 hours; full audit trail; backup and restore. | `signing in again ends the previous session` |
| **A05 Security Misconfiguration** | Helmet headers: CSP `default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP/CORP. `X-Powered-By` is removed. TRACE, OPTIONS and other unused methods return 405. Host-header allow-list. `Cache-Control: no-store` on authenticated responses. Errors are generic, with no stack traces. Request size limits and server timeouts are set. | `sends strict security headers`, `rejects TRACE / OPTIONS`, `session cookie is httpOnly…` |
| **A06 Vulnerable Components** | Minimal dependency set; `npm audit` is clean; versions are pinned in lock files. Re-run `npm audit` before each half-yearly audit. | `npm audit` |
| **A07 Identification & Authentication Failures** | CAPTCHA on login and feedback; one generic message for any failure; constant-time comparison (a dummy bcrypt hash is used for unknown users). Lockout after 5 failed attempts. Password policy: 10–64 characters, upper and lower case, digit and special character, must not contain the username, must differ from the last 3 passwords. The first password must be changed. The session id is regenerated at login and at password change. Logout destroys the server session. | `forces the initial password to be changed…`, `locks an account after 5 failed attempts`, `wrong CAPTCHA or password is rejected` |
| **A08 Software & Data Integrity Failures** | No third-party scripts or CDNs, so nothing can be swapped at runtime. Uploads are checked by both extension and file signature (PDF, PNG, JPG, WEBP, MP4 only; SVG, HTML and double extensions are rejected), renamed to random names and served with `nosniff`. Image files additionally get a sandboxing CSP. A backup restore is validated against the schema. | `accepts genuine uploads and rejects disguised or dangerous files`, `exports and restores a full content backup` |
| **A09 Logging & Monitoring Failures** | Audit log of logins, failed logins, lockouts, password changes, every create/update/delete, uploads, settings, user changes, backups and restores (user, action, item, IP, time), visible to Administrators in the CMS. Server errors are logged with timestamps. | `reads … audit log` |
| **A10 SSRF** | The server never fetches URLs supplied by users. | n/a |

## 3. Other checks commonly raised in CERT-In audits

| Check | Status |
| --- | --- |
| CSRF on all state-changing requests | Synchroniser token (`X-CSRF-Token`) per session, `SameSite=Strict` cookies and an `Origin` check |
| Clickjacking | `frame-ancestors 'none'` and `X-Frame-Options: DENY` |
| Autocomplete on password fields | Disabled on the CMS login |
| Password in URL / GET | Never; POST bodies only, encrypted |
| Concurrent sessions | One session per user; a new sign-in ends the old one |
| Session timeout | 20 minutes idle, 8 hours absolute (configurable) |
| Brute force / DoS throttling | Rate limits: API 300/min, login 20 per 15 min, feedback 10/hour, CAPTCHA 30/min, per IP |
| Account / user enumeration | Identical response and timing for unknown users and wrong passwords |
| Error handling / information leakage | Generic messages; no versions, stack traces or SQL errors exposed |
| File upload | Allow-list, signature check, 10 MB limit, random names, outside the web root of the code, no execution |
| Sensitive data in browser storage | None. Only display preferences and a cache of public content are stored |
| Mixed content / HTTPS | `upgrade-insecure-requests` and HSTS in production; HTTP redirects to HTTPS in Nginx |
| Admin interface exposure | `robots.txt` disallows `/admin`; Nginx IP allow-listing recommended (README §5) |
| Privacy | The feedback form collects only what is needed; the visitor counter stores no IP addresses or cookies |
| Database privileges | Dedicated application user without `DROP`, `GRANT`, `FILE` or `SUPER` |
| Secrets | Kept only in `backend/.env` (git-ignored, `chmod 600`); the backup script passes DB passwords through a temporary option file, not the command line |
| Backups | Daily `scripts/backup.sh` (database and uploads, 30-day retention); tested restore with `scripts/restore.sh` |

## 4. Before each audit / go-live checklist

- [ ] `NODE_ENV=production`, `PUBLIC_ORIGIN=https://…`, `ALLOWED_HOSTS` and `TRUST_PROXY` set
- [ ] TLS 1.2+ only, valid certificate, HTTP → HTTPS redirect, `server_tokens off` in Nginx
- [ ] Seeded administrator password changed; default/unused accounts disabled
- [ ] `npm audit` clean in `backend` and `frontend`; OS and MySQL patched
- [ ] `npm test` (backend) and the Playwright suite pass
- [ ] Daily backup cron in place and a restore tested
- [ ] Official logo uploaded and placeholder sample documents replaced with real PDFs
