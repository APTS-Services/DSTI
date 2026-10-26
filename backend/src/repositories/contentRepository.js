// src/repositories/contentRepository.js — CMS content store.
//
// The React CMS works with named collections of free-form items. This module
// maps those collections onto the normalised MySQL schema:
//   - mapped columns (titles, dates, links, foreign keys) live in the real table
//   - CMS-only fields live in cms_extras (JSON) so the schema is not widened
//   - collections with no dedicated table live in cms_blocks (JSON)
const crypto = require('crypto');
const { q, one } = require('../config/db');
const { getCollection, collections } = require('../content/collections');
const mediaRepository = require('./mediaRepository');
const settingsRepository = require('./settingsRepository');
const { pagePath } = require('../content/pagePaths');
const { ApiError } = require('../utils/http');

const ident = (name) => `\`${String(name).replace(/`/g, '')}\``;
const newKey = (collection) => `${collection.slice(0, 12).toLowerCase()}-${crypto.randomBytes(5).toString('hex')}`;
const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'item';

// ---------------------------------------------------------------------------
// JSON helpers
// ---------------------------------------------------------------------------
function parseJson(text) {
  try {
    return JSON.parse(text) || {};
  } catch {
    return {};
  }
}

function stripInternal(item) {
  const { id, _status, _order, _updatedAt, ...rest } = item || {};
  return rest;
}

// ---------------------------------------------------------------------------
// Low-level helpers
// ---------------------------------------------------------------------------
async function loadExtras(collection, ids) {
  let rows;
  if (ids === undefined) {
    // Whole collection (used by the year-grouped awards view).
    rows = await q('SELECT record_id, data, updated_at FROM cms_extras WHERE resource = ?', [collection]);
  } else {
    const clean = [...new Set((ids || []).map(Number).filter((n) => Number.isFinite(n)))];
    if (!clean.length) return new Map();
    rows = await q(
      `SELECT record_id, data, updated_at FROM cms_extras WHERE resource = ? AND record_id IN (${clean.map(() => '?').join(',')})`,
      [collection, ...clean]
    );
  }
  return new Map(rows.map((row) => [Number(row.record_id), { data: parseJson(row.data), updatedAt: row.updated_at }]));
}

async function saveExtras(collection, recordId, data) {
  await q(
    `INSERT INTO cms_extras (resource, record_id, data) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE data = VALUES(data)`,
    [collection, recordId, JSON.stringify(data || {})]
  );
}

async function deleteExtras(collection, recordId) {
  await q('DELETE FROM cms_extras WHERE resource = ? AND record_id = ?', [collection, recordId]);
}

async function mediaPathsFor(storage, rows) {
  const fileColumns = Object.values(storage.map || {})
    .filter((spec) => spec.file)
    .map((spec) => spec.file);
  const ids = [];
  for (const row of rows) {
    for (const column of fileColumns) {
      if (row[column]) ids.push(Number(row[column]));
    }
  }
  return mediaRepository.pathsByIds(ids);
}

const toDateTime = (value) => {
  const text = String(value ?? '').trim();
  if (!text) return null;
  return text.length === 10 ? `${text} 00:00:00` : text.replace('T', ' ').slice(0, 19);
};
const toDate = (value) => {
  const text = String(value ?? '').trim();
  return text ? text.slice(0, 10) : null;
};

/** Coerces a CMS value to the column type implied by its name. */
function columnValue(column, value) {
  // Boolean flags mapped as plain columns (is_*, show_*, *_enabled) must always
  // be 0/1: several are NOT NULL and would reject an explicit NULL.
  if (/^(is_|show_|has_|allow_)|_enabled$/.test(column)) {
    return value === true || value === 1 || value === '1' || value === 'true' ? 1 : 0;
  }
  if (value === undefined || value === null || value === '') {
    return /_id$|^duration_sec$|^month_no$|^day_no$|^display_order$/.test(column) ? null : value === '' ? null : value;
  }
  if (/_id$|^duration_sec$|^month_no$|^day_no$/.test(column)) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  if (column === 'start_datetime' || column === 'end_datetime' || column === 'last_date') return toDateTime(value);
  if (/_date$/.test(column)) return toDate(value);
  return value;
}

const orderValue = (storage, order) => {
  if (!storage.order) return null;
  const n = Number(order);
  return Number.isFinite(n) ? Math.max(-9999, Math.min(9999, n)) : 0;
};

