// src/content/routes.js — the public URLs the React app serves.
//
// Used by the CMS link picker and by menu validation, so an editor can only
// publish a link that actually resolves. Dynamic entries are handled separately:
//   /p/<slug>            any published CMS page
//   /policies/<slug>     a published policy (or a statutory page)
//   /organisations/<slug> a published organisation
const SITE_ROUTES = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About the Department — Introduction' },
  { path: '/about/mission', label: 'About — Mission' },
  { path: '/about/objectives', label: 'About — Objectives' },
  { path: '/about/organisation', label: 'About — Organisation Structure' },
  { path: '/about/awards', label: 'About — Awards' },
  { path: '/organisations', label: 'Organisations' },
  { path: '/districts', label: 'District Explorer' },
  { path: '/how-it-connects', label: 'How it all connects' },
  { path: '/ict', label: 'ICT — e-Governance' },
  { path: '/ict/projects', label: 'ICT — Projects & Initiatives' },
  { path: '/policies', label: 'Policies' },
  { path: '/investors', label: "Investor's Corner" },
  { path: '/ecitizen', label: 'e-Citizen' },
  { path: '/ecitizen/rti', label: 'e-Citizen — Right to Information' },
  { path: '/ecitizen/acts', label: 'e-Citizen — Acts & Rules' },
  { path: '/ecitizen/government-orders', label: 'e-Citizen — Government Orders' },
  { path: '/ecitizen/notifications', label: 'e-Citizen — Notifications & Circulars' },
  { path: '/ecitizen/policies', label: 'e-Citizen — Policies' },
  { path: '/ecitizen/guidelines', label: 'e-Citizen — Guidelines' },
  { path: '/ecitizen/faqs', label: 'e-Citizen — FAQs' },
  { path: '/ecitizen/useful-links', label: 'e-Citizen — Useful Links' },
  { path: '/tenders', label: 'Tenders' },
  { path: '/media', label: 'Media' },
  { path: '/media/science-stories', label: 'Media — Science Stories' },
  { path: '/media/events', label: 'Media — Events' },
  { path: '/contact', label: 'Contact Us' },
  { path: '/screen-reader-access', label: 'Screen Reader Access' },
  { path: '/help', label: 'Help' },
  { path: '/sitemap', label: 'Sitemap' },
  { path: '/search', label: 'Search results' }
];

const ROUTE_PATHS = new Set(SITE_ROUTES.map((route) => route.path));

const EXTERNAL_RE = /^(https?:\/\/|mailto:|tel:)/i;

/** Strips a query string and a trailing slash so only the path is compared. */
const plainPath = (value) => String(value || '').split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';

const isExternal = (value) => EXTERNAL_RE.test(String(value || '').trim());

module.exports = { SITE_ROUTES, ROUTE_PATHS, EXTERNAL_RE, plainPath, isExternal };
