# Security Audit Compliance Report — DSTI Website

Prepared for the CERT-In empanelled security audit before go-live, and kept up to date for the half-yearly audits.
Scope: public website, CMS (`/admin`), REST API (`/api`), file uploads (`/uploads`), hosting configuration (IIS / Nginx).
Reference standards: OWASP Top 10 (2021), OWASP ASVS 4.0 (Level 2 controls), GIGW 3.0 security guidelines,
CERT-In "Guidelines for Secure Application Design, Development, Implementation & Operations".

Automated evidence: `backend/tests/api.test.js` (API, security and role tests) and `e2e/tests/*.spec.js`
(browser tests on desktop and mobile). Dependency scan: `npm audit` reports **0 known vulnerabilities** in
`backend`, `frontend` and `e2e`.

## 1. Findings of the October 2026 review

Each finding was verified against the code (not the documentation), fixed and covered by a test where possible.

| # | Finding | Severity | Fix | Evidence |
| --- | --- | --- | --- | --- |
| 1 | Backend dependencies with published advisories (body-parser, compression, express-rate-limit, nodemailer, brace-expansion — denial of service and header injection) | High | Upgraded; `npm audit` is clean | `npm audit` |
| 2 | Session cookie used `SameSite=Lax` and a 1-day lifetime; no idle timeout | High | `SameSite=Strict`, `HttpOnly`, `Secure` and the `__Host-` prefix in production; browser-session cookie; **20-minute idle** and **8-hour absolute** limits (`SESSION_IDLE_MINUTES`, `SESSION_MAX_HOURS`) | `session hardening …` |
| 3 | Session ids stored in clear text in the `sessions` table (a database read would allow session hijacking) | Medium | Only the SHA-256 of the session id is stored | `session hardening …` |
| 4 | Unlimited concurrent sessions per user | Medium | Signing in ends the previous session | `session hardening …` |
| 5 | Logout accepted without the CSRF token (logout CSRF) | Low | CSRF token required when a session exists | `session hardening …` |
| 6 | No `Origin` validation on state-changing CMS requests | Low | Cross-origin `POST/PUT/PATCH/DELETE` to `/api/admin`, `/api/auth`, `/api/v1/admin` is refused (defence in depth with CSRF tokens and SameSite) | `session hardening …` |
| 7 | `TRACE`, `TRACK` and other unused HTTP methods not explicitly rejected | Low | 405 for every method except GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS (also enforced in both `web.config` files) | `session hardening …` |
| 8 | No Host-header allow-list (host-header injection) although documented | Medium | `ALLOWED_HOSTS` allow-list, 421 for any other host | manual |
| 9 | API bound to `0.0.0.0` regardless of `HOST` | Medium | Listens on `HOST` (default `127.0.0.1`) so it is reachable only through the reverse proxy | manual |
| 10 | JWT verification did not pin the algorithm; weak `JWT_SECRET` accepted | Medium | HS256 pinned at sign and verify; production refuses to start with a secret shorter than 32 characters | manual |
| 11 | `TRUST_PROXY=1` (as documented) was read as `false`, so every visitor shared the proxy IP for rate limits and lock-outs | Medium | Accepts `true` or a hop count | manual |
| 12 | Feedback CSV export open to formula (CSV) injection | Medium | Cells starting with `= + - @` are neutralised | manual |
| 13 | `web.config` showed IIS detailed errors to remote users | Medium | `DetailedLocalOnly`, verbs allow-list, hidden segments (`.env`, `node_modules`, `backups`, `logs`) | manual |
| 14 | The built website had no security headers when hosted on IIS | Medium | `frontend/public/web.config` (copied to `dist`) sends CSP, HSTS, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP and forces HTTPS | response headers |
| 15 | No rate limit on `forgot-password` and assistant feedback | Low | Rate limited | manual |
| 16 | Documentation claimed controls the code did not have (items 2–4, 7, 8) | Info | Controls implemented; this report rewritten to match the code | this document |

## 2. OWASP Top 10 controls