async function resolveFileId(url) {
  const text = String(url || '').trim();
  if (!text.startsWith('/uploads/')) return null;
  const media = await mediaRepository.getByPath(text);
  return media ? media.file_id : null;
}

// ---------------------------------------------------------------------------
// Row ⇄ CMS item mapping
// ---------------------------------------------------------------------------
function statusOut(storage, row) {
  if (!storage.status) return 'published';
  if (storage.status.kind === 'active') return row[storage.status.column] ? 'published' : 'draft';
  return row[storage.status.column] === storage.status.published ? 'published' : 'draft';
}

function statusIn(storage, status) {
  if (!storage.status) return null;
  if (storage.status.kind === 'active') return status === 'published' ? 1 : 0;
  if (status === 'published') return storage.status.published;
  return storage.status.draft || 'draft';
}

async function categoryMaps() {
  const rows = await q('SELECT category_id, slug FROM document_categories');
  return {
    idToSlug: new Map(rows.map((r) => [Number(r.category_id), r.slug])),
    slugToId: new Map(rows.map((r) => [r.slug, Number(r.category_id)]))
  };
}

const TYPE_TO_SLUG = {
  go: 'government-orders',
  notification: 'notifications',
  circular: 'circulars',
  act: 'acts',
  rule: 'rules',
  guideline: 'guidelines'
};
const TOPIC_TO_SLUG = { rti: 'rti', 'it-act': 'it-act-2000', posh: 'posh-act' };
const SLUG_TO_TYPE = Object.fromEntries(Object.entries(TYPE_TO_SLUG).map(([k, v]) => [v, k]));

function applyHooksOut(collection, item, row, extras, context) {
  switch (collection) {
    case 'documents': {
      const slug = context.categories?.idToSlug.get(Number(row.category_id)) || '';
      if (!item.type) item.type = SLUG_TO_TYPE[slug] || 'go';
      if (!item.date) item.date = row.doc_date ? String(row.doc_date).slice(0, 10) : '';
      break;
    }
    case 'events': {
      if (!item.district && row.district_id) {
        item.district = context.districtSlugs?.get(Number(row.district_id)) || '';
      }
      item.date = row.start_datetime ? String(row.start_datetime).slice(0, 10) : item.date || '';
      item.endDate = row.end_datetime ? String(row.end_datetime).slice(0, 10) : item.endDate || '';
      break;
    }
    case 'scienceStories': {
      const seconds = Number(row.duration_sec);
      if (Number.isFinite(seconds) && seconds > 0) {
        item.duration = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
      }
      item.date = row.publish_date ? String(row.publish_date).slice(0, 10) : item.date || '';
      break;
    }
    case 'pages': {
      item.path = pagePath(item.id);
      if (!Array.isArray(item.sections) || !item.sections.length) {
        item.sections = row.body_en
          ? [{ heading: { en: '', te: '' }, body: [{ en: row.body_en, te: row.body_te || '' }] }]
          : [];
      }
      break;
    }
    default:
      break;
  }
  return item;
}

function toItem(collection, storage, row, extra, mediaPaths, context) {
  const item = { ...(extra?.data || {}) };
  for (const [field, spec] of Object.entries(storage.map || {})) {
    if (spec.bi) {
      item[field] = { en: row[spec.bi[0]] ?? '', te: row[spec.bi[1]] ?? '' };
    } else if (spec.col) {
      const value = row[spec.col];
      if (spec.col === 'duration_sec') {
        item[field] = value; // converted by the hook
      } else if (/_date$|_datetime$/.test(spec.col)) {
        item[field] = value ? String(value).slice(0, 10) : '';
      } else {
        item[field] = value ?? '';
      }
    } else if (spec.file) {
      item[field] = extra?.data?.[field] || mediaPaths.get(Number(row[spec.file])) || '';
    } else if (spec.key) {
      item[field] = row[spec.key] ?? '';
    }
  }
  item.id = String(row[storage.keyColumn]);
  item._status = statusOut(storage, row);
  item._order = storage.order ? Number(row[storage.order] || 0) : 0;
  item._updatedAt = extra?.updatedAt || row.updated_at || row.created_at || null;
  return applyHooksOut(collection, item, row, extra?.data, context);
}

