// Audit trail of administrative actions.
import { query } from '../db/pool.js';

export async function audit(req, action, target = '', details = '') {
  try {
    await query('INSERT INTO audit_log (user_id, username, action, target, details, ip) VALUES (?, ?, ?, ?, ?, ?)', [
      req.user?.id || null,
      String(req.user?.username || req.auditUser || '').slice(0, 50),
      String(action).slice(0, 40),
      String(target).slice(0, 120),
      String(details).slice(0, 255),
      String(req.ip || '').slice(0, 64),
    ]);
  } catch (err) {
    console.error('audit log failed:', err.message);
  }
}
