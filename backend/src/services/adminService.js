// src/services/adminService.js — /api/v1/admin business logic.
const { q, one } = require('../config/db');
const { getResource } = require('../content/resources');
const baseRepository = require('../repositories/baseRepository');
const mediaRepository = require('../repositories/mediaRepository');
const auditRepository = require('../repositories/auditRepository');
const analyticsService = require('./analyticsService');
const searchService = require('./searchService');
const settingsService = require('./settingsService');
const backupService = require('./backupService');
const contentRepository = require('../repositories/contentRepository');
const ApiError = require('../utils/ApiError');
const { sanitizeResource } = require('../utils/validate');
const { record } = require('../utils/audit');
const { pageParams, meta } = require('../utils/http');
const userService = require('./userService');

function resourceOr404(key) {
  const resource = getResource(key);
  if (!resource) throw new ApiError(404, `Unknown resource: ${key}`);
  return resource;
}

async function list(key, query) {
  resourceOr404(key);
  const { page, limit } = pageParams(query);
  const result = await baseRepository.listAdmin(key, {
    status: query.status,
    q: query.q,
    sort: query.sort,
    order: query.order,
    page,
    limit
  });
  return { data: result.rows, meta: meta(page, limit, result.total) };
}

async function get(key, identifier) {
  resourceOr404(key);
  const row = await baseRepository.resolveRecord(key, identifier);
  if (!row) throw new ApiError(404, 'Record not found.');
  return row;
}

async function create(key, body, user, req) {
  const resource = resourceOr404(key);
  const { value, errors } = sanitizeResource(resource, body || {});
  if (errors.length) throw new ApiError(400, errors.join(' '), errors);

  if (resource.status && value[resource.status.column] === undefined) {
    value[resource.status.column] = resource.status.type === 'active' ? 0 : resource.status.draft || 'draft';
  }
  // `pages.section` is NOT NULL without a database default; the CMS always
  // writes a section, while API clients may omit it for a generic about page.
  if (key === 'pages' && value.section === undefined) value.section = 'about';
  const id = await baseRepository.create(key, value);
  const row = await baseRepository.findById(key, id);
  await record(user, 'CREATE', `${key}/${id}`, user?.username || '', req?.ip || '');
  return row;
}

async function update(key, identifier, body, user, req) {
  resourceOr404(key);
  const row = await baseRepository.resolveRecord(key, identifier);
  if (!row) throw new ApiError(404, 'Record not found.');
  const resource = getResource(key);
  const { value, errors } = sanitizeResource(resource, body || {}, { partial: true });
  if (errors.length) throw new ApiError(400, errors.join(' '), errors);
  if (resource.status?.type === 'active' && body?.status !== undefined) {
    value[resource.status.column] = body.status === 'published' || body.status === 'active' ? 1 : 0;
    delete value.status;
  }
  if (!Object.keys(value).length) throw new ApiError(400, 'No fields to update.');
  await baseRepository.update(key, row[resource.pk], value);
  await record(user, 'UPDATE', `${key}/${identifier}`, user?.username || '', req?.ip || '');
  return baseRepository.resolveRecord(key, identifier);
}

async function remove(key, identifier, user, req) {
  resourceOr404(key);
  const resource = getResource(key);
  const row = await baseRepository.resolveRecord(key, identifier);
  if (!row) throw new ApiError(404, 'Record not found.');
  await baseRepository.remove(key, row[resource.pk]);
  await record(user, 'DELETE', `${key}/${identifier}`, user?.username || '', req?.ip || '');
  return { ok: true };
}

const STATUSES = ['draft', 'pending', 'published', 'archived'];

async function setStatus(key, identifier, status, user, req) {
  resourceOr404(key);
  if (!STATUSES.includes(status)) throw new ApiError(400, `Status must be one of: ${STATUSES.join(', ')}.`);
  const resource = getResource(key);
  const row = await baseRepository.resolveRecord(key, identifier);
  if (!row) throw new ApiError(404, 'Record not found.');
  await baseRepository.setStatus(key, row[resource.pk], status);
  await record(user, status === 'published' ? 'publish' : 'update', `${key}/${identifier}`, status, req?.ip || '');
  return baseRepository.resolveRecord(key, identifier);
}