async function contextFor(collection) {
  if (collection === 'documents') return { categories: await categoryMaps() };
  if (collection === 'events') {
    const rows = await q('SELECT district_id, slug FROM districts');
    return { districtSlugs: new Map(rows.map((r) => [Number(r.district_id), r.slug])) };
  }
  return {};
}

async function rowByKey(storage, key) {
  const column = storage.keyColumn;
  let value = key;
  if (column === storage.pk) {
    if (!/^\d+$/.test(String(key))) return null;
    value = Number(key);
  }
  return one(`SELECT * FROM ${ident(storage.table)} WHERE ${ident(column)} = ? LIMIT 1`, [value]);
}

// ---------------------------------------------------------------------------
// Public reads
// ---------------------------------------------------------------------------
async function listBlocks(collection, includeDrafts) {
  const rows = await q(
    `SELECT item_key, data, status, sort_order, updated_at FROM cms_blocks
     WHERE collection = ? ${includeDrafts ? '' : "AND status = 'published'"}
     ORDER BY sort_order ASC, block_id ASC`,
    [collection]
  );
  return rows.map((row) => ({
    ...parseJson(row.data),
    id: row.item_key,
    _status: row.status,
    _order: Number(row.sort_order || 0),
    _updatedAt: row.updated_at
  }));
}

async function listAwards(includeDrafts) {
  const rows = await q('SELECT * FROM awards ORDER BY award_year DESC, award_id ASC');
  const extras = await loadExtras('awards');
  const byYear = new Map();
  for (const row of rows) {
    if (!includeDrafts && row.status !== 'published') continue;
    const year = Number(row.award_year);
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year).push(row);
  }
  const out = [];
  for (const [year, yearRows] of byYear) {
    const extra = extras.get(year);
    out.push({
      id: String(year),
      year,
      title: extra?.data?.title || { en: `Awards ${year}`, te: '' },
      awards: yearRows.map((row) => ({
        name: { en: row.title_en || '', te: row.title_te || '' },
        recipient: row.recipient_en || '',
        field: row.description_en || ''
      })),
      _status: yearRows[0].status === 'published' ? 'published' : 'draft',
      _order: 0,
      _updatedAt: extra?.updatedAt || null
    });
  }
  return out;
}

async function list(collectionName, { includeDrafts = false } = {}) {
  const schema = getCollection(collectionName);
  if (!schema) throw new ApiError(404, 'Unknown section.');
  const storage = schema.storage;
  if (storage.kind === 'block') return listBlocks(collectionName, includeDrafts);
  if (storage.kind === 'custom' && storage.handler === 'awards') return listAwards(includeDrafts);

  const parts = [];
  const params = [];
  for (const [column, value] of Object.entries(storage.where || {})) {
    parts.push(`${ident(column)} = ?`);
    params.push(value);
  }
  if (!includeDrafts && storage.status) {
    if (storage.status.kind === 'active') {
      parts.push(`${ident(storage.status.column)} = 1`);
    } else if (Array.isArray(storage.status.published)) {
      parts.push(`${ident(storage.status.column)} IN (${storage.status.published.map(() => '?').join(',')})`);
      params.push(...storage.status.published);
    } else {
      parts.push(`${ident(storage.status.column)} = ?`);
      params.push(storage.status.published);
    }
  }
  const where = parts.length ? `WHERE ${parts.join(' AND ')}` : '';
  const order = storage.order ? `${ident(storage.order)} ASC, ${ident(storage.pk)} ASC` : `${ident(storage.pk)} ASC`;
  const rows = await q(`SELECT * FROM ${ident(storage.table)} ${where} ORDER BY ${order}`, params);
  const extraMap = await loadExtras(collectionName, rows.map((row) => row[storage.pk]));
  const mediaPaths = await mediaPathsFor(storage, rows);
  const context = await contextFor(collectionName);
  return rows.map((row) => toItem(collectionName, storage, row, extraMap.get(Number(row[storage.pk])), mediaPaths, context));
}

