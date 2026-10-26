# DSTI Website — Backend API & CMS

REST API and content-management backend for the bilingual (English / తెలుగు)
DSTI website of the Department of Science, Technology & Innovation,
Government of Andhra Pradesh.

- **Runtime:** Node.js 18+ (tested on Node 24) + Express 5 (CommonJS)
- **Database:** MySQL 8 (MariaDB 10.6+ compatible), `utf8mb4`
- **Auth:** cookie sessions (CMS) + JWT bearer (`/api/v1/admin`)
- **Uploads:** PDF, PNG, JPG, WEBP, MP4, VTT — magic-byte checked and renamed
- **Logging:** morgan access log + file/console logger + `audit_log`

---

## 1. What this server provides

| Surface | Purpose |
| --- | --- |
| `/api/v1/*` | The documented public REST API (pages, policies, documents, tenders, districts, search, assistant, analytics …). |
| `/api/v1/admin/*` | The documented admin REST API (JWT, roles, generic CRUD for every content type, media, feedback, stats, settings, audit, backups). |
| `/api/public/*`, `/api/auth/*`, `/api/admin/*` | Compatibility layer for the existing React site/CMS (single content bundle, session + CSRF + RSA sign-in, generic collection editor). |

Both API surfaces share the same MySQL data. The CMS collections are mapped
onto the normalised tables; CMS-only fields are kept in a JSON side table so
the schema is never widened per form field (see §6).

---

## 2. Local setup

### Prerequisites

- Node.js 18.18+ (20/22 LTS recommended)
- MySQL 8 or MariaDB 10.6+ running locally
- npm

### Install and configure

```bash
cd backend
npm install
cp .env.example .env
# edit .env: database credentials, JWT_SECRET, CORS_ORIGIN
```

Generate a JWT secret once:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Create the database

```bash
npm run db:setup     # applies database/schema.sql
npm run seed         # optional starter content (only fills empty collections)
```

`db:setup` creates and uses the database named by `DB_NAME` (default
`dsti_website`) and is idempotent (`CREATE TABLE IF NOT EXISTS`,
`INSERT IGNORE`). `database/schema.sql` can also be opened directly in MySQL
Workbench, where it defaults to `dsti_website`.

### Run

```bash
npm run dev          # nodemon
npm start            # production entry
```

The API listens on `HOST:PORT` (default `127.0.0.1:5000`).

### First sign-in

| Field | Value |
| --- | --- |
| Username | `admin` |
| Password | `Admin@12345` |

The account is flagged **must change password**; change it immediately from
`/admin/change-password` or `POST /api/v1/admin/auth/change-password`.

---

## 3. Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | – | HTTP port (default `5000`) |
| `HOST` | – | Bind host used in logs (default `127.0.0.1`) |
| `PUBLIC_ORIGIN` | – | Public site origin for sitemap links |
| `CORS_ORIGIN` | – | Comma-separated allowed browser origins |
| `TRUST_PROXY` | – | `true` only behind a trusted reverse proxy |
| `JWT_SECRET` | ✅ | Signing secret for API tokens |
| `JWT_EXPIRES_IN` | – | Token lifetime (default `8h`) |
| `SESSION_TTL_DAYS` | – | CMS session lifetime (default `1`) |
| `DB_HOST` | ✅ | MySQL host |
| `DB_PORT` | – | MySQL port (default `3306`) |
| `DB_USER` | ✅ | MySQL user |
| `DB_PASS` | – | MySQL password (may be empty) |
| `DB_NAME` | ✅ | Database name (`dsti_website`) |
| `MAX_UPLOAD_MB` | – | Upload limit (default `25`) |
| `SMTP_*` | – | Optional feedback notification e-mail (see §9) |

---

## 4. Project structure

