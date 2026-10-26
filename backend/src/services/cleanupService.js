// src/services/cleanupService.js — hourly housekeeping.
const authRepository = require('../repositories/authRepository');
const logger = require('../utils/logger');

let timer = null;

async function runCleanup() {
  try {
    await authRepository.cleanup();
  } catch (err) {
    logger.error(`[cleanup] ${err.message}`);
  }
}

function initCleanupJobs() {
  if (timer) return;
  runCleanup();
  timer = setInterval(runCleanup, 60 * 60 * 1000);
  if (typeof timer.unref === 'function') timer.unref();
}

module.exports = { initCleanupJobs, runCleanup };
