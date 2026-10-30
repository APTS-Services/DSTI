// src/routes/v1/admin.js — authenticated REST API.
const express = require('express');
const c = require('../../controllers/apiAdminController');
const authController = require('../../controllers/authController');
const { loadSession, requireAuth, requireRoleKey } = require('../../middleware/auth');
const { loginLimiter } = require('../../middleware/rateLimiter');
const { singleFile } = require('../../middleware/upload');
const { sendError } = require('../../utils/http');

const router = express.Router();

/** Bearer tokens are not sent by browsers cross-site, so CSRF only applies to cookie sessions. */
function csrfIfSession(req, res, next) {
  if (req.authType !== 'session') return next();
  const token = req.get('x-csrf-token');
  if (!token || token !== req.user?.csrf) {
    return sendError(res, 403, 'FORBIDDEN', 'Security token missing or invalid.');
  }
  return next();
}

const reader = requireRoleKey('admin', 'approver', 'editor', 'viewer');
const writer = requireRoleKey('admin', 'approver', 'editor');
const publisher = requireRoleKey('admin', 'approver');
const adminOnly = requireRoleKey('admin');

router.use(loadSession);

// Auth
router.post('/auth/login', loginLimiter, authController.apiLogin);
router.post('/auth/logout', requireAuth, authController.apiLogout);
router.post('/auth/refresh', requireAuth, authController.apiRefresh);
router.post('/auth/change-password', requireAuth, authController.apiChangePassword);
router.post('/auth/forgot-password', loginLimiter, authController.forgotPassword);

router.get('/me', requireAuth, c.me);

// Users
router.get('/roles', requireAuth, adminOnly, c.roles);
router.get('/users', requireAuth, adminOnly, c.listUsers);
router.post('/users', requireAuth, adminOnly, csrfIfSession, c.createUser);
router.get('/users/:id', requireAuth, adminOnly, c.getUser);
router.put('/users/:id', requireAuth, adminOnly, csrfIfSession, c.updateUser);
router.patch('/users/:id/status', requireAuth, adminOnly, csrfIfSession, c.setUserStatus);
router.delete('/users/:id', requireAuth, adminOnly, csrfIfSession, c.deleteUser);

// Media
router.post('/media/upload', requireAuth, writer, csrfIfSession, singleFile('file'), c.uploadMedia);
router.get('/media', requireAuth, reader, c.listMedia);
router.put('/media/:id', requireAuth, writer, csrfIfSession, c.updateMedia);
router.delete('/media/:id', requireAuth, publisher, csrfIfSession, c.deleteMedia);

// Feedback inbox
router.get('/feedback/export', requireAuth, adminOnly, c.exportFeedback);
router.get('/feedback', requireAuth, requireRoleKey('admin', 'approver', 'viewer'), c.listFeedback);
router.get('/feedback/:id', requireAuth, requireRoleKey('admin', 'approver', 'viewer'), c.getFeedback);
router.patch('/feedback/:id/status', requireAuth, publisher, csrfIfSession, c.setFeedbackStatus);

// Analytics
router.get('/stats/summary', requireAuth, reader, c.statsSummary);
router.get('/stats/daily', requireAuth, reader, c.statsDaily);
router.get('/stats/top-pages', requireAuth, reader, c.statsTopPages);
router.get('/stats/devices', requireAuth, reader, c.statsDevices);
router.get('/stats/downloads', requireAuth, reader, c.statsDownloads);
router.get('/assistant/logs', requireAuth, requireRoleKey('admin', 'approver'), c.assistantLogs);

// Settings, audit, maintenance
router.get('/settings', requireAuth, adminOnly, c.getSettings);
router.put('/settings', requireAuth, adminOnly, csrfIfSession, c.saveSettings);
router.get('/audit-log', requireAuth, adminOnly, c.auditLog);
router.post('/search/reindex', requireAuth, adminOnly, csrfIfSession, c.reindex);
router.post('/backup', requireAuth, adminOnly, csrfIfSession, c.createBackup);
router.get('/backup', requireAuth, adminOnly, c.listBackups);
router.post('/backup/:id/restore', requireAuth, adminOnly, csrfIfSession, c.restoreBackup);

// Graph and bulk import
router.get('/connections', requireAuth, reader, c.getConnections);
router.post('/connections/bulk', requireAuth, publisher, csrfIfSession, c.bulkConnections);
router.post('/district-institutions/import', requireAuth, writer, csrfIfSession, c.importInstitutions);

// Tender specials
router.patch('/tenders/:id/close', requireAuth, publisher, csrfIfSession, c.closeTender);
router.post('/tenders/:id/corrigendum', requireAuth, publisher, csrfIfSession, c.corrigendum);

// Generic content resources
router.put('/:resource/reorder', requireAuth, publisher, csrfIfSession, c.reorderResource);
router.get('/:resource', requireAuth, reader, c.listResource);
router.get('/:resource/:id', requireAuth, reader, c.getResource);
router.post('/:resource', requireAuth, writer, csrfIfSession, c.createResource);
router.put('/:resource/:id', requireAuth, writer, csrfIfSession, c.updateResource);
router.delete('/:resource/:id', requireAuth, publisher, csrfIfSession, c.deleteResource);
router.patch('/:resource/:id/status', requireAuth, publisher, csrfIfSession, c.setResourceStatus);
router.post('/:resource/:id/submit', requireAuth, writer, csrfIfSession, c.submitResource);

module.exports = router;