async function get(collectionName, key) {
  const schema = getCollection(collectionName);
  if (!schema) throw new ApiError(404, 'Unknown section.');
  const storage = schema.storage;
  if (storage.kind === 'block') {
    const row = await one('SELECT item_key, data, status, sort_order, updated_at FROM cms_blocks WHERE collection = ? AND item_key = ?', [
      collectionName,
      String(key)
    ]);
    if (!row) return null;
    return {
      ...parseJson(row.data),
      id: row.item_key,
      _status: row.status,
      _order: Number(row.sort_order || 0),
      _updatedAt: row.updated_at
    };
  }
  if (storage.kind === 'custom' && storage.handler === 'awards') {
    const year = Number(key);
    const rows = await q('SELECT * FROM awards WHERE award_year = ? ORDER BY award_id', [year]);
    if (!rows.length) return null;
    const extras = await loadExtras('awards', [year]);
    return {
      id: String(year),
      year,
      title: extras.get(year)?.data?.title || { en: `Awards ${year}`, te: '' },
      awards: rows.map((row) => ({
        name: { en: row.title_en || '', te: row.title_te || '' },
        recipient: row.recipient_en || '',
        field: row.description_en || ''
      })),
      _status: rows[0].status === 'published' ? 'published' : 'draft',
      _order: 0,
      _updatedAt: extras.get(year)?.updatedAt || null
    };
  }

  const row = await rowByKey(storage, key);
  if (!row) return null;
  const extras = await loadExtras(collectionName, [row[storage.pk]]);
  const mediaPaths = await mediaPathsFor(storage, [row]);
  const context = await contextFor(collectionName);
  return toItem(collectionName, storage, row, extras.get(Number(row[storage.pk])), mediaPaths, context);
}

// ---------------------------------------------------------------------------
// Write helpers
// ---------------------------------------------------------------------------
function splitValues(collection, storage, data) {
  const values = { ...(storage.fixed || {}) };
  const extras = {};
  const handled = new Set();
  for (const [field, spec] of Object.entries(storage.map || {})) {
    handled.add(field);
    if (spec.bi) {
      const value = data[field] && typeof data[field] === 'object' ? data[field] : { en: data[field] || '', te: '' };
      values[spec.bi[0]] = String(value.en ?? '') || null;
      values[spec.bi[1]] = String(value.te ?? '') || null;
    } else if (spec.col) {
      let value = data[field];
      if (spec.col === 'duration_sec') {
        const m = String(value || '').match(/^(\d{1,3}):([0-5]\d)$/);
        value = m ? Number(m[1]) * 60 + Number(m[2]) : Number(value) || null;
      }
      values[spec.col] = columnValue(spec.col, value);
    } else if (spec.file) {
      values[spec.file] = null; // filled by the caller after resolving the upload
      extras[field] = data[field] || '';
    } else if (spec.key) {
      values[spec.key] = data[field];
    }
  }
  for (const [field, value] of Object.entries(data || {})) {
    if (!handled.has(field)) extras[field] = value;
  }
  return { values, extras };
}

async function applyHooksIn(collection, values, extras, data) {
  switch (collection) {
    case 'documents': {
      const maps = await categoryMaps();
      const slug = TOPIC_TO_SLUG[data.topic] || TYPE_TO_SLUG[data.type] || 'government-orders';
      values.category_id = maps.slugToId.get(slug) || maps.slugToId.get('government-orders') || null;
      break;
    }
    case 'events': {
      const district = String(data.district || '').trim();
      if (district) {
        const row = await one('SELECT district_id FROM districts WHERE slug = ?', [district]);
        values.district_id = row ? row.district_id : null;
      } else {
        values.district_id = null;
      }
      break;
    }
    case 'pages': {
      const sections = Array.isArray(data.sections) ? data.sections : [];
      const plain = (lang) =>
        sections
          .flatMap((section) => (Array.isArray(section.body) ? section.body : []))
          .map((line) => String(line?.[lang] || '').trim())
          .filter(Boolean)
          .join('\n\n');
      values.body_en = plain('en') || null;
      values.body_te = plain('te') || null;
      break;
    }
    default:
      break;
  }
  return { values, extras };
}

async function resolveFiles(storage, values, data) {
  for (const [field, spec] of Object.entries(storage.map || {})) {
    if (!spec.file) continue;
    values[spec.file] = await resolveFileId(data[field]);
  }
  return values;
}

