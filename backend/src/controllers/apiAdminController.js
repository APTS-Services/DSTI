// src/controllers/apiAdminController.js — authenticated /api/v1/admin endpoints.
const adminService = require('../services/adminService');
const mediaService = require('../services/mediaService');
const feedbackService = require('../services/feedbackService');
const searchService = require('../services/searchService');
const settingsService = require('../services/settingsService');
const backupService = require('../services/backupService');
const analyticsService = require('../services/analyticsService');
const authService = require('../services/authService');
const { asyncHandler, sendSuccess, sendCreated } = require('../utils/http');
const ApiError = require('../utils/ApiError');

/* ------------------------------ identity ------------------------------- */
const me = asyncHandler(async (req, res) => sendSuccess(res, await authService.apiMe(req)));

const listUsers = asyncHandler(async (req, res) => sendSuccess(res, await adminService.listUsers()));
const getUser = asyncHandler(async (req, res) => {
  const users = await adminService.listUsers();
  const user = users.find((row) => Number(row.id) === Number(req.params.id));
  if (!user) throw new ApiError(404, 'User not found.');
  sendSuccess(res, user);
});
const createUser = asyncHandler(async (req, res) =>
  sendCreated(res, await adminService.createUser(req.body || {}, req.user))
);
const updateUser = asyncHandler(async (req, res) =>
  sendSuccess(res, await adminService.updateUser(Number(req.params.id), req.body || {}, req.user))
);
const setUserStatus = asyncHandler(async (req, res) =>
  sendSuccess(res, await adminService.setUserStatus(Number(req.params.id), req.body?.is_active === true || req.body?.is_active === 1, req.user))
);
const deleteUser = asyncHandler(async (req, res) =>
  sendSuccess(res, await adminService.deleteUser(Number(req.params.id), req.user))
);
const roles = asyncHandler(async (req, res) => sendSuccess(res, await adminService.listRoles()));

/* ---------------------------- generic content -------------------------- */
const listResource = asyncHandler(async (req, res) => {
  const result = await adminService.list(req.params.resource, req.query);
  sendSuccess(res, result.data, result.meta);
});
const getResource = asyncHandler(async (req, res) =>
  sendSuccess(res, await adminService.get(req.params.resource, req.params.id))
);
const createResource = asyncHandler(async (req, res) =>
  sendCreated(res, await adminService.create(req.params.resource, req.body || {}, req.user, req))
);
const updateResource = asyncHandler(async (req, res) =>
  sendSuccess(res, await adminService.update(req.params.resource, req.params.id, req.body || {}, req.user, req))
);
const deleteResource = asyncHandler(async (req, res) =>
  sendSuccess(res, await adminService.remove(req.params.resource, req.params.id, req.user, req))
);
const setResourceStatus = asyncHandler(async (req, res) =>
  sendSuccess(res, await adminService.setStatus(req.params.resource, req.params.id, req.body?.status, req.user, req))
);
const submitResource = asyncHandler(async (req, res) =>
  sendSuccess(res, await adminService.submit(req.params.resource, req.params.id, req.user, req))
);
const reorderResource = asyncHandler(async (req, res) =>
  sendSuccess(res, await adminService.reorder(req.params.resource, req.body, req.user))
);

const closeTender = asyncHandler(async (req, res) =>
  sendSuccess(res, await adminService.closeTender(Number(req.params.id), req.user, req))
);
const corrigendum = asyncHandler(async (req, res) =>
  sendSuccess(res, await adminService.attachCorrigendum(Number(req.params.id), Number(req.body?.file_id), req.user, req))
);
const getConnections = asyncHandler(async (req, res) =>
  sendSuccess(res, await adminService.connections(req.query.lang))
);
const bulkConnections = asyncHandler(async (req, res) =>
  sendSuccess(res, await adminService.saveConnections(req.body, req.user))
);
const importInstitutions = asyncHandler(async (req, res) =>
  sendSuccess(res, await adminService.importInstitutions(req.body, req.user))
);

