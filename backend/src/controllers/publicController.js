// src/controllers/publicController.js — /api/public (the React site contract).
const contentRepository = require('../repositories/contentRepository');
const publicService = require('../services/publicService');
const feedbackService = require('../services/feedbackService');
const analyticsService = require('../services/analyticsService');
const { asyncHandler } = require('../utils/http');

/** All published content in one ETag-revalidated response. */
const content = asyncHandler(async (req, res) => {
  const bundle = await contentRepository.publicBundle();
  res.setHeader('ETag', bundle.etag);
  res.setHeader('Cache-Control', 'no-cache');
  if (req.get('if-none-match') === bundle.etag) return res.status(304).end();
  res.type('application/json').send(bundle.body);
});

const feedback = asyncHandler(async (req, res) => {
  const result = await feedbackService.submit(req.body || {}, req);
  res.status(201).json({ ok: true, reference: result.reference });
});

/** Privacy-friendly hit counter — no cookie, no raw IP stored. */
const hit = asyncHandler(async (req, res) => {
  await analyticsService.trackView(req.body || {}, req);
  res.status(204).end();
});

const stats = asyncHandler(async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.json(await analyticsService.publicStats());
});

/** Published-row counts for the home page counters (always fresh). */
const counts = asyncHandler(async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.json(await publicService.counts());
});

module.exports = { content, feedback, hit, stats, counts };
