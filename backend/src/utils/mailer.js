// src/utils/mailer.js — outbound e-mail for feedback notifications.
//
// SMTP credentials are optional. When they are not configured the message is
// written to the application log and sendMail() returns false, so callers can
// leave feedback.notified_at empty.
const nodemailer = require('nodemailer');
const logger = require('./logger');

let transporter = null;
let transporterKey = '';

function getTransporter() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;

  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  const key = `${host}|${port}|${user}`;
  if (transporter && transporterKey === key) return transporter;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: user ? { user, pass } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000
  });
  transporterKey = key;
  return transporter;
}

async function sendMail({ to, subject, text, html }) {
  if (!to) return false;
  const relay = getTransporter();
  const from = process.env.SMTP_FROM || 'no-reply@dsti.ap.gov.in';

  if (!relay) {
    logger.info(`[mailer] SMTP not configured — would send to ${to}: ${subject}`);
    return false;
  }

  try {
    const info = await relay.sendMail({ from, to, subject, text, html });
    logger.info(`[mailer] sent to ${to}: ${subject} (${info.messageId})`);
    return true;
  } catch (err) {
    // Never fail the citizen's request because the mail relay is down.
    logger.error(`[mailer] failed to send to ${to}: ${err.message}`);
    return false;
  }
}

module.exports = { sendMail };