```
backend/
├── database/
│   └── schema.sql              # full DSTI schema + reference data
├── src/
│   ├── app.js                  # Express app factory (middleware, static, SEO)
│   ├── server.js               # entry point + graceful shutdown
│   ├── config/{index,db}.js    # env hub, MySQL pool + helpers
│   ├── content/                # content model
│   │   ├── resources.js        # /api/v1 resource registry (columns, status, filters)
│   │   ├── collections.js      # CMS field schemas + table mapping
│   │   └── settings.js         # single-record settings groups
│   ├── controllers/            # thin HTTP layer
│   ├── services/               # business logic (auth, content, public, admin, media…)
│   ├── repositories/           # all SQL
│   ├── routes/                 # public, auth, admin, v1/public, v1/admin
│   ├── middleware/              # auth/CSRF, errors, rate limits, uploads, headers
│   ├── utils/                  # HTTP helpers, validation, bilingual, captcha, crypto
│   └── db/{setup,seed}.js      # schema apply + starter content
├── tests/api.test.js           # integration tests (node:test)
├── uploads/                    # runtime uploads (git-ignored)
└── backups/                    # JSON content backups (git-ignored)
```

Request flow: `route → middleware → controller → service → repository → MySQL`.
All SQL uses prepared statements with `?` placeholders.

---

## 5. API overview

Response envelopes:

```json
// /api/v1 success
{ "success": true, "data": {}, "meta": { "page": 1, "limit": 10, "total": 57 } }
// /api/v1 error
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Page not found" } }
```

The frontend-compatible endpoints keep their existing shapes
(`{ items }`, `{ item }`, `{ error }`, `{ user, csrf }`).

### Public `/api/v1`

`home`, `banners`, `news`, `audience-cards`, `quick-links`, `story-panels`,
`almanac`, `social-links`, `pages`, `pages/:slug`, `footer-pages`, `sitemap`,
`sitemap.xml`, `awards`, `awards/years`, `awards/:year`, `organisations`,
`organisations/:slug`, `sectors`, `districts`, `districts/:slug`,
`district-institutions`, `district-institutions/:id`, `district-map`,
`connections`, `policies`, `policies/:slug`, `document-categories`, `documents`,
`documents/:id`, `documents/:id/download`, `faqs`, `rti`, `tenders`,
`tenders/:id`, `tenders/:id/download`, `science-stories`,
`science-stories/:id`, `events`, `events/:slug`, `contact/office`,
`contact/officers`, `POST feedback`, `search`, `search/suggest`,
`POST assistant/ask`, `POST assistant/feedback`, `POST track/view`,
`stats/visitors`, `settings/public`, `health`.

Every public read accepts `?lang=en|te`; Telugu falls back to English when a
Telugu field is empty. Lists accept `page`, `limit`, `q` and their documented
filters (`category`, `year`, `status`, `when`, `district`, `month`, …).

### Admin `/api/v1/admin`

Authentication: `POST /auth/login` with `{ "email", "password" }` returns a
JWT. Send `Authorization: Bearer <token>`. Roles are `admin` (full),
`approver` (publish/delete), `editor` (create/edit/submit), `viewer` (read).

Resources: `pages`, `banners`, `news`, `audience-cards`, `quick-links`,
`social-links`, `story-panels`, `almanac`, `awards`, `officers`,
`office-contacts`, `organisations`, `sectors`, `policies`, `districts`,
`district-institutions`, `document-categories`, `documents`, `faqs`, `tenders`,
`science-stories`, `events`.

Each supports:

```
GET    /api/v1/admin/{resource}?status=&q=&page=&limit=
GET    /api/v1/admin/{resource}/:id
POST   /api/v1/admin/{resource}                    (draft by default)
PUT    /api/v1/admin/{resource}/:id
DELETE /api/v1/admin/{resource}/:id
PATCH  /api/v1/admin/{resource}/:id/status         { status }
POST   /api/v1/admin/{resource}/:id/submit         (pending approval)
PUT    /api/v1/admin/{resource}/reorder            [{ id, order }]
```

Special endpoints: tender close/corrigendum, connections bulk save, district
institutions import, media library, feedback inbox + CSV export, analytics,
assistant logs, settings, audit log, search reindex, backups.

### Frontend compatibility

- `GET /api/public/content` — all published collections + public settings, ETag.
- `POST /api/public/hit`, `GET /api/public/stats` — anonymous counter.
- `POST /api/public/feedback` — CAPTCHA-protected feedback.
- `/api/auth/*` — RSA-encrypted password + CAPTCHA sign-in, session cookie,
  CSRF token, password change.
- `/api/admin/*` — schemas, dashboard, generic collection CRUD, settings,
  media library, feedback, users, audit, backup/restore.

---

## 6. Database notes

