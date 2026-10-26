// src/content/pagePaths.js — the canonical public URL of a CMS page.
//
// Pages that have a first-class screen in the app keep that screen's URL; every
// other page is served by the generic /p/:slug route. One source of truth for
// the footer, the CMS link picker, menu validation and the sitemap.
const SCREEN_PATHS = {
  ecitizen: '/ecitizen',
  rti: '/ecitizen/rti',
  'it-act-2000': '/ecitizen/it-act-2000',
  'posh-act': '/ecitizen/posh-act',
  'screen-reader-access': '/screen-reader-access',
  help: '/help'
};

const STATUTORY = new Set([
  'website-policy',
  'privacy-policy',
  'terms-of-use',
  'copyright',
  'disclaimer',
  'hyperlink-policy',
  'accessibility-statement'
]);

function pagePath(slug) {
  const key = String(slug || '').trim();
  if (!key) return '/';
  if (SCREEN_PATHS[key]) return SCREEN_PATHS[key];
  if (STATUTORY.has(key)) return `/policies/${key}`;
  return `/p/${key}`;
}

module.exports = { pagePath, SCREEN_PATHS, STATUTORY };
