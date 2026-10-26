// src/controllers/adminController.js — /api/admin (the React CMS contract).
const contentService = require('../services/contentService');
const settingsService = require('../services/settingsService');
const mediaService = require('../services/mediaService');
const feedbackService = require('../services/feedbackService');
const analyticsService = require('../services/analyticsService');
const userService = require('../services/userService');
const auditRepository = require('../repositories/auditRepository');
const { asyncHandler } = require('../utils/http');

const schemas = asyncHandler(async (req, res) => {
  res.json(await contentService.schemas(req.user));
});

const dashboard = asyncHandler(async (req, res) => {
  res.json(await contentService.dashboard(req.user));
});

/* ----------------------------- collections ----------------------------- */

const listContent = asyncHandler(async (req, res) => {
  res.json({ items: await contentService.list(req.params.collection, { includeDrafts: true }) });
});

const getContent = asyncHandler(async (req, res) => {
  res.json({ item: await contentService.get(req.params.collection, req.params.key) });
});

const createContent = asyncHandler(async (req, res) => {
  const item = await contentService.create(req.params.collection, req, req.user);
  res.status(201).json({ item });
});

const updateContent = asyncHandler(async (req, res) => {
  res.json({ item: await contentService.update(req.params.collection, req.params.key, req, req.user) });
});

const deleteContent = asyncHandler(async (req, res) => {
  res.json(await contentService.remove(req.params.collection, req.params.key, req.user, req));
});

/* ------------------------------ settings ------------------------------- */

const getSettings = asyncHandler(async (req, res) => {
  res.json({ item: await settingsService.getForAdmin(req.params.name, req.user.role) });
});

const saveSettings = asyncHandler(async (req, res) => {
  res.json({ item: await settingsService.save(req.params.name, req.body || {}, req.user) });
});

/* ------------------------------- uploads ------------------------------- */

const uploadFile = asyncHandler(async (req, res) => {
  const saved = await mediaService.saveFile(req.file, req.user, req);
  res.status(201).json({ url: saved.url, name: saved.file_name, size: saved.size_bytes, mime: saved.mime_type });
});

const listUploads = asyncHandler(async (req, res) => {
  res.json({ items: await mediaService.listForAdmin() });
});

const deleteUpload = asyncHandler(async (req, res) => {
  await mediaService.remove(Number(req.params.id) || 0, req.user, req);
  res.json({ ok: true });
});

/* ------------------------------- feedback ------------------------------ */

const listFeedback = asyncHandler(async (req, res) => {
  res.json({ items: await feedbackService.listForAdmin() });
});

const updateFeedback = asyncHandler(async (req, res) => {
  res.json(await feedbackService.setStatus(Number(req.params.id), req.body?.status, req.user));
});

const deleteFeedback = asyncHandler(async (req, res) => {
  res.json(await feedbackService.remove(Number(req.params.id), req.user));
});

/* ------------------------------ analytics ------------------------------ */

const analytics = asyncHandler(async (req, res) => {
  res.json(await analyticsService.compatAnalytics());
});

/* -------------------------------- users -------------------------------- */

const listUsers = asyncHandler(async (req, res) => {
  res.json({ items: await userService.list() });
});

const createUser = asyncHandler(async (req, res) => {
  await userService.createAccount(req.body || {}, req.user, { encrypted: true, csrf: req.user.csrf });
  res.status(201).json({ ok: true });
});

const updateUser = asyncHandler(async (req, res) => {
  await userService.updateAccount(Number(req.params.id), req.body || {}, req.user, {
    encrypted: true,
    csrf: req.user.csrf
  });
  res.json({ ok: true });
});

const deleteUser = asyncHandler(async (req, res) => {
  res.json(await userService.remove(Number(req.params.id), req.user));
});

/* ---------------------------- audit / backup --------------------------- */

const auditLog = asyncHandler(async (req, res) => {
  const rows = await auditRepository.listForAdmin();
  res.json({
    items: rows.map((row) => ({
      ...row,
      details: row.details && typeof row.details === 'object' ? JSON.stringify(row.details) : row.details || ''
    }))
  });
});

const backup = asyncHandler(async (req, res) => {
  const data = await contentService.backup(req.user);
  res.setHeader('Content-Disposition', `attachment; filename="dsti-content-${new Date().toISOString().slice(0, 10)}.json"`);
  res.json(data);
});

const restore = asyncHandler(async (req, res) => {
  const result = await contentService.restore(req.body, req.user);
  res.json({ ok: true, restored: result.restored, warnings: result.warnings });
});

module.exports = {
  schemas,
  dashboard,
  listContent,
  getContent,
  createContent,
  updateContent,
  deleteContent,
  getSettings,
  saveSettings,
  uploadFile,
  listUploads,
  deleteUpload,
  listFeedback,
  updateFeedback,
  deleteFeedback,
  analytics,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  auditLog,
  backup,
  restore
};
