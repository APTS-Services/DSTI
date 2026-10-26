// src/routes/admin.js — /api/admin (CMS, cookie session + CSRF).
const express = require('express');
const controller = require('../controllers/adminController');
const { requireAuth, requireCsrf, requireRole } = require('../middleware/auth');
const { singleFile } = require('../middleware/upload');

const router = express.Router();

router.use(requireAuth, requireCsrf);

const anyRole = requireRole('Administrator', 'Publisher', 'Editor', 'Viewer');
const writer = requireRole('Administrator', 'Publisher', 'Editor');
const publisher = requireRole('Administrator', 'Publisher');
const admin = requireRole('Administrator');

router.get('/schemas', anyRole, controller.schemas);
router.get('/dashboard', anyRole, controller.dashboard);
router.get('/analytics', anyRole, controller.analytics);

// Collections
router.get('/content/:collection', anyRole, controller.listContent);
router.get('/content/:collection/:key', anyRole, controller.getContent);
router.post('/content/:collection', writer, controller.createContent);
router.put('/content/:collection/:key', writer, controller.updateContent);
router.delete('/content/:collection/:key', publisher, controller.deleteContent);

// Settings
router.get('/settings/:name', publisher, controller.getSettings);
router.put('/settings/:name', publisher, controller.saveSettings);

// Media library
router.post('/uploads', writer, singleFile('file'), controller.uploadFile);
router.get('/uploads', anyRole, controller.listUploads);
router.delete('/uploads/:id', publisher, controller.deleteUpload);

// Feedback inbox
router.get('/feedback', requireRole('Administrator', 'Publisher', 'Viewer'), controller.listFeedback);
router.patch('/feedback/:id', publisher, controller.updateFeedback);
router.delete('/feedback/:id', admin, controller.deleteFeedback);

// Users
router.get('/users', admin, controller.listUsers);
router.post('/users', admin, controller.createUser);
router.put('/users/:id', admin, controller.updateUser);
router.delete('/users/:id', admin, controller.deleteUser);

// Audit log
router.get('/audit', admin, controller.auditLog);

// Backup & restore
router.get('/backup', admin, controller.backup);
router.post('/restore', admin, express.json({ limit: '20mb' }), controller.restore);

module.exports = router;
