# DSTI — Department of Science, Technology & Innovation, Government of Andhra Pradesh

Official website project for the **Department of Science, Technology & Innovation (DSTI)**, Government of Andhra Pradesh.

Built as a **frontend-first prototype** with realistic seeded content. The public website is fully
implemented; the CMS runs on a local content store and is designed to be wired to the backend next.

---

## What's implemented

### Pages (per the Department's requirements)

| Section | Routes |
| --- | --- |
| **Home** | `/` — hero banner with key messages, latest-updates ticker, "What brings you here?" (Citizens, Students, Researchers, Investors), quick links, District Explorer preview, Science Almanac, illustrated story, "How it all connects", Science Stories, Events |
| **About the Department** | `/about`, `/about/mission`, `/about/objectives`, `/about/organisation`, `/about/awards` (year-wise) |
| **Organisations** | `/organisations`, `/organisations/:id`, `/districts` (District Explorer), `/how-it-connects` |
| **ICT** | `/ict` (e-Governance), `/ict/projects` (Projects & Initiatives) |
| **Policies** | `/policies` + one page per policy (`/policies/:id`) — IT & GCC, Electronics, Semiconductor, Data Centre, Drone, Space, Biotechnology, Science, Technology & Innovation |
| **Investor's Corner** | `/investors` |
| **e-Citizen** | `/ecitizen` hub + RTI, Acts & Rules, Government Orders, Notifications/Circulars, Policies, Guidelines, FAQs, Useful Links, IT Act 2000 (Procedure, Judgements), PoSH Act |
| **Tenders** | `/tenders` — open / closed status, search, PDF download |
| **Media** | `/media` hub, `/media/science-stories`, `/media/events` |
| **Contact Us** | `/contact` — head office, list of officers, feedback form |
| **Statutory / Footer** | Website Policy, Privacy Policy, Terms of Use, Copyright, Disclaimer, Hyperlink Policy, Accessibility Statement, Screen Reader Access, Help, Sitemap (routed under `/policies/:slug`, `/screen-reader-access`, `/help`, `/sitemap`) |
| **CMS** | `/admin` (login at `/admin/login`) |

### Features

- **Bilingual** English / తెలుగు with a language switch on every page (UI chrome translated; content carries `en`/`te` fields).
- **Fully responsive** layout (mobile, tablet, desktop).
- **GIGW / WCAG 2.1 AA accessibility**: skip-to-content link, keyboard navigation, visible focus outlines, ARIA labels, text resizing (90–140%), high-contrast mode and dark mode, accessibility statement.
- **Site-wide search** across pages, policies, orders, documents, tenders and more.
- **"Ask Vigyan Mitra"** assistant — answers **only** from the website's own content and cites the source page (no external API, no third-party scripts).
- **Interactive District Explorer** — a map of all **26 districts** of Andhra Pradesh with institutions/activities, plus an equivalent accessible **table view**.
- **Document repository** with search, type filter, date sorting and PDF download.
- **Feedback form** wired to a secure content store with a notification flag; viewable in the CMS inbox.
- **SEO**: per-page titles, meta descriptions, Open Graph / social card tags.
- **Social media links** and a **visitor statistics** counter (hit counter).
- **CMS with user roles** (Administrator / Editor / Publisher) to manage tenders, documents, news, events and feedback.

---

## Tech stack

- **Frontend**: React 18, Vite 4, Tailwind CSS 3 (custom navy / teal / saffron design system), React Router 6, lucide-react.
- **Backend** (`backend/`): Express + MySQL layered architecture (legacy from the previous project; kept for wiring up next).

## Getting started

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
```

### CMS demo accounts

| Role | Username | Password |
| --- | --- | --- |
| Administrator | `admin` | `admin@123` |
| Editor | `editor` | `editor@123` |
| Publisher | `publisher` | `publish@123` |

---

## Project structure (frontend)

```
frontend/src/
├── components/
│   ├── common/      Header, TopBar, Footer, SearchOverlay, VigyanMitra, DocumentTable, …
│   ├── districts/   DistrictExplorer (map + accessible table)
│   └── home/        HeroBanner, NewsTicker, WhatBringsYouHere, QuickLinks, AlmanacWidget, …
├── context/         ThemeContext (dark mode, high contrast, font scaling)
├── data/            Seeded content (organisations, policies, ICT, tenders, documents, districts,
│                    events, science stories, awards, almanac, FAQs, news, statutory pages) + store.js
├── hooks/           useVisitorStats
├── i18n/            LanguageContext + English/Telugu UI translations
├── pages/           HomePage, about/, organisations/, ict/, policies/, ecitizen/, media/, admin/, …
└── utils/           searchIndex (site search + Vigyan Mitra), adminAuth, useSEO
```

## Status & next steps

- The frontend is complete as a working prototype with seeded content.
- **Next**: wire the public pages and CMS to the Express + MySQL backend (replace the `data/store.js`
  reads with API calls), then implement the remaining backend domains (organisations, policies,
  documents, tenders, events, districts, feedback).
- Hosting, security audit and one-year support are handled at deployment (AP State Data Centre, `.ap.gov.in`, SSL).