`database/schema.sql` implements every table from the Department's schema
(roles/users, media, pages, banners, news, audience cards, quick links, social
links, story panels, almanac, awards, officers, office contacts, sectors,
organisations, policies, districts, district institutions, entity links,
document categories, documents, FAQs, tenders, science stories, events,
feedback, page views, daily stats, assistant logs, audit log, site settings).

The uploadable schema is used as-is; these tables/columns were added so the
existing CMS can run on it:

| Extension | Why |
| --- | --- |
| `users.username`, `must_change_password`, `locked_until`, `password_changed_at`, `updated_at` | the CMS signs in by username and enforces first-login password change |
| `sessions`, `password_history`, `jwt_blocklist` | server-side sessions, password reuse check, JWT logout |
| `cms_blocks` | CMS collections with no dedicated table (main menu, home feature cards, ICT projects, investor incentives, regions, "this day in science") |
| `cms_extras` | CMS-only fields for rows whose table follows the Department's schema |
| `backups` | backup file registry |
| `assistant_feedback` | thumbs up/down on "Ask Vigyan Mitra" answers |

CMS collection → table mapping includes: hero slides→`banners`,
news→`news_updates`, audiences→`audience_cards`, story chapters→`story_panels`,
organisations, policies, documents, tenders, FAQs, useful links→`quick_links`,
events, science stories→`science_stories`, science days→`almanac_entries`,
districts, pages, awards (one row per award, grouped by year).

---

## 7. Security

- Parameterised SQL everywhere; all identifiers come from a static allowlist.
- Passwords hashed with bcrypt (cost 12). Account locks for 15 minutes after
  5 failed attempts. Password history prevents reuse of the last 3 passwords.
- CMS passwords travel RSA-OAEP encrypted with a per-CAPTCHA nonce; CAPTCHAs
  are single-use and expire after 5 minutes.
- Session cookies are `httpOnly`, `SameSite=Lax`, `Secure` in production;
  writes additionally require `X-CSRF-Token`.
- Rate limits on sign-in, CAPTCHA, feedback, assistant and page tracking.
- Uploads: extension + magic-byte validation, random stored name, size limit,
  script extensions rejected.
- Strict security headers (CSP, `nosniff`, frame denial, HSTS in production).
- Analytics store only a salted visitor hash — no IP address, no cookie.
- Every create/update/delete/publish/login is written to `audit_log`.

---

## 8. Testing

```bash
npm test
```

The integration suite starts the app on an ephemeral port, signs in through
the real RSA + CAPTCHA flow (CAPTCHA is patched in-process for automation),
and exercises the public bundle, `/api/v1` reads, assistant, feedback,
CMS CRUD, uploads, JWT login, role guards, publish workflow and logout.
It uses the database configured in `.env` and removes the content, media, user,
feedback and assistant records it creates (audit-log entries remain by design).

---

## 9. E-mail and backups

- Feedback notifications call `src/utils/mailer.js`, which sends through the
  SMTP relay configured by `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
  and `SMTP_FROM` (nodemailer). When `SMTP_HOST` is not set the message is
  written to the log and `notified_at` stays empty. Wire a Government SMTP
  relay before go-live; a failed relay is logged and never fails the citizen's
  request.
- `POST /api/v1/admin/backup` writes a JSON content backup to `backend/backups`
  and records it in the `backups` table. `GET /api/v1/admin/backup` lists
  backups; `POST /api/v1/admin/backup/:id/restore` restores one (requires
  `{ "confirm": true }`). The CMS Backup page uses the same content export.
- Uploaded files are **not** included in content backups — back up
  `backend/uploads/` and the MySQL database with your normal server backup.

---

## 10. Deployment notes

- Run the API behind IIS/nginx over HTTPS (`web.config` is included for
  iisnode); the frontend is served by the web server/Vite and proxies
  `/api`, `/uploads`, `/sitemap.xml`, `/robots.txt` to this server.
- Set `NODE_ENV=production`, a strong `JWT_SECRET`, `TRUST_PROXY=true` when a
  proxy terminates TLS, and a least-privilege MySQL user (SELECT/INSERT/
  UPDATE/DELETE on `dsti_website` only).
- The server fails fast when the database is unreachable or required
  environment variables are missing, and shuts down gracefully on SIGTERM.
