# DSTI Website — Department of Science, Technology & Innovation, Government of Andhra Pradesh

Official bilingual (English / తెలుగు) website of DSTI, with a role-based Content Management System (CMS).
**Every part of the public website is managed from the CMS**: menu, hero banner, home page sections, news, events,
tenders, Government Orders and other documents, organisations, policies, districts, awards, FAQs, officers, all
content pages, logo, contact details and social media links.

| Layer | Technology |
| --- | --- |
| Frontend | React 18, React Router 7, Bootstrap 5.3 (SCSS, only the parts used), HTML5, CSS3, Vite 7 |
| Backend | Node.js 18+ and Express 5 |
| Database | MySQL 8 (or MariaDB 10.6+) |
| Tests | Node test runner + Supertest (API), Playwright (end-to-end, desktop and mobile) |

---

## 1. Features (mapped to the Department's requirements)

**Menu** — six groups: About Us · Our Work · Policies · Citizen Services · Media · Contact (each drop-down shows a
one-line description per page; phones get a drawer with search and the language switch).

**Pages** — Home · About (Introduction, Leadership, Vision & Mission, Objectives, Organisation Structure, year-wise Awards) ·
Organisations (listing, one page per organisation, District Explorer, "How it all connects") · ICT (e-Governance,
Projects & Initiatives) · Policies (listing and one page per policy) · Investor's Corner · e-Citizen (RTI, Acts &
Rules, Government Orders, Notifications / Circulars, Policies, Guidelines, FAQs, Useful Links, IT Act 2000 with
Procedure and Judgements, PoSH Act) · Tenders (open / closed, document download) · Media (Photo Gallery, Science
Stories videos, Events) · Contact Us (Head Office, List of Officers) · Feedback (form, public dashboard, tracking) · Statutory pages (Website Policy, Privacy Policy,
Terms of Use, Copyright, Disclaimer, Hyperlink Policy, Accessibility Statement, Screen Reader Access, Help, Sitemap).

**Features**
- English / Telugu switch on every page; content has English and Telugu fields (falls back to English if Telugu is empty).
- Responsive on mobile, tablet and desktop. Modern layout with subtle fade-up animations on scroll (disabled automatically for visitors who prefer reduced motion).
- GIGW / WCAG 2.1 AA: skip link, keyboard navigation, visible focus, ARIA labels, text resize (90–140 %), high-contrast and dark modes, table alternatives for the map and charts, accessibility statement.
- Site-wide search over pages, policies, orders, documents, tenders, events and more.
- **Ask Vigyan Mitra** assistant: the chat posts each question to `POST /api/v1/assistant/ask`, and the server composes the answer from the records published in MySQL — district profiles, open or closed tenders, policies, documents, FAQs, officers and contact details — always citing the source page(s). The browser keeps a cached-content fallback for when the API is unreachable; no external AI service or third-party script is involved.
- Interactive **District Explorer** for all 26 districts, with an accessible table view.
- **Leadership**: Hon'ble Chief Minister, Minister and Secretary with photographs on the home page and an About > Leadership page.
- **Photo gallery** with albums, a lightbox (arrows, keyboard, swipe, thumbnails), captions and a tagline; a gallery strip on the home page.
- **Feedback dashboard**: received, answered, pending, average response time, share answered within 7 days, monthly and category figures (aggregates only). Citizens track their feedback with the reference number and e-mail; the CMS records and e-mails the Department's reply.
- Home page: hero banner with key messages and the leadership panel, latest-updates ticker, "What brings you here?" (Citizens, Students, Researchers, Investors), quick links, statistics, news band, District map, Science Almanac (observances and this-day-in-science), illustrated story, "How it all connects", Science Stories, Events and the photo gallery. Each section can be switched on or off from the CMS.
- Document repository with search, type and year filters, date sorting and PDF download.
- Feedback form with CAPTCHA and categories, stored in MySQL, e-mail notification to the Department (SMTP optional) and a CMS inbox with replies, status tabs, search and CSV export.
- CMS organised like the website (collapsible groups, find-a-section search, a dashboard with key figures, quick actions and a needs-attention list), with roles (Administrator, Publisher, Editor, Viewer), draft/publish workflow, file library, audit log, visitor statistics, user management, and content backup / restore.
- SEO: page titles, meta descriptions, canonical links, Open Graph / Twitter cards, `sitemap.xml` and `robots.txt` generated from the CMS.
- Social media links (managed in the CMS) and an anonymous visitor counter (no cookies, no IP storage).
- Light and fast: pages are code-split; the home page loads about 80 KB of JavaScript and 33 KB of CSS (gzipped). All content arrives in one cached request, and fonts are self-hosted.

