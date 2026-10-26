// src/services/settingsService.js — public site settings and CMS settings groups.
const ApiError = require('../utils/ApiError');
const repository = require('../repositories/settingsRepository');
const contentRepository = require('../repositories/contentRepository');
const analyticsRepository = require('../repositories/analyticsRepository');
const { getSetting, settings } = require('../content/settings');
const { sanitizeCollection } = require('../utils/validate');
const { record } = require('../utils/audit');

async function get(name) {
  return repository.get(name);
}

async function all() {
  return repository.all();
}

/** Small public payload for the website header/footer. */
async function publicSettings() {
  const [site, contact] = await Promise.all([repository.get('site'), repository.get('contact')]);
  return {
    siteTitle: site.name || { en: 'Department of Science, Technology & Innovation', te: '' },
    shortName: site.shortName || 'DSTI',
    contactEmail: contact.email || '',
    phone: contact.phone || '',
    lastUpdated: await analyticsRepository.lastUpdated()
  };
}

/** Visible CMS settings groups for a role. */
function schemasForRole(role) {
  return Object.fromEntries(Object.entries(settings).filter(([, schema]) => schema.roles.includes(role)));
}

function schemaOr403(name, role) {
  const schema = getSetting(name);
  if (!schema) throw new ApiError(404, 'Unknown settings group.');
  if (!schema.roles.includes(role)) throw new ApiError(403, 'You do not have permission to do this.');
  return schema;
}

async function getForAdmin(name, role) {
  schemaOr403(name, role);
  return repository.get(name);
}

async function save(name, body, user) {
  const schema = schemaOr403(name, user.role);
  const { value, errors } = sanitizeCollection(schema.fields, body || {});
  if (errors.length) {
    const error = new ApiError(400, 'Please correct the errors.');
    error.details = errors;
    throw error;
  }
  await repository.put(name, value);
  contentRepository.bumpVersion();
  await record(user, 'SETTINGS', name, '', '');
  return value;
}

/** /api/v1: replace one or more groups from an object of key → value. */
async function saveRaw(body, user) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(400, 'Send an object of setting keys and values.');
  }
  const known = Object.keys(settings);
  const incoming = Object.keys(body).filter((key) => known.includes(key));
  if (!incoming.length) throw new ApiError(400, `No known setting keys. Valid keys: ${known.join(', ')}.`);
  for (const key of incoming) {
    const schema = schemaOr403(key, user.role);
    const { value, errors } = sanitizeCollection(schema.fields, body[key] || {});
    if (errors.length) {
      const error = new ApiError(400, `Please correct ${key} settings.`);
      error.details = errors;
      throw error;
    }
    await repository.put(key, value);
  }
  contentRepository.bumpVersion();
  await record(user, 'SETTINGS', incoming.join(','), '', '');
  return repository.all();
}

module.exports = { get, all, publicSettings, schemasForRole, getForAdmin, save, saveRaw };
