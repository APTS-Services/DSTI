// Data access for CMS content. Collections and settings share one table.
import crypto from 'node:crypto';
import { query } from '../db/pool.js';
import { collections, settings } from './schemas.js';

const SETTINGS = '_settings';

function parse(row) {
  let data = {};
  try {
    data = JSON.parse(row.data);
  } catch {
    data = {};
  }
  return {
    ...data,
    id: row.item_key,
    _status: row.status,
    _order: row.sort_order,
    _updatedAt: row.updated_at,
  };
}

const strip = ({ _status, _order, _updatedAt, ...rest }) => rest;

export async function listItems(collection, { includeDrafts = false } = {}) {
  const rows = await query(
    `SELECT item_key, data, status, sort_order, updated_at FROM content
     WHERE collection = ? ${includeDrafts ? '' : "AND status = 'published'"}
     ORDER BY sort_order ASC, id ASC`,
    [collection],
  );
  return rows.map(parse);
}

export async function getItem(collection, key) {
  const rows = await query('SELECT item_key, data, status, sort_order, updated_at FROM content WHERE collection = ? AND item_key = ?', [collection, key]);
  return rows[0] ? parse(rows[0]) : null;
}

export function newKey(collection) {
  return `${collection.slice(0, 12).toLowerCase()}-${crypto.randomBytes(5).toString('hex')}`;
}

export async function insertItem(collection, key, data, { status = 'published', order = 0, userId = null } = {}) {
  const { id, ...payload } = data;
  await query(
    'INSERT INTO content (collection, item_key, data, status, sort_order, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [collection, key, JSON.stringify(payload), status, order, userId, userId],
  );
  bumpVersion();
}

export async function updateItem(collection, key, data, { status, order, userId = null, newKey: renamed } = {}) {
  const { id, ...payload } = data;
  const result = await query(
    'UPDATE content SET item_key = ?, data = ?, status = ?, sort_order = ?, updated_by = ? WHERE collection = ? AND item_key = ?',
    [renamed || key, JSON.stringify(payload), status, order, userId, collection, key],
  );
  bumpVersion();
  return result.affectedRows > 0;
}

export async function deleteItem(collection, key) {
  const result = await query('DELETE FROM content WHERE collection = ? AND item_key = ?', [collection, key]);
  bumpVersion();
  return result.affectedRows > 0;
}

export async function getSettings(name) {
  const item = await getItem(SETTINGS, name);
  return item ? strip(item) : {};
}

export async function putSettings(name, data, userId = null) {
  await query(
    `INSERT INTO content (collection, item_key, data, status, sort_order, created_by, updated_by)
     VALUES (?, ?, ?, 'published', 0, ?, ?)
     ON DUPLICATE KEY UPDATE data = VALUES(data), updated_by = VALUES(updated_by)`,
    [SETTINGS, name, JSON.stringify(data), userId, userId],
  );
  bumpVersion();
}

// ---- Public bundle (all published content in one cached response) ----
let cache = null;
let version = 0;

export function bumpVersion() {
  version += 1;
  cache = null;
}

export async function publicBundle() {
  if (cache) return cache;
  const startVersion = version;
  const rows = await query(
    "SELECT collection, item_key, data, status, sort_order, updated_at FROM content WHERE status = 'published' ORDER BY sort_order ASC, id ASC",
  );
  const out = { collections: {}, settings: {} };
  for (const name of Object.keys(collections)) out.collections[name] = [];
  for (const row of rows) {
    if (row.collection === SETTINGS) {
      if (settings[row.item_key] && !settings[row.item_key].private) out.settings[row.item_key] = strip(parse(row));
    } else if (out.collections[row.collection]) {
      out.collections[row.collection].push(strip(parse(row)));
    }
  }
  const body = JSON.stringify(out);
  const etag = `"${crypto.createHash('sha1').update(body).digest('base64url')}"`;
  const built = { body, etag, data: out };
  if (startVersion === version) cache = built;
  return built;
}
