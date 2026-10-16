// Request throttling to resist brute force, spam and scraping.
import rateLimit from 'express-rate-limit';
import env from '../config/env.js';

const make = (windowMs, limit, message) => rateLimit({
  windowMs,
  limit: env.isTest ? 10000 : limit,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: message },
});

export const apiLimiter = make(60 * 1000, 300, 'Too many requests. Please slow down.');
export const loginLimiter = make(15 * 60 * 1000, 20, 'Too many sign-in attempts. Please try again later.');
export const feedbackLimiter = make(60 * 60 * 1000, 10, 'Too many submissions. Please try again later.');
export const captchaLimiter = make(60 * 1000, 30, 'Too many requests. Please slow down.');
export const hitLimiter = make(60 * 1000, 60, 'Too many requests.');
