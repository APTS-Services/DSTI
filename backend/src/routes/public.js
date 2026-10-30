// src/routes/public.js — /api/public (public website).
const express = require('express');
const controller = require('../controllers/publicController');
const { feedbackLimiter, feedbackTrackLimiter, hitLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/content', controller.content);
router.post('/feedback', feedbackLimiter, controller.feedback);
router.get('/feedback/stats', controller.feedbackStats);
router.post('/feedback/track', feedbackTrackLimiter, controller.trackFeedback);
router.post('/hit', hitLimiter, controller.hit);
router.get('/stats', controller.stats);
router.get('/counts', controller.counts);

module.exports = router;