async function submit(key, identifier, user, req) {
  resourceOr404(key);
  const resource = getResource(key);
  if (!resource.status || resource.status.type === 'active' || !resource.status.pending) {
    throw new ApiError(400, 'This content type does not use an approval workflow.');
  }
  const row = await baseRepository.resolveRecord(key, identifier);
  if (!row) throw new ApiError(404, 'Record not found.');
  await baseRepository.setStatus(key, row[resource.pk], 'pending');
  await record(user, 'update', `${key}/${identifier}`, 'pending', req?.ip || '');
  return baseRepository.resolveRecord(key, identifier);
}

async function reorder(key, body, user) {
  resourceOr404(key);
  const items = Array.isArray(body) ? body : body?.items;
  if (!Array.isArray(items)) throw new ApiError(400, 'Send an array of { id, order }.');
  await baseRepository.reorder(key, items);
  await record(user, 'update', key, 'reorder', '');
  return { ok: true, count: items.length };
}

async function closeTender(id, user, req) {
  const row = await one('SELECT * FROM tenders WHERE tender_id = ?', [id]);
  if (!row) throw new ApiError(404, 'Tender not found.');
  await q("UPDATE tenders SET status = 'closed' WHERE tender_id = ?", [id]);
  await record(user, 'update', `tenders/${id}`, 'closed', req?.ip || '');
  return one('SELECT * FROM tenders WHERE tender_id = ?', [id]);
}

async function attachCorrigendum(id, fileId, user, req) {
  const row = await one('SELECT tender_id FROM tenders WHERE tender_id = ?', [id]);
  if (!row) throw new ApiError(404, 'Tender not found.');
  const media = await mediaRepository.getById(fileId);
  if (!media) throw new ApiError(400, 'The attached file does not exist.');
  await q('UPDATE tenders SET corrigendum_file_id = ? WHERE tender_id = ?', [media.file_id, id]);
  await record(user, 'update', `tenders/${id}`, 'corrigendum', req?.ip || '');
  return { ok: true, corrigendum_file_id: media.file_id };
}

/* ----------------------------- connections ----------------------------- */

const NODE_TYPES = ['organisation', 'policy', 'sector'];

async function connections(lang = 'en') {
  const [orgs, policies, sectors, links] = await Promise.all([
    q('SELECT org_id, slug, name_en, name_te, status FROM organisations'),
    q('SELECT policy_id, slug, name_en, name_te, status FROM policies'),
    q('SELECT sector_id, slug, name_en, name_te FROM sectors'),
    q('SELECT * FROM entity_links')
  ]);
  const label = (row) => (lang === 'te' && row.name_te ? row.name_te : row.name_en);
  return {
    nodes: [
      ...orgs.map((row) => ({ id: `organisation:${row.org_id}`, type: 'organisation', label: label(row), slug: row.slug, status: row.status })),
      ...policies.map((row) => ({ id: `policy:${row.policy_id}`, type: 'policy', label: label(row), slug: row.slug, status: row.status })),
      ...sectors.map((row) => ({ id: `sector:${row.sector_id}`, type: 'sector', label: label(row), slug: row.slug }))
    ],
    links: links.map((row) => ({
      source: `${row.from_type}:${row.from_id}`,
      target: `${row.to_type}:${row.to_id}`,
      relation: lang === 'te' && row.relation_te ? row.relation_te : row.relation_en
    }))
  };
}

