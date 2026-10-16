// Schema-driven sanitiser. Unknown fields are dropped, every value is coerced to
// its declared type, length-limited and stripped of markup. All content is
// rendered as text on the website, so this is a second layer of XSS defence.

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const TAGS = /<\/?[a-zA-Z!][^>]*>/g;

const LIMITS = { text: 300, bi: 500, textarea: 5000, bitext: 5000 };

export function cleanString(v, max = 300) {
  if (v == null) return '';
  return String(v).replace(CONTROL, '').replace(TAGS, '').trim().slice(0, max);
}

const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));
export const isSafeUrl = (s) => /^(https?:\/\/[^\s<>"']+|\/(?!\/)[^\s<>"']*|mailto:[^\s<>"']+|tel:[+0-9 -]+)$/i.test(s);
export const isAssetPath = (s) => /^\/(uploads|images)\/[A-Za-z0-9._\-/]+$/.test(s) && !s.includes('..');

function bilingual(v, max) {
  const src = v && typeof v === 'object' ? v : { en: v };
  return { en: cleanString(src.en, max), te: cleanString(src.te, max) };
}

function toArray(v) {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') return v.split(/\r?\n/);
  return [];
}

function sanitizeValue(field, raw, errors, path) {
  const label = field.label || field.name;
  const fail = (msg) => errors.push(`${path}: ${label} ${msg}`);
  switch (field.type) {
    case 'text':
    case 'textarea': {
      const s = cleanString(raw, field.max || LIMITS[field.type]);
      if (s && field.pattern && !new RegExp(field.pattern).test(s)) fail('has an invalid format');
      return s;
    }
    case 'slug': {
      const s = cleanString(raw, 64).toLowerCase();
      if (s && !/^[a-z0-9][a-z0-9-]{0,63}$/.test(s)) fail('may contain only lowercase letters, digits and hyphens');
      return s;
    }
    case 'email': {
      const s = cleanString(raw, 160);
      if (s && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(s)) fail('must be a valid e-mail address');
      return s;
    }
    case 'bi':
    case 'bitext':
      return bilingual(raw, LIMITS[field.type]);
    case 'bilist':
      return toArray(raw).slice(0, 60).map((x) => bilingual(x, LIMITS.bitext)).filter((x) => x.en || x.te);
    case 'list':
      return toArray(raw).slice(0, 60).map((x) => cleanString(x, 200)).filter(Boolean);
    case 'number': {
      if (raw === '' || raw == null) return null;
      const n = Number(raw);
      if (!Number.isFinite(n)) {
        fail('must be a number');
        return null;
      }
      if (field.min != null && n < field.min) fail(`must be at least ${field.min}`);
      if (field.max != null && n > field.max) fail(`must be at most ${field.max}`);
      return n;
    }
    case 'date': {
      const s = cleanString(raw, 10);
      if (s && !isDate(s)) fail('must be a date (YYYY-MM-DD)');
      return s;
    }
    case 'bool':
      return raw === true || raw === 'true' || raw === 1 || raw === '1';
    case 'select': {
      const s = cleanString(raw, 60);
      if (!field.options.includes(s)) {
        if (s) fail('has an invalid option');
        return field.options[0];
      }
      return s;
    }
    case 'url': {
      const s = cleanString(raw, 500);
      if (s && !isSafeUrl(s)) fail('must be an http(s) address or a site path starting with /');
      return s;
    }
    case 'file':
    case 'image': {
      const s = cleanString(raw, 300);
      if (s && !isAssetPath(s)) fail('must be an uploaded file');
      return s;
    }
    case 'youtube': {
      const s = cleanString(raw, 20);
      if (s && !/^[A-Za-z0-9_-]{11}$/.test(s)) fail('must be an 11-character YouTube video ID');
      return s;
    }
    case 'color': {
      const s = cleanString(raw, 7);
      if (s && !/^#[0-9a-fA-F]{6}$/.test(s)) fail('must be a hex colour such as #0b3d91');
      return s;
    }
    case 'repeater':
      return (Array.isArray(raw) ? raw : [])
        .slice(0, 100)
        .map((row, i) => sanitizeObject(field.fields, row, errors, `${path} › ${label} #${i + 1}`));
    default:
      return undefined;
  }
}

function isEmpty(v) {
  if (v == null || v === '') return true;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object' && 'en' in v) return !v.en && !v.te;
  return false;
}

export function sanitizeObject(fields, input, errors = [], path = 'Item') {
  const src = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const out = {};
  for (const field of fields) {
    const v = sanitizeValue(field, src[field.name], errors, path);
    if (field.required && isEmpty(v)) errors.push(`${path}: ${field.label || field.name} is required`);
    out[field.name] = v;
  }
  return out;
}

export function sanitize(fields, input) {
  const errors = [];
  const value = sanitizeObject(fields, input, errors);
  return { value, errors };
}
