// src/utils/audit.js — writes an entry to audit_log for every CMS change.
const { q } = require('../config/db');
const logger = require('./logger');

/**
 * Records an audit entry. Never throws: auditing must not break a request
 * that already succeeded.
 *
 * @param {object} user    req.user ({ id, username }) or null
 * @param {string} action  e.g. CREATE / UPDATE / DELETE / PUBLISH / LOGIN
 * @param {string} target  short description (collection/key or table/id)
 * @param {*}      details optional extra information
 * @param {string} ip      caller address
 */
async function record(user, action, target = '', details = '', ip = '') {
  try {
    await q(
      'INSERT INTO audit_log (user_id, username, action, target, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
      [
        user?.id || null,
        String(user?.username || '').slice(0, 60),
        String(action || 'update').slice(0, 60),
        String(target || '').slice(0, 160),
        JSON.stringify(details ?? ''),
        String(ip || '').slice(0, 45)
      ]
    );
  } catch (err) {
    logger.error(`[audit] ${err.message}`);
  }
}

module.exports = { record };