---

## 2. Local setup

### 2.1 Prerequisites

- **Node.js 18.18 or later** (20 LTS or 22 LTS recommended) — `node -v`
- **MySQL 8** or **MariaDB 10.6+** running locally
- Git

### 2.2 Get the code

```bash
git clone https://github.com/Rakeshkumar-369/DSTI.git
cd DSTI
```

### 2.3 Create the database and a least-privilege user

Log in to MySQL as root (`mysql -u root -p`) and run:

```sql
CREATE DATABASE dsti CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'dsti_app'@'localhost' IDENTIFIED BY 'Choose-A-Strong#Password1';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES ON dsti.* TO 'dsti_app'@'localhost';

-- Only needed to run the automated tests:
CREATE DATABASE dsti_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES, DROP ON dsti_test.* TO 'dsti_app'@'localhost';
FLUSH PRIVILEGES;
```

### 2.4 Configure and start the backend

```bash
cd backend
cp .env.example .env          # Windows: copy .env.example .env
```

Edit `backend/.env`:

| Variable | Meaning |
| --- | --- |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` | MySQL connection (`DB_PASSWORD` is accepted too). **Wrap values containing `#` in double quotes**, e.g. `DB_PASS="Choose-A-Strong#Password1"` |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | First CMS administrator, created by the seed step. Must be 10–64 characters with upper- and lower-case letters, a digit and a special character. It **must be changed at first sign-in**. |
| `PUBLIC_ORIGIN` | Address of the website (`http://localhost:5173` in development) |
| `SMTP_*` | Optional: SMTP server for feedback notification e-mails |

Then:

```bash
npm install
npm run db:setup     # creates the tables and the reference data (safe to re-run)
npm run seed         # imports the starter website content from seed/content.json
npm run dev          # API on http://localhost:5000 (restarts on file changes)
```

`npm run seed` is an upsert: existing items are updated, missing ones are created. Use
`npm run seed -- --reset` to **replace all content** with the seed (users, feedback and analytics are kept).

### 2.5 Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

The frontend talks to the API directly: every request is built from `VITE_API_BASE_URL`, which defaults to
`http://localhost:5000` (see `frontend/.env`), so nothing goes through the React dev-server port. The backend must list
the frontend origin in `CORS_ORIGIN` — the shipped value already allows `http://localhost:5173` and
`http://127.0.0.1:5173` (plus the `4173` preview ports). To point the site at another backend, copy
`frontend/.env.example` to `frontend/.env` and set `VITE_API_BASE_URL` to that API origin and add the frontend origin
to `CORS_ORIGIN`.

### 2.6 Sign in to the CMS

Open **http://localhost:5173/admin**, sign in with `ADMIN_USERNAME` / `ADMIN_PASSWORD` and the security code, then set
a new password. Create accounts for other staff under **Users & roles**.

> Sign-in encrypts the password in the browser with Web Crypto, which browsers allow only on **HTTPS or `localhost`**.
> Use `localhost`, not a LAN IP address, when testing over plain HTTP.

### 2.7 Production-style run (single API origin)

```bash
cd frontend && npm run build              # creates frontend/dist
cd ../backend && NODE_ENV=production npm start
```

