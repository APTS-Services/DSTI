// src/routes/auth.js — CMS sign-in (cookie session + CSRF).
const express = require('express');
const controller = require('../controllers/authController');
const { requireAuth, requireCsrf } = require('../middleware/auth');
const { captchaLimiter, loginLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/captcha', captchaLimiter, controller.captcha);
router.get('/key', controller.key);
router.post('/login', loginLimiter, controller.login);
// Logout changes state, so a signed-in browser must present its CSRF token
// (otherwise any page could sign an editor out).
router.post('/logout', (req, res, next) => (req.user ? requireCsrf(req, res, next) : next()), controller.logout);
router.get('/me', controller.me);
router.post('/change-password', requireAuth, requireCsrf, controller.changePassword);

module.exports = router;
