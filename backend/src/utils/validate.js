// src/utils/validate.js — input sanitisation.
//
// Two entry points:
//   sanitizeCollection(fields, body)  — CMS forms (frontend field schema)
//   sanitizeResource(resource, body)  — /api/v1 admin writes (DB columns)
// Both return { value, errors } and never trust the client for unknown fields.

const cleanString = (value, max = 500) => {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\u0000/g, '').trim().slice(0, max);
};

const cleanMultiline = (value, max = 10000) => {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\u0000/g, '').replace(/\r\n/g, '\n').trim().slice(0, max);
};

const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;
const URL_RE = /^(https?:\/\/[^\s<>"']+|\/[^\s<>"']*)$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,79}$/i;
const YOUTUBE_RE = /^[A-Za-z0-9_-]{11}$/;
const COLOR_RE = /^#[0-9a-f]{6}$/i;

const asArray = (value) => (Array.isArray(value) ? value : []);

/** --- CMS field schemas ------------------------------------------------- */

function sanitizeField(field, raw, errors) {
  const { name, type } = field;
  const label = field.label || name;
  const required = Boolean(field.required);

  switch (type) {
    case 'text':
    case 'textarea': {
      const value = cleanMultiline(raw, field.max || (type === 'textarea' ? 5000 : 500));
      if (required && !value) errors.push(`${label} is required.`);
      return value;
    }
    case 'bi':
    case 'bitext': {
      const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : { en: raw, te: '' };
      const max = field.max || (type === 'bitext' ? 5000 : 500);
      const value = { en: cleanMultiline(source.en, max), te: cleanMultiline(source.te, max) };
      if (required && !value.en) errors.push(`${label} is required (English).`);
      return value;
    }
    case 'bilist': {
      const value = asArray(raw)
        .map((row) => {
          const source = row && typeof row === 'object' ? row : { en: row, te: '' };
          return { en: cleanMultiline(source.en, 2000), te: cleanMultiline(source.te, 2000) };
        })
        .filter((row) => row.en || row.te)
        .slice(0, 60);
      if (required && !value.length) errors.push(`${label} needs at least one line.`);
      return value;
    }
    case 'list': {
      const value = asArray(raw)
        .map((item) => cleanString(item, 300))
        .filter(Boolean)
        .slice(0, 100);
      if (required && !value.length) errors.push(`${label} needs at least one item.`);
      return value;
    }
    case 'number': {
      if (raw === '' || raw === null || raw === undefined) {
        if (required) errors.push(`${label} is required.`);
        return null;
      }
      const value = Number(raw);
      if (!Number.isFinite(value)) {
        errors.push(`${label} must be a number.`);
        return null;
      }
      if (field.min !== undefined && value < field.min) errors.push(`${label} must be at least ${field.min}.`);
      if (field.maxValue !== undefined && value > field.maxValue) errors.push(`${label} must be at most ${field.maxValue}.`);
      return value;
    }
    case 'date': {
      const value = cleanString(raw, 10);
      if (!value) {
        if (required) errors.push(`${label} is required.`);
        return '';
      }
      if (!DATE_RE.test(value)) {
        errors.push(`${label} must be a date (YYYY-MM-DD).`);
        return '';
      }
      return value;
    }
    case 'bool':
      return raw === true || raw === 1 || raw === '1' || raw === 'true';
    case 'select': {
      const value = cleanString(raw, 100);
      if (value && Array.isArray(field.options) && !field.options.includes(value)) {
        errors.push(`${label} has an invalid value.`);
        return '';
      }
      if (required && !value) errors.push(`${label} is required.`);
      return value;
    }
    case 'email': {
      const value = cleanString(raw, 190);
      if (value && !EMAIL_RE.test(value)) errors.push(`${label} must be a valid e-mail address.`);
      if (required && !value) errors.push(`${label} is required.`);
      return value;
    }
    case 'url':
    case 'route': {
      const value = cleanString(raw, 500);
      if (value && !URL_RE.test(value)) errors.push(`${label} must be a valid link.`);
      if (required && !value) errors.push(`${label} is required.`);
      return value;
    }
    case 'slug': {
      const value = cleanString(raw, 80).toLowerCase();
      if (!value) {
        if (required) errors.push(`${label} is required.`);
        return '';
      }
      if (!SLUG_RE.test(value)) errors.push(`${label} may only contain letters, digits and dashes.`);
      return value;
    }
    case 'file':
    case 'image': {
      const value = cleanString(raw, 500);
      if (value && !URL_RE.test(value)) errors.push(`${label} must be an uploaded file path or a link.`);
      if (required && !value) errors.push(`${label} is required.`);
      return value;
    }
    case 'youtube': {
      const value = cleanString(raw, 20);
      if (value && !YOUTUBE_RE.test(value)) errors.push(`${label} must be a valid 11-character YouTube id.`);
      return value;
    }
    case 'color': {
      const value = cleanString(raw, 7);
      if (value && !COLOR_RE.test(value)) errors.push(`${label} must be a colour such as #1a5fb4.`);
      return value;
    }
    case 'repeater': {
      const value = asArray(raw)
        .slice(0, 100)
        .map((row) => {
          const itemErrors = [];
          const item = sanitizeCollection(field.fields || [], row || {}, itemErrors);
          return { value: item.value, errors: itemErrors };
        });
      const flattened = value.flatMap((item) => item.errors);
      errors.push(...flattened);
      return value.map((item) => item.value);
    }
    default:
      return cleanString(raw, 500);
  }
}

function sanitizeCollection(fields, body = {}) {
  const value = {};
  const errors = [];
  for (const field of fields || []) {
    value[field.name] = sanitizeField(field, body[field.name], errors);
  }
  return { value, errors };
}

/** --- /api/v1 resource writes ------------------------------------------ */

function coerceColumn(column, raw) {
  if (raw === null || raw === undefined) return null;
  if (column.json) {
    return JSON.stringify(raw).slice(0, 65000);
  }
  if (column.type === 'int') {
    const n = Number(raw);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  }
  if (column.type === 'bool') return raw === true || raw === 1 || raw === '1' || raw === 'true' ? 1 : 0;
  if (column.type === 'decimal') {
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
  if (column.type === 'date') {
    const text = cleanString(raw, 10);
    return DATE_RE.test(text) ? text : null;
  }
  if (column.type === 'datetime') {
    const text = cleanString(raw, 19);
    return text ? text.replace('T', ' ') : null;
  }
  return cleanString(raw, column.max || 5000);
}

/**
 * Validates a write against the resource's column allowlist.
 * `resources` is the registry from src/content/resources.js.
 */
function sanitizeResource(resource, body = {}, { partial = false } = {}) {
  const value = {};
  const errors = [];
  for (const column of resource.columns || []) {
    // Accept both `title_en` and a bilingual object `title: { en, te }`.
    let raw = body[column.name];
    if (raw === undefined && column.base && body[column.base] && typeof body[column.base] === 'object') {
      raw = body[column.base][column.lang];
    }
    // Only fields the client sent are written; missing required fields still
    // fail validation. Optional columns keep their database defaults.
    if (raw === undefined && partial) continue;
    if (raw === undefined && column.required) raw = '';
    if (raw === undefined) continue;
    const coerced = coerceColumn(column, raw);
    if (column.required && (coerced === null || coerced === '')) {
      errors.push(`${column.base || column.name} is required.`);
      continue;
    }
    if (column.type === 'string' && typeof coerced === 'string' && column.max && coerced.length > column.max) {
      errors.push(`${column.base || column.name} is too long (maximum ${column.max} characters).`);
      continue;
    }
    if (column.enum && coerced && !column.enum.includes(coerced)) {
      errors.push(`${column.base || column.name} must be one of: ${column.enum.join(', ')}.`);
      continue;
    }
    if (column.email && coerced && !EMAIL_RE.test(coerced)) {
      errors.push(`${column.base || column.name} must be a valid e-mail address.`);
      continue;
    }
    if (column.url && coerced && !URL_RE.test(coerced)) {
      errors.push(`${column.base || column.name} must be a valid link.`);
      continue;
    }
    if (column.type === 'date' && column.required && !coerced) {
      errors.push(`${column.base || column.name} must be a date (YYYY-MM-DD).`);
      continue;
    }
    value[column.name] = coerced;
  }
  return { value, errors };
}

module.exports = {
  cleanString,
  cleanMultiline,
  sanitizeCollection,
  sanitizeResource,
  EMAIL_RE,
  URL_RE,
  DATE_RE,
  SLUG_RE
};
