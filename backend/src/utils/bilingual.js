// src/utils/bilingual.js — English/Telugu field handling.
//
// Database columns are stored as <base>_en / <base>_te. Public API responses
// expose the single requested language under <base>, falling back to English
// when the Telugu value is empty (as specified in the API contract).

const LANGS = ['en', 'te'];

function normaliseLang(value) {
  return LANGS.includes(String(value || '').toLowerCase()) ? String(value).toLowerCase() : 'en';
}

/** Returns the Telugu text when requested and present, otherwise English. */
function pick(en, te, lang) {
  if (normaliseLang(lang) === 'te' && te !== null && te !== undefined && String(te).trim() !== '') {
    return te;
  }
  return en;
}

/**
 * Resolves a raw DB row for a public response.
 * `pairs` is { base: ['column_en', 'column_te'], ... }.
 * The base field is added alongside the raw columns.
 */
function resolveRow(row, pairs, lang) {
  if (!row) return row;
  const out = { ...row };
  for (const [base, [enCol, teCol]] of Object.entries(pairs || {})) {
    out[base] = pick(row[enCol], row[teCol], lang);
  }
  return out;
}

/** Resolves an array of rows. */
function resolveRows(rows, pairs, lang) {
  return (rows || []).map((row) => resolveRow(row, pairs, lang));
}

/** Safely reads a bilingual object { en, te } from CMS input. */
function bilingualValue(value, max = 500) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return {
      en: String(value.en ?? '').trim().slice(0, max),
      te: String(value.te ?? '').trim().slice(0, max)
    };
  }
  const text = String(value ?? '').trim().slice(0, max);
  return { en: text, te: '' };
}

/** True when a bilingual object has no content in either language. */
function isEmptyBilingual(value) {
  if (!value || typeof value !== 'object') return !String(value ?? '').trim();
  return !String(value.en ?? '').trim() && !String(value.te ?? '').trim();
}

module.exports = { LANGS, normaliseLang, pick, resolveRow, resolveRows, bilingualValue, isEmptyBilingual };
