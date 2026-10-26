// src/services/contentService.js — CMS create/read/update/delete workflow.
const ApiError = require('../utils/ApiError');
const repository = require('../repositories/contentRepository');
const analyticsRepository = require('../repositories/analyticsRepository');
const feedbackRepository = require('../repositories/feedbackRepository');
const auditRepository = require('../repositories/auditRepository');
const settingsService = require('./settingsService');
const { getCollection, collections } = require('../content/collections');
const { SITE_ROUTES, ROUTE_PATHS, plainPath, isExternal } = require('../content/routes');
const { pagePath } = require('../content/pagePaths');
const { sanitizeCollection } = require('../utils/validate');
const { record } = require('../utils/audit');
const { one } = require('../config/db');

const canPublish = (user) => user.role === 'Administrator' || user.role === 'Publisher';

function schemaOr404(name) {
  const schema = getCollection(name);
  if (!schema) throw new ApiError(404, 'Unknown section.');
  return schema;
}

function readMeta(req, existing, user) {
  const requested = Number(req.body?._order);
  const order = Number.isFinite(requested) ? Math.max(-9999, Math.min(9999, requested)) : existing?._order ?? 0;
  let status = req.body?._status === 'draft' ? 'draft' : 'published';
  if (!canPublish(user)) status = existing ? existing._status : 'draft';
  return { order, status };
}

async function schemas(user) {
  const pages = await repository.list('pages', { includeDrafts: false });
  const pageTargets = pages
    .map((page) => ({ id: page.id, title: page.title?.en || page.id, path: pagePath(page.id) }))
    .sort((a, b) => a.title.localeCompare(b.title));
  return {
    collections,
    settings: settingsService.schemasForRole(user.role),
    // Used by the menu/URL picker so an editor can only choose a real target.
    linkTargets: { routes: SITE_ROUTES, pages: pageTargets }
  };
}

/**
 * Rejects a menu entry pointing at a page that does not exist. External links
 * and known application routes pass; dynamic targets are verified in MySQL.
 */
async function linkProblem(link) {
  if (!link || isExternal(link)) return null;
  const path = plainPath(link);
  if (ROUTE_PATHS.has(path)) return null;

  const [prefix, slug] = path.replace(/^\//, '').split('/');
  if (slug) {
    if (prefix === 'p' && (await repository.get('pages', slug))) return null;
    if (prefix === 'policies') {
      if (await repository.get('policies', slug)) return null;
      if (await repository.get('pages', slug)) return null;
    }
    if (prefix === 'organisations' && (await repository.get('organisations', slug))) return null;
  }
  return `No page exists at "${link}". Choose a page or section from the list.`;
}

/** Validates every link of a Main menu item (parent and children). */
async function assertMenuLinks(collection, value) {
  if (collection !== 'navigation') return;
  const links = [value.to, ...(value.children || []).map((child) => child.to)].filter(Boolean);
  for (const link of links) {
    const problem = await linkProblem(link);
    if (problem) throw new ApiError(400, problem);
  }
}

async function dashboard(user) {
  const counts = await repository.counts();
  const feedback = await feedbackRepository.unreadCount();
  const totals = await analyticsRepository.totals();
  const openTenders = await one(
    "SELECT COUNT(*) AS total FROM tenders WHERE status = 'open' AND publish_status = 'published'"
  );
  const recent = canPublish(user) ? await auditRepository.recent(8) : [];
  return {
    counts,
    feedback,
    visits: { total: totals.visitors, today: totals.today.visitors },
    openTenders: Number(openTenders?.total || 0),
    recent
  };
}

async function list(collection, { includeDrafts = true } = {}) {
  schemaOr404(collection);
  return repository.list(collection, { includeDrafts });
}

async function get(collection, key) {
  schemaOr404(collection);
  const item = await repository.get(collection, key);
  if (!item) throw new ApiError(404, 'Item not found.');
  return item;
}

async function create(collection, req, user) {
  const schema = schemaOr404(collection);
  const { value, errors } = sanitizeCollection(schema.fields, req.body || {});
  if (errors.length) {
    const error = new ApiError(400, 'Please correct the errors.');
    error.details = errors;
    throw error;
  }
  const meta = readMeta(req, null, user);
  await assertMenuLinks(collection, value);
  const key = schema.keyField ? value[schema.keyField] : undefined;
  if (key && (await repository.get(collection, key))) {
    throw new ApiError(409, 'An item with this identifier already exists.');
  }
  const item = await repository.createCollection(collection, value, { ...meta, userId: user.id });
  await record(user, 'CREATE', `${collection}/${item.id}`, meta.status, req.ip);
  return item;
}

async function update(collection, key, req, user) {
  const schema = schemaOr404(collection);
  const existing = await repository.get(collection, key);
  if (!existing) throw new ApiError(404, 'Item not found.');
  const { value, errors } = sanitizeCollection(schema.fields, req.body || {});
  if (errors.length) {
    const error = new ApiError(400, 'Please correct the errors.');
    error.details = errors;
    throw error;
  }
  const meta = readMeta(req, existing, user);
  await assertMenuLinks(collection, value);
  const renamed = schema.keyField ? value[schema.keyField] : key;
  if (renamed !== key && (await repository.get(collection, renamed))) {
    throw new ApiError(409, 'An item with this identifier already exists.');
  }
  const item = await repository.updateCollection(collection, key, value, {
    ...meta,
    userId: user.id,
    newKey: renamed
  });
  await record(user, 'UPDATE', `${collection}/${renamed}`, meta.status, req.ip);
  return item;
}

async function remove(collection, key, user, req) {
  if (!canPublish(user)) throw new ApiError(403, 'Only Publishers and Administrators can delete content.');
  schemaOr404(collection);
  await repository.deleteCollection(collection, key);
  await record(user, 'DELETE', `${collection}/${key}`, '', req?.ip || '');
  return { ok: true };
}

async function backup(user) {
  const data = await repository.dump();
  await record(user, 'BACKUP_EXPORT', '', `${data.items.length} items`, '');
  return data;
}

async function restore(body, user) {
  if (!body || body.format !== 'dsti-content-backup' || !Array.isArray(body.items)) {
    throw new ApiError(400, 'This is not a valid DSTI backup file.');
  }
  const result = await repository.restore(body.items);
  await record(user, 'BACKUP_RESTORE', '', `${result.restored} items`, '');
  return result;
}

module.exports = { schemas, dashboard, list, get, create, update, remove, backup, restore, canPublish };