The backend is an API-only server: it exposes `/api`, `/uploads`, `/sitemap.xml` and `/robots.txt` on port 5000 and
never renders HTML. Build the frontend with `VITE_API_BASE_URL` set to the API origin that browsers will use, serve
`frontend/dist` from your web server (IIS, nginx) and add that website origin to the backend's `CORS_ORIGIN`. Because
the app builds absolute API and upload URLs, it works from any host — no reverse proxy is required. In production mode
cookies are `Secure` and HSTS is on, so put both behind HTTPS (see section 5).

---

## 3. Running the tests

The API and end-to-end suites use the `dsti_test` database (create it and grant the application user access as in
§2.3, then run `DB_NAME=dsti_test npm run db:setup` once in `backend`). They read the database credentials from
`backend/.env`. Override the name with `TEST_DB_NAME`. The assistant tests are pure JavaScript and need no database.

```bash
# API, security and role tests (17 tests: sessions, CSRF / Origin checks, feedback replies and tracking, roles, uploads …)
cd backend && DB_NAME=dsti_test npm test

# Assistant answer-engine tests (retrieval, grounding, citations, English / Telugu)
cd frontend && npm test

# End-to-end browser tests (28 tests, desktop and mobile): every page, a crawler that opens every link in the
# menus, footer and sitemap, search, assistant, district map, tenders, documents, feedback submission, dashboard and
# tracking, photo gallery and lightbox, leadership, accessibility tools, language switch, mobile drawer and layout,
# SEO, and the full CMS workflow (forced password change, create / upload / publish / unpublish / delete, repeaters,
# settings, editor role, menu search, feedback reply, audit log, backup)
cd e2e && npm install && npx playwright install chromium && npm test
```

The end-to-end suite resets `dsti_test`, builds the website into `e2e/.site`, and runs the API (port 5056) and the
website (port 5055) itself, so nothing else needs to be running. To use a Chromium that is already installed, set
`PW_CHROMIUM_PATH` to its executable.

---

## 4. Project structure

```
backend/
  src/
    app.js                 Express app: security headers, CSP, routes, /uploads hosting
    server.js              Entry point, timeouts, session clean-up
    config/                Configuration from .env, MySQL pool
    content/collections.js ★ Content model: every CMS section and field is defined here once
    content/settings.js    Single-record settings groups (site, contact, about, home…)
    repositories/          Content, settings, media and auth data access
    db/setup.js            Applies database/schema.sql          db/seed.js  imports seed/content.json
    middleware/            Sessions, CSRF, roles, rate limits, uploads, security headers, errors
    routes/                public.js (site bundle, feedback, stats) · auth.js · admin.js (CMS API) · v1/ (public REST API)
    services/              Feedback, analytics, assistant and site services
    utils/                 Password encryption & policy, CAPTCHA, audit log, mailer
  database/schema.sql      MySQL tables + reference data (roles, districts, categories, settings)
  seed/content.json        Initial website content (English + Telugu)
  tests/api.test.js
frontend/
  src/
    App.jsx                Routes (code-split)
    styles/main.scss       Bootstrap 5 theme, animations, dark / high-contrast modes
    context/               ContentContext (loads CMS content), ThemeContext (accessibility)
    i18n/                  English / Telugu interface strings
    components/            layout (TopBar, Header, Footer, Search, Vigyan Mitra), home sections, common widgets
    pages/                 Public pages
    admin/                 CMS (login, dashboard, schema-driven editors, users, audit, backup…)
    utils/searchIndex.js   Site-wide search index
    utils/assistant.js     "Ask Vigyan Mitra" offline fallback engine (live answers come from /api/v1/assistant/ask)
    tests/                 Assistant answer-engine tests (node --test)
e2e/                       Playwright tests
docs/                      SECURITY_AUDIT.md (audit compliance report), CMS_USER_GUIDE.md
```

**Adding a new editable field or section:** add it to `backend/src/content/schemas.js`. Validation and the CMS form
pick it up automatically; then show it in the relevant React page.

---

## 5. Deployment (AP State Data Centre)