async function writeBlocks(collectionName, key, data, { status, order, userId, existing }) {
  const itemKey = key || data.id || newKey(collectionName);
  const payload = stripInternal(data);
  if (existing) {
    await q(
      'UPDATE cms_blocks SET item_key = ?, data = ?, status = ?, sort_order = ?, updated_by = ? WHERE collection = ? AND item_key = ?',
      [itemKey, JSON.stringify(payload), status, order, userId, collectionName, existing.id]
    );
  } else {
    await q(
      'INSERT INTO cms_blocks (collection, item_key, data, status, sort_order, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [collectionName, itemKey, JSON.stringify(payload), status, order, userId, userId]
    );
  }
  return itemKey;
}

async function createCollection(collectionName, data, { status = 'draft', order = 0, userId = null } = {}) {
  const schema = getCollection(collectionName);
  if (!schema) throw new ApiError(404, 'Unknown section.');
  const storage = schema.storage;

  if (storage.kind === 'block') {
    const key = await writeBlocks(collectionName, data.id, data, { status, order, userId, existing: null });
    bumpVersion();
    return get(collectionName, key);
  }

  if (storage.kind === 'custom' && storage.handler === 'awards') {
    return createAwards(data, { status, userId });
  }

  const { values, extras } = splitValues(collectionName, storage, data);
  await applyHooksIn(collectionName, values, extras, data);
  await resolveFiles(storage, values, data);
  if (storage.status) values[storage.status.column] = statusIn(storage, status);
  if (storage.order) values[storage.order] = orderValue(storage, order);

  // Identity column: a CMS key field (slug/audience) or the table's own pk.
  let keyValue = null;
  if (schema.keyField) {
    keyValue = values[storage.keyColumn] ?? data[schema.keyField];
    values[storage.keyColumn] = keyValue;
  } else if (storage.keyColumn === 'slug') {
    // Events are created from their title; a unique slug is generated for them.
    const base = slugify(values.title_en || data.title?.en || data.name?.en);
    values.slug = `${base}-${crypto.randomBytes(3).toString('hex')}`;
  }
  const columns = Object.keys(values);
  const result = await q(
    `INSERT INTO ${ident(storage.table)} (${columns.map(ident).join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
    columns.map((column) => values[column] ?? null)
  );
  // Extras are always keyed by the numeric primary key, even when the CMS
  // item is addressed by a slug (pages, organisations, policies...).
  const recordId = result.insertId;
  if (Object.keys(extras).length) await saveExtras(collectionName, Number(recordId), extras);
  bumpVersion();
  return get(collectionName, keyValue || recordId);
}

async function updateCollection(collectionName, key, data, { status, order, userId, newKey: renamed }) {
  const schema = getCollection(collectionName);
  if (!schema) throw new ApiError(404, 'Unknown section.');
  const storage = schema.storage;

  if (storage.kind === 'block') {
    const existing = await get(collectionName, key);
    if (!existing) throw new ApiError(404, 'Item not found.');
    const nextKey = await writeBlocks(collectionName, renamed || key, data, { status, order, userId, existing });
    bumpVersion();
    return get(collectionName, nextKey);
  }

  if (storage.kind === 'custom' && storage.handler === 'awards') {
    return updateAwards(key, data, { status, userId });
  }

  const row = await rowByKey(storage, key);
  if (!row) throw new ApiError(404, 'Item not found.');
  if (renamed && String(renamed) !== String(key)) {
    const clash = await rowByKey(storage, renamed);
    if (clash) throw new ApiError(409, 'An item with this identifier already exists.');
  }
  const { values, extras } = splitValues(collectionName, storage, data);
  await applyHooksIn(collectionName, values, extras, data);
  await resolveFiles(storage, values, data);
  if (storage.status) values[storage.status.column] = statusIn(storage, status);
  if (storage.order) values[storage.order] = orderValue(storage, order);
  if (renamed && schema.keyField) values[storage.keyColumn] = renamed;

  const columns = Object.keys(values);
  await q(
    `UPDATE ${ident(storage.table)} SET ${columns.map((c) => `${ident(c)} = ?`).join(', ')} WHERE ${ident(storage.pk)} = ?`,
    [...columns.map((c) => values[c] ?? null), row[storage.pk]]
  );
  await saveExtras(collectionName, Number(row[storage.pk]), extras);
  bumpVersion();
  return get(collectionName, renamed || key);
}

async function deleteCollection(collectionName, key) {
  const schema = getCollection(collectionName);
  if (!schema) throw new ApiError(404, 'Unknown section.');
  const storage = schema.storage;
  if (storage.kind === 'block') {
    const result = await q('DELETE FROM cms_blocks WHERE collection = ? AND item_key = ?', [collectionName, String(key)]);
    if (!result.affectedRows) throw new ApiError(404, 'Item not found.');
    bumpVersion();
    return true;
  }
  if (storage.kind === 'custom' && storage.handler === 'awards') {
    const year = Number(key);
    const result = await q('DELETE FROM awards WHERE award_year = ?', [year]);
    await deleteExtras('awards', year);
    if (!result.affectedRows) throw new ApiError(404, 'Item not found.');
    bumpVersion();
    return true;
  }
  const row = await rowByKey(storage, key);
  if (!row) throw new ApiError(404, 'Item not found.');
  await q(`DELETE FROM ${ident(storage.table)} WHERE ${ident(storage.pk)} = ?`, [row[storage.pk]]);
  await deleteExtras(collectionName, Number(row[storage.pk]));
  bumpVersion();
  return true;
}

// ---------------------------------------------------------------------------
// Awards (one row per award, grouped by year for the CMS)
// ---------------------------------------------------------------------------
async function createAwards(data, { status }) {
  const year = Number(data.year);
  if (!Number.isFinite(year)) throw new ApiError(400, 'Award year is required.');
  const existing = await q('SELECT award_id FROM awards WHERE award_year = ?', [year]);
  if (existing.length) throw new ApiError(409, 'Awards for this year already exist.');
  const rowStatus = status === 'published' ? 'published' : 'draft';
  const awards = Array.isArray(data.awards) ? data.awards : [];
  if (!awards.length) {
    await q(
      'INSERT INTO awards (award_year, title_en, title_te, description_en, description_te, status) VALUES (?, ?, ?, ?, ?, ?)',
      [year, data.title?.en || `Awards ${year}`, data.title?.te || null, null, null, rowStatus]
    );
  } else {
    for (const award of awards.slice(0, 100)) {
      await q(
        `INSERT INTO awards (award_year, title_en, title_te, recipient_en, recipient_te, description_en, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          year,
          award.name?.en || '',
          award.name?.te || null,
          award.recipient || null,
          null,
          award.field || null,
          rowStatus
        ]
      );
    }
  }
  await saveExtras('awards', year, { title: data.title || { en: `Awards ${year}`, te: '' } });
  bumpVersion();
  return get('awards', year);
}