| OWASP 2021 | Controls in this application |
| --- | --- |
| **A01 Broken Access Control** | Every `/api/admin` route requires a session, a CSRF token and a role (Administrator / Publisher / Editor / Viewer). Editors cannot publish, delete, see feedback, settings, users, audit or backups. Administrators cannot delete or demote themselves. Drafts and private settings are never in the public API. Directory listing is off. |
| **A02 Cryptographic Failures** | HTTPS with HSTS in production. Passwords hashed with bcrypt (cost 12). In the browser, sign-in and password-change passwords are encrypted with RSA-OAEP-2048/SHA-256 bound to a single-use server nonce, so a captured request cannot be replayed. Session ids are random 256-bit values; only their hashes are stored. |
| **A03 Injection** | All SQL uses placeholders (`mysql2`), never string-built from input. Every CMS write is validated against a schema: unknown fields dropped, types enforced, lengths limited, markup stripped. React escapes output; there is no `dangerouslySetInnerHTML`, `eval` or `innerHTML`. Links must be `http(s)`, `mailto:`, `tel:` or a site path. CSV exports neutralise formulas. |
| **A04 Insecure Design** | Draft → publish workflow, least-privilege roles, one session per user, idle and absolute timeouts, audit trail, backup and restore. |
| **A05 Security Misconfiguration** | API: CSP `default-src 'none'`, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy`, CORP, HSTS in production, `no-store` on API responses, no `X-Powered-By`, methods allow-list, Host allow-list, generic errors without stack traces. Website: CSP `script-src 'self'` with no inline scripts and no third-party scripts. |
| **A06 Vulnerable Components** | Small dependency set, lock files committed, `npm audit` clean. Re-run before each half-yearly audit. |
| **A07 Identification & Authentication** | CAPTCHA on sign-in and feedback (single use, 5-minute expiry); one generic failure message and constant-time behaviour for unknown users; lock-out after 5 failures for 15 minutes; password policy (10–64 characters, upper, lower, digit, symbol, not the username, not one of the last 3); forced change of the first password; session regenerated at sign-in and password change. |
| **A08 Software & Data Integrity** | No CDNs or third-party scripts. Uploads checked by extension **and** file signature (PDF, PNG, JPG, WEBP, MP4, VTT; SVG, HTML and double extensions rejected), renamed to random names, served with `nosniff` and a sandboxing CSP. Restores validated against the schema. |
| **A09 Logging & Monitoring** | Audit log of sign-ins, failures, lock-outs, password changes, every create / update / delete / publish, uploads, settings, users, backups and restores (user, action, item, IP, time), visible to Administrators. Request id on every response and log line. |
| **A10 SSRF** | The server never fetches URLs supplied by users. |

## 3. Checks commonly raised in CERT-In audits

| Check | Status |
| --- | --- |
| CSRF | Synchroniser token (`X-CSRF-Token`) per session, `SameSite=Strict` cookie, `Origin` check |
| Clickjacking | `frame-ancestors 'none'` and `X-Frame-Options: DENY` (API and website) |
| Autocomplete on password fields | Off on the CMS sign-in form |
| Password in URL / GET | Never; POST bodies only, encrypted |
| Concurrent sessions | One per user |
| Session timeout | 20 minutes idle, 8 hours absolute (configurable) |
| Brute force throttling (per IP) | Sign-in 10 / 15 min, CAPTCHA 60 / 15 min, feedback 5 / 30 min, assistant 30 / 10 min, page tracking 300 / 10 min |
| User enumeration | Identical response for unknown users and wrong passwords; forgot-password always answers the same |
| Error handling | Generic messages; no versions, stack traces or SQL errors |
| File upload | Allow-list, signature check, size limit (`MAX_UPLOAD_MB`), random names, stored outside the code, never executed |
| Sensitive data in browser storage | None. Only display preferences and a cache of public content |
| HTTPS | HTTP → HTTPS redirect and HSTS; `upgrade-insecure-requests` in the website CSP |
| Admin interface exposure | `robots.txt` disallows `/admin` and `/api/`; restricting `/admin` and `/api/admin` to the Secretariat network or VPN is recommended (README §5) |
| Privacy | Feedback collects only what is needed; the visitor counter stores no IP addresses and sets no cookies |
| Database privileges | Dedicated application user without `DROP`, `GRANT`, `FILE` or `SUPER` |
| Secrets | Only in `backend/.env` (git-ignored, `chmod 600`) |
| Backups | CMS → Backup & restore (content); schedule a nightly `mysqldump` of the database and a copy of `uploads/` off the server |

## 4. Before each audit / go-live checklist

- [ ] `NODE_ENV=production`, `PUBLIC_ORIGIN=https://…`, `ALLOWED_HOSTS`, `TRUST_PROXY` and a 48-byte random `JWT_SECRET` set
- [ ] TLS 1.2+ only, valid certificate, HTTP → HTTPS redirect, server banner hidden
- [ ] API origin in `frontend/public/web.config` (or the Nginx CSP) matches `VITE_API_BASE_URL`
- [ ] Seeded administrator password changed; default/unused accounts disabled
- [ ] `npm audit` clean in `backend`, `frontend` and `e2e`; OS and MySQL patched
- [ ] `npm test` (backend) and the Playwright suite pass
- [ ] Nightly database and uploads backup in place and a restore tested
- [ ] Official emblem, leadership photographs and real documents uploaded in place of the placeholders
