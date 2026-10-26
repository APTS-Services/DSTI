// src/repositories/settingsRepository.js — site_settings key/value JSON store.
const { q } = require('../config/db');
const { settings } = require('../content/settings');

async function get(name) {
  const rows = await q('SELECT setting_value FROM site_settings WHERE setting_key = ?', [name]);
  if (!rows[0]) return {};
  try {
    return JSON.parse(rows[0].setting_value) || {};
  } catch {
    return {};
  }
}

async function all() {
  const rows = await q('SELECT setting_key, setting_value FROM site_settings');
  const out = {};
  for (const row of rows) {
    try {
      out[row.setting_key] = JSON.parse(row.setting_value);
    } catch {
      out[row.setting_key] = {};
    }
  }
  return out;
}

async function put(name, value) {
  await q(
    `INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [name, JSON.stringify(value ?? {})]
  );
}

/** Settings exposed in /api/public/content (private groups omitted). */
async function publicSettings() {
  const values = await all();
  const out = {};
  for (const [name, value] of Object.entries(values)) {
    if (settings[name]?.private) continue;
    out[name] = value;
  }
  return out;
}

module.exports = { get, all, put, publicSettings };
