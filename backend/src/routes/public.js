// src/routes/public.js — /api/public (public website).
const express = require('express');
const controller = require('../controllers/publicController');
const { feedbackLimiter, hitLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/content', controller.content);
router.post('/feedback', feedbackLimiter, controller.feedback);
router.post('/hit', hitLimiter, controller.hit);
router.get('/stats', controller.stats);
router.get('/counts', controller.counts);

module.exports = router;