async function saveConnections(body, user) {
  const links = Array.isArray(body?.links) ? body.links : Array.isArray(body) ? body : null;
  if (!links) throw new ApiError(400, 'Send { links: [ { from_type, from_id, to_type, to_id, relation } ] }.');
  const cleaned = [];
  for (const link of links.slice(0, 2000)) {
    const fromType = String(link.from_type || link.fromType || '');
    const toType = String(link.to_type || link.toType || '');
    const fromId = Number(link.from_id ?? link.fromId);
    const toId = Number(link.to_id ?? link.toId);
    if (!NODE_TYPES.includes(fromType) || !NODE_TYPES.includes(toType) || !fromId || !toId) continue;
    cleaned.push([fromType, fromId, toType, toId, link.relation_en || link.relation || null, link.relation_te || null]);
  }
  await q('DELETE FROM entity_links');
  for (const row of cleaned) {
    await q(
      `INSERT IGNORE INTO entity_links (from_type, from_id, to_type, to_id, relation_en, relation_te)
       VALUES (?, ?, ?, ?, ?, ?)`,
      row
    );
  }
  await record(user, 'update', 'connections', `${cleaned.length} links`, '');
  return { ok: true, count: cleaned.length };
}

/* ------------------------ district institutions ------------------------ */

async function importInstitutions(body, user) {
  const rows = Array.isArray(body) ? body : Array.isArray(body?.items) ? body.items : null;
  if (!rows) throw new ApiError(400, 'Send an array of institutions.');
  const resource = getResource('district-institutions');
  let imported = 0;
  const errors = [];
  for (const [index, raw] of rows.slice(0, 2000).entries()) {
    if (!raw?.district_id && raw?.district) {
      const district = await one('SELECT district_id FROM districts WHERE slug = ?', [String(raw.district)]);
      raw.district_id = district?.district_id;
    }
    const { value, errors: rowErrors } = sanitizeResource(resource, raw || {});
    if (rowErrors.length) {
      errors.push(`Row ${index + 1}: ${rowErrors.slice(0, 2).join(' ')}`);
      continue;
    }
    if (!value.status) value.status = 'published';
    await baseRepository.create('district-institutions', value);
    imported += 1;
  }
  await record(user, 'create', 'district-institutions', `${imported} imported`, '');
  return { imported, skipped: rows.length - imported, errors: errors.slice(0, 20) };
}

/* -------------------------------- users -------------------------------- */

async function listUsers() {
  const rows = await userService.list();
  return rows.map((row) => ({
    id: row.id,
    username: row.username,
    name: row.full_name,
    email: row.email,
    role: row.role_key || row.role,
    is_active: row.is_active,
    must_change_password: row.must_change_password,
    last_login_at: row.last_login_at,
    created_at: row.created_at
  }));
}

async function createUser(body, user) {
  return userService.createAccount(body, user);
}

async function updateUser(id, body, user) {
  return userService.updateAccount(id, body, user);
}

async function setUserStatus(id, isActive, user) {
  return userService.setStatus(id, isActive, user);
}

async function deleteUser(id, user) {
  return userService.remove(id, user);
}

async function listRoles() {
  return userService.roles();
}

/* ------------------------------ reporting ------------------------------ */

async function auditLog(query) {
  const { page, limit } = pageParams(query);
  const result = await auditRepository.list({
    user: query.user,
    action: query.action,
    table: query.table,
    from: query.from,
    to: query.to,
    page,
    limit
  });
  return { data: result.rows, meta: meta(page, limit, result.total) };
}

async function assistantLogs(query) {
  return searchService.logs(query);
}

function reindex() {
  contentRepository.bumpVersion();
  return { ok: true, reindexedAt: new Date().toISOString() };
}

module.exports = {
  list,
  get,
  create,
  update,
  remove,
  setStatus,
  submit,
  reorder,
  closeTender,
  attachCorrigendum,
  connections,
  saveConnections,
  importInstitutions,
  listUsers,
  createUser,
  updateUser,
  setUserStatus,
  deleteUser,
  listRoles,
  auditLog,
  assistantLogs,
  reindex,
  analyticsService,
  settingsService,
  backupService,
  // re-exported for controllers
  analytics: analyticsService,
  settings: settingsService,
  backup: backupService,
  feedback: require('./feedbackService'),
  media: require('./mediaService'),
  search: searchService
};
