// src/middleware/rateLimiter.js — request throttling for public and auth routes.
const rateLimit = require('express-rate-limit');

function createRateLimiter({ windowMinutes = 15, max = 30, message = 'Too many requests. Please try again later.' } = {}) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    // Government sites usually sit behind a reverse proxy.
    validate: { xForwardedForHeader: false, trustProxy: false },
    handler: (req, res) => {
      if (String(req.originalUrl || '').split('?')[0].startsWith('/api/v1')) {
        return res.status(429).json({ success: false, error: { code: 'RATE_LIMITED', message } });
      }
      return res.status(429).json({ error: message });
    }
  });
}

const loginLimiter = createRateLimiter({ windowMinutes: 15, max: 10, message: 'Too many sign-in attempts. Please wait 15 minutes.' });
const captchaLimiter = createRateLimiter({ windowMinutes: 15, max: 60, message: 'Too many requests. Please try again shortly.' });
const feedbackLimiter = createRateLimiter({ windowMinutes: 30, max: 5, message: 'Too many feedback submissions. Please try again later.' });
const hitLimiter = createRateLimiter({ windowMinutes: 10, max: 150, message: 'Too many requests.' });
const assistantLimiter = createRateLimiter({ windowMinutes: 10, max: 30, message: 'Too many questions. Please try again later.' });
const trackLimiter = createRateLimiter({ windowMinutes: 10, max: 300, message: 'Too many requests.' });

module.exports = {
  createRateLimiter,
  loginLimiter,
  captchaLimiter,
  feedbackLimiter,
  hitLimiter,
  assistantLimiter,
  trackLimiter
};