1. Server: Ubuntu 22.04/24.04 LTS (or RHEL 9), Node.js 20 LTS, MySQL 8, Nginx; domain `dsti.ap.gov.in` with an SSL certificate.
2. Copy the code, then `npm ci` in `backend` and `frontend`; run `npm run build` in `frontend`.
3. `backend/.env`: `NODE_ENV=production`, `PUBLIC_ORIGIN=https://dsti.ap.gov.in`, `ALLOWED_HOSTS=dsti.ap.gov.in,www.dsti.ap.gov.in`, `TRUST_PROXY=1`, `SESSION_IDLE_MINUTES=20`, a 48-byte random `JWT_SECRET`, real DB and SMTP credentials. `chmod 600 .env`.
4. `npm run db:setup` and `npm run seed`, then run the app as an unprivileged user with systemd or PM2 (`pm2 start src/server.js --name dsti`).
5. Web server in front (TLS 1.2/1.3 only). It serves the built website from `frontend/dist` with the security
   headers and forwards only `/api`, `/uploads`, `/sitemap.xml` and `/robots.txt` to the API on `127.0.0.1:5000`.
   On **IIS**, `frontend/dist/web.config` (copied from `frontend/public/web.config` at build time) already sets the
   headers, the HTTPS redirect and the single-page-app fallback; `backend/web.config` hosts the API with iisnode.
   On **Nginx**:

```nginx
server {
    listen 443 ssl http2;
    server_name dsti.ap.gov.in;
    ssl_certificate     /etc/ssl/dsti/fullchain.pem;
    ssl_certificate_key /etc/ssl/dsti/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    server_tokens off;
    client_max_body_size 26m;

    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https://i.ytimg.com; font-src 'self'; connect-src 'self'; media-src 'self'; frame-src https://www.youtube-nocookie.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=(), usb=()" always;

    if ($request_method !~ ^(GET|HEAD|POST|PUT|PATCH|DELETE|OPTIONS)$) { return 405; }

    root /var/www/dsti/frontend/dist;
    location / { try_files $uri /index.html; }
    location = /index.html { add_header Cache-Control "no-cache" always; }
    location /assets/ { expires 1y; access_log off; }

    # Optional: allow the CMS only from the Secretariat / VPN network
    # location /api/admin { allow 10.0.0.0/8; deny all; proxy_pass http://127.0.0.1:5000; }

    location ~ ^/(api|uploads)/ { proxy_pass http://127.0.0.1:5000; include /etc/nginx/proxy_params; }
    location ~ ^/(sitemap\.xml|robots\.txt)$ { proxy_pass http://127.0.0.1:5000; include /etc/nginx/proxy_params; }
}
server { listen 80; server_name dsti.ap.gov.in; return 301 https://$host$request_uri; }
```

   With this single-origin set-up, build the website with `VITE_API_BASE_URL=https://dsti.ap.gov.in`.

6. Backups: schedule a nightly `mysqldump --single-transaction dsti_website` and a copy of `backend/uploads/` to
   storage off the server. Administrators can also download or restore a content backup from
   **CMS → Administration → Backup & restore**.
7. Replace the placeholder emblem: **CMS → Settings → Site identity & social → Header logo**. Upload the official
   Government of Andhra Pradesh logo as PNG or WEBP.

---

## 6. Security

The application was reviewed against the OWASP Top 10 (2021) and the usual CERT-In audit checklist before go-live. See
[`docs/SECURITY_AUDIT.md`](docs/SECURITY_AUDIT.md) for each control and how it is tested. Highlights: strict CSP with
no inline scripts and no third-party scripts, server-side sessions in httpOnly / SameSite=Strict cookies (hashed in the
database, one per user, 20-minute idle timeout), CSRF tokens and an Origin check, Host allow-list,
CAPTCHA and account lockout, passwords encrypted in transit and hashed with bcrypt, password policy, history and
forced first change, role-based access, schema-validated input, upload checks of file signatures, rate limiting, an
audit trail, and generic error messages.
