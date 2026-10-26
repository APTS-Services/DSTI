// src/repositories/baseRepository.js — generic CRUD driven by resources.js.
// Identifiers come from the static registry, never from request input.
const { q, one } = require('../config/db');
const { getResource, publicWhere } = require('../content/resources');
const { ApiError } = require('../utils/http');

const ident = (name) => `\`${String(name).replace(/`/g, '')}\``;

const sortableColumns = (resource) =>
  new Set([resource.pk, resource.slug, resource.sortDefault, ...(resource.columns || []).map((c) => c.name)].filter(Boolean));

function whereClause(parts, params) {
  return parts.length ? { sql: `WHERE ${parts.join(' AND ')}`, params } : { sql: '', params: [] };
}

/** Public list with explicit filters supplied by the service. */
async function listPublic(key, { filters = {}, search, sort, order = 'asc', page = 1, limit = 20, select = '*', join = '' } = {}) {
  const resource = getResource(key);
  if (!resource) throw new ApiError(404, `Unknown resource: ${key}`);
  const parts = [];
  const params = [];
  const pub = publicWhere(resource);
  parts.push(pub.sql);
  params.push(...pub.params);

  for (const [column, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') continue;
    if (!sortableColumns(resource).has(column)) continue;
    parts.push(`${ident(column)} = ?`);
    params.push(value);
  }
  if (search) {
    const term = `%${String(search).replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    const cols = (resource.search || []).map((c) => `${ident(c)} LIKE ?`);
    if (cols.length) {
      parts.push(`(${cols.join(' OR ')})`);
      for (let i = 0; i < cols.length; i += 1) params.push(term);
    }
  }

  const clause = whereClause(parts, params);
  const sortColumn = sort && sortableColumns(resource).has(sort) ? sort : resource.sortDefault || resource.pk;
  const direction = String(order).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  const [{ total }] = await q(`SELECT COUNT(*) AS total FROM ${ident(resource.table)} ${join} ${clause.sql}`, clause.params);
  const rows = await q(
    `SELECT ${select} FROM ${ident(resource.table)} ${join} ${clause.sql} ORDER BY ${ident(sortColumn)} ${direction} LIMIT ? OFFSET ?`,
    [...clause.params, limit, (page - 1) * limit]
  );
  return { rows, total: Number(total) };
}

/** Admin list: includes drafts and archived rows. */
async function listAdmin(key, { status, q: term, sort, order, page = 1, limit = 20 } = {}) {
  const resource = getResource(key);
  if (!resource) throw new ApiError(404, `Unknown resource: ${key}`);
  const parts = [];
  const params = [];

  if (status && resource.status) {
    if (resource.status.type === 'active') {
      parts.push(`${ident(resource.status.column)} = ?`);
      params.push(status === 'published' || status === 'active' ? 1 : 0);
    } else {
      parts.push(`${ident(resource.status.column)} = ?`);
      params.push(status);
    }
  }
  if (term) {
    const pattern = `%${String(term).replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    const cols = (resource.search || []).map((c) => `${ident(c)} LIKE ?`);
    if (cols.length) {
      parts.push(`(${cols.join(' OR ')})`);
      for (let i = 0; i < cols.length; i += 1) params.push(pattern);
    }
  }

  const clause = whereClause(parts, params);
  const sortColumn = sort && sortableColumns(resource).has(sort) ? sort : resource.pk;
  const direction = String(order).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  const [{ total }] = await q(`SELECT COUNT(*) AS total FROM ${ident(resource.table)} ${clause.sql}`, clause.params);
  const rows = await q(
    `SELECT * FROM ${ident(resource.table)} ${clause.sql} ORDER BY ${ident(sortColumn)} ${direction} LIMIT ? OFFSET ?`,
    [...clause.params, limit, (page - 1) * limit]
  );
  return { rows, total: Number(total) };
}

async function findById(key, id) {
  const resource = getResource(key);
  if (!resource) throw new ApiError(404, `Unknown resource: ${key}`);
  return one(`SELECT * FROM ${ident(resource.table)} WHERE ${ident(resource.pk)} = ?`, [id]);
}

async function findBySlug(key, slug) {
  const resource = getResource(key);
  if (!resource || !resource.slug) return null;
  return one(`SELECT * FROM ${ident(resource.table)} WHERE ${ident(resource.slug)} = ?`, [slug]);
}

/** Resolves either a numeric id or a slug, whichever the resource supports. */
async function resolveRecord(key, identifier) {
  const resource = getResource(key);
  if (!resource) throw new ApiError(404, `Unknown resource: ${key}`);
  const numeric = Number(identifier);
  if (resource.slug && Number.isFinite(numeric) && String(numeric) === String(identifier)) {
    return (await findById(key, numeric)) || findBySlug(key, identifier);
  }
  if (resource.slug && !Number.isFinite(numeric)) return findBySlug(key, identifier);
  if (!Number.isFinite(numeric)) return null;
  return findById(key, numeric);
}

async function create(key, data) {
  const resource = getResource(key);
  if (!resource) throw new ApiError(404, `Unknown resource: ${key}`);
  const columns = Object.keys(data);
  if (!columns.length) throw new ApiError(400, 'No fields to save.');
  const result = await q(
    `INSERT INTO ${ident(resource.table)} (${columns.map(ident).join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
    columns.map((c) => data[c])
  );
  return result.insertId;
}

async function update(key, id, data) {
  const resource = getResource(key);
  const columns = Object.keys(data);
  if (!columns.length) throw new ApiError(400, 'No fields to save.');
  await q(
    `UPDATE ${ident(resource.table)} SET ${columns.map((c) => `${ident(c)} = ?`).join(', ')} WHERE ${ident(resource.pk)} = ?`,
    [...columns.map((c) => data[c]), id]
  );
}

async function remove(key, id) {
  const resource = getResource(key);
  await q(`DELETE FROM ${ident(resource.table)} WHERE ${ident(resource.pk)} = ?`, [id]);
}

function statusValue(resource, status) {
  if (!resource.status) throw new ApiError(400, 'This content type has no publish status.');
  if (resource.status.type === 'active') return status === 'published' ? 1 : 0;
  if (status === 'published') return resource.status.published;
  const value = resource.status[status];
  if (!value) throw new ApiError(400, `Status "${status}" is not supported for this content type.`);
  return value;
}

async function setStatus(key, id, status) {
  const resource = getResource(key);
  const value = statusValue(resource, status);
  await q(
    `UPDATE ${ident(resource.table)} SET ${ident(resource.status.column)} = ? WHERE ${ident(resource.pk)} = ?`,
    [value, id]
  );
  return value;
}

async function reorder(key, items) {
  const resource = getResource(key);
  if (!resource.order) throw new ApiError(400, 'This content type cannot be reordered.');
  for (const item of items.slice(0, 500)) {
    const identifier = item.id ?? item.key;
    const order = Number(item.order ?? item._order ?? 0);
    if (identifier === undefined || !Number.isFinite(order)) continue;
    // Some resources are keyed by slug in the admin UI (pages, policies, …).
    const row = await resolveRecord(key, identifier);
    if (!row) continue;
    await q(
      `UPDATE ${ident(resource.table)} SET ${ident(resource.order)} = ? WHERE ${ident(resource.pk)} = ?`,
      [order, row[resource.pk]]
    );
  }
}

async function count(key, { publicOnly = false } = {}) {
  const resource = getResource(key);
  const where = publicOnly ? publicWhere(resource) : { sql: '', params: [] };
  const row = await one(
    `SELECT COUNT(*) AS total FROM ${ident(resource.table)} ${where.sql ? `WHERE ${where.sql}` : ''}`,
    where.params
  );
  return Number(row?.total || 0);
}

module.exports = {
  ident,
  listPublic,
  listAdmin,
  findById,
  findBySlug,
  resolveRecord,
  create,
  update,
  remove,
  setStatus,
  reorder,
  count,
  statusValue
};
