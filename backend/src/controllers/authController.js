// src/controllers/authController.js — sign-in for the CMS and /api/v1.
const { asyncHandler, sendSuccess } = require('../utils/http');
const authService = require('../services/authService');

const captcha = (req, res) => res.json(authService.captcha());
const key = (req, res) => res.json(authService.publicKey());

const login = asyncHandler(async (req, res) => {
  const body = req.body || {};
  // The CMS change-password screen posts its encrypted current/new passwords
  // to this endpoint (it already has a session), so handle that here too.
  if (body.currentPassword && body.newPassword) {
    if (!req.user) return res.status(401).json({ error: 'Authentication required.' });
    if (req.authType === 'session' && req.get('x-csrf-token') !== req.user.csrf) {
      return res.status(403).json({ error: 'Security token missing or invalid.' });
    }
    const result = await authService.changePassword(req, res, {
      currentPassword: body.currentPassword,
      newPassword: body.newPassword
    });
    return res.json({ ok: true, csrf: result.csrf });
  }
  const { username, password, captchaId, captcha: answer } = body;
  const result = await authService.login({ username, password, captchaId, captcha: answer, req, res });
  return res.json(result);
});

const logout = asyncHandler(async (req, res) => {
  res.json(await authService.logout(req, res));
});

const me = (req, res) => res.json(authService.me(req));

const changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword(req, res, {
    currentPassword: req.body?.currentPassword,
    newPassword: req.body?.newPassword
  });
  res.json(result);
});

/* ------------------------------ /api/v1 ------------------------------- */

const apiLogin = asyncHandler(async (req, res) => {
  const result = await authService.apiLogin({ email: req.body?.email, password: req.body?.password, req });
  sendSuccess(res, result);
});

const apiLogout = asyncHandler(async (req, res) => {
  sendSuccess(res, await authService.apiLogout(req));
});

const apiRefresh = asyncHandler(async (req, res) => {
  sendSuccess(res, authService.apiRefresh(req));
});

const apiMe = asyncHandler(async (req, res) => {
  sendSuccess(res, await authService.apiMe(req));
});

const apiChangePassword = asyncHandler(async (req, res) => {
  const result = await authService.apiChangePassword(req, {
    currentPassword: req.body?.current_password ?? req.body?.currentPassword,
    newPassword: req.body?.new_password ?? req.body?.newPassword
  });
  sendSuccess(res, result);
});

const forgotPassword = asyncHandler(async (req, res) => {
  sendSuccess(res, await authService.forgotPassword({ email: req.body?.email }));
});

module.exports = {
  captcha,
  key,
  login,
  logout,
  me,
  changePassword,
  apiLogin,
  apiLogout,
  apiRefresh,
  apiMe,
  apiChangePassword,
  forgotPassword
};