async function updateAwards(key, data, { status }) {
  const oldYear = Number(key);
  const year = Number(data.year || key);
  if (!Number.isFinite(year)) throw new ApiError(400, 'Award year is required.');
  if (year !== oldYear) {
    const clash = await q('SELECT award_id FROM awards WHERE award_year = ?', [year]);
    if (clash.length) throw new ApiError(409, 'Awards for this year already exist.');
  }
  const rowStatus = status === 'published' ? 'published' : 'draft';
  const awards = Array.isArray(data.awards) ? data.awards : [];
  await q('DELETE FROM awards WHERE award_year = ?', [oldYear]);
  if (!awards.length) {
    await q(
      'INSERT INTO awards (award_year, title_en, title_te, description_en, status) VALUES (?, ?, ?, ?, ?)',
      [year, data.title?.en || `Awards ${year}`, data.title?.te || null, null, rowStatus]
    );
  } else {
    for (const award of awards.slice(0, 100)) {
      await q(
        `INSERT INTO awards (award_year, title_en, title_te, recipient_en, description_en, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [year, award.name?.en || '', award.name?.te || null, award.recipient || null, award.field || null, rowStatus]
      );
    }
  }
  if (year !== oldYear) await deleteExtras('awards', oldYear);
  await saveExtras('awards', year, { title: data.title || { en: `Awards ${year}`, te: '' } });
  bumpVersion();
  return get('awards', year);
}

// ---------------------------------------------------------------------------
// Dashboard counts, backup / restore, public bundle
// ---------------------------------------------------------------------------
async function counts() {
  const out = {};
  for (const [name, schema] of Object.entries(collections)) {
    const storage = schema.storage;
    if (storage.kind === 'block') {
      const row = await one(
        `SELECT COUNT(*) AS total, SUM(status <> 'published') AS drafts FROM cms_blocks WHERE collection = ?`,
        [name]
      );
      out[name] = { total: Number(row?.total || 0), drafts: Number(row?.drafts || 0) };
    } else if (storage.kind === 'custom') {
      const row = await one(
        `SELECT COUNT(DISTINCT award_year) AS total, COUNT(DISTINCT CASE WHEN status <> 'published' THEN award_year END) AS drafts FROM awards`
      );
      out[name] = { total: Number(row?.total || 0), drafts: Number(row?.drafts || 0) };
    } else {
      const where = Object.entries(storage.where || {})
        .map(([column]) => `${ident(column)} = ?`)
        .join(' AND ');
      const params = Object.values(storage.where || {});
      const whereSql = where ? `WHERE ${where}` : '';
      let draftSql = '0';
      if (storage.status?.kind === 'active') draftSql = `SUM(${ident(storage.status.column)} = 0)`;
      else if (storage.status) draftSql = `SUM(${ident(storage.status.column)} <> ?)`;
      const paramsDraft = storage.status && storage.status.kind !== 'active' ? [storage.status.published] : [];
      const row = await one(
        `SELECT COUNT(*) AS total, ${draftSql} AS drafts FROM ${ident(storage.table)} ${whereSql}`,
        [...paramsDraft, ...params]
      );
      out[name] = { total: Number(row?.total || 0), drafts: Number(row?.drafts || 0) };
    }
  }
  return out;
}

async function dump() {
  const items = [];
  for (const name of Object.keys(collections)) {
    const listItems = await list(name, { includeDrafts: true });
    for (const item of listItems) {
      items.push({
        collection: name,
        item_key: item.id,
        status: item._status,
        sort_order: item._order,
        data: stripInternal({ ...item, id: undefined })
      });
    }
  }
  const allSettings = await settingsRepository.all();
  for (const [name, value] of Object.entries(allSettings)) {
    items.push({ collection: '_settings', item_key: name, status: 'published', sort_order: 0, data: value });
  }
  return { format: 'dsti-content-backup', version: 2, exportedAt: new Date().toISOString(), items };
}

async function restore(items) {
  let restored = 0;
  const warnings = [];
  for (const item of items || []) {
    try {
      if (item.collection === '_settings') {
        await settingsRepository.put(item.item_key, item.data);
        restored += 1;
        continue;
      }
      const schema = getCollection(item.collection);
      if (!schema) {
        warnings.push(`Unknown section: ${String(item.collection).slice(0, 40)}`);
        continue;
      }
      const wantedStatus = item.status === 'draft' ? 'draft' : 'published';
      const existing = await get(item.collection, item.item_key);
      if (schema.storage.kind === 'block' || schema.storage.kind === 'custom') {
        if (existing) {
          await updateCollection(item.collection, item.item_key, item.data, {
            status: wantedStatus,
            order: item.sort_order,
            newKey: item.item_key
          });
        } else {
          await createCollection(item.collection, { ...item.data, id: item.item_key }, { status: wantedStatus, order: item.sort_order });
        }
      } else {
        const keyField = schema.keyField;
        const payload = { ...item.data };
        if (keyField) payload[keyField] = item.item_key;
        if (item.collection === 'awards') payload.year = Number(item.item_key);
        if (existing) {
          await updateCollection(item.collection, item.item_key, payload, { status: wantedStatus, order: item.sort_order });
        } else {
          await createCollection(item.collection, payload, { status: wantedStatus, order: item.sort_order });
        }
      }
      restored += 1;
    } catch (err) {
      warnings.push(`${item.collection}/${item.item_key}: ${err.message}`);
    }
  }
  bumpVersion();
  return { restored, warnings: warnings.slice(0, 20) };
}

let cache = null;
let version = 0;

function bumpVersion() {
  version += 1;
  cache = null;
}

async function publicBundle() {
  if (cache) return cache;
  const startVersion = version;
  const out = { collections: {}, settings: {} };
  for (const name of Object.keys(collections)) {
    out.collections[name] = await list(name);
  }
  out.settings = await settingsRepository.publicSettings();
  const body = JSON.stringify(out);
  const etag = `"${crypto.createHash('sha1').update(body).digest('base64url')}"`;
  const built = { body, etag, data: out };
  if (startVersion === version) cache = built;
  return built;
}

module.exports = {
  list,
  get,
  createCollection,
  updateCollection,
  deleteCollection,
  counts,
  dump,
  restore,
  publicBundle,
  bumpVersion
};