/* -------------------------------- media -------------------------------- */
const uploadMedia = asyncHandler(async (req, res) => {
  const saved = await mediaService.saveFile(req.file, req.user, req);
  sendCreated(res, saved);
});
const listMedia = asyncHandler(async (req, res) => {
  const result = await mediaService.list(req.query);
  sendSuccess(res, result.rows, result.meta);
});
const updateMedia = asyncHandler(async (req, res) =>
  sendSuccess(res, await mediaService.updateAlt(Number(req.params.id), req.body || {}))
);
const deleteMedia = asyncHandler(async (req, res) =>
  sendSuccess(res, await mediaService.remove(Number(req.params.id), req.user, req))
);

/* ------------------------------- feedback ------------------------------ */
const listFeedback = asyncHandler(async (req, res) => {
  const result = await feedbackService.list(req.query);
  sendSuccess(res, result.rows, result.meta);
});
const getFeedback = asyncHandler(async (req, res) =>
  sendSuccess(res, await feedbackService.get(Number(req.params.id)))
);
const setFeedbackStatus = asyncHandler(async (req, res) =>
  sendSuccess(res, await feedbackService.setStatus(Number(req.params.id), req.body?.status, req.user))
);
const exportFeedback = asyncHandler(async (req, res) => {
  const csv = await feedbackService.exportCsv();
  res.setHeader('Content-Disposition', `attachment; filename="dsti-feedback-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.type('text/csv').send(csv);
});

/* ------------------------------- reports ------------------------------- */
const statsSummary = asyncHandler(async (req, res) => sendSuccess(res, await analyticsService.summary()));
const statsDaily = asyncHandler(async (req, res) => sendSuccess(res, await analyticsService.daily(req.query)));
const statsTopPages = asyncHandler(async (req, res) => sendSuccess(res, await analyticsService.topPages(req.query)));
const statsDevices = asyncHandler(async (req, res) => sendSuccess(res, await analyticsService.devices(req.query)));
const statsDownloads = asyncHandler(async (req, res) => sendSuccess(res, await analyticsService.topDownloads()));
const assistantLogs = asyncHandler(async (req, res) => {
  const result = await searchService.logs(req.query);
  sendSuccess(res, result.rows, result.meta);
});

/* ---------------------- settings, audit, maintenance -------------------- */
const getSettings = asyncHandler(async (req, res) => sendSuccess(res, await settingsService.all()));
const saveSettings = asyncHandler(async (req, res) =>
  sendSuccess(res, await settingsService.saveRaw(req.body || {}, req.user))
);
const auditLog = asyncHandler(async (req, res) => {
  const result = await adminService.auditLog(req.query);
  sendSuccess(res, result.data, result.meta);
});
const reindex = asyncHandler(async (req, res) => sendSuccess(res, adminService.reindex()));

const createBackup = asyncHandler(async (req, res) => sendCreated(res, await backupService.create(req.user)));
const listBackups = asyncHandler(async (req, res) => sendSuccess(res, await backupService.list()));
const restoreBackup = asyncHandler(async (req, res) =>
  sendSuccess(res, await backupService.restore(Number(req.params.id), req.user, req.body?.confirm))
);

module.exports = {
  me,
  listUsers,
  getUser,
  createUser,
  updateUser,
  setUserStatus,
  deleteUser,
  roles,
  listResource,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  setResourceStatus,
  submitResource,
  reorderResource,
  closeTender,
  corrigendum,
  getConnections,
  bulkConnections,
  importInstitutions,
  uploadMedia,
  listMedia,
  updateMedia,
  deleteMedia,
  listFeedback,
  getFeedback,
  setFeedbackStatus,
  exportFeedback,
  statsSummary,
  statsDaily,
  statsTopPages,
  statsDevices,
  statsDownloads,
  assistantLogs,
  getSettings,
  saveSettings,
  auditLog,
  reindex,
  createBackup,
  listBackups,
  restoreBackup
};
