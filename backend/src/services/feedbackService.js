// src/services/feedbackService.js — public feedback form and CMS inbox.
const ApiError = require('../utils/ApiError');
const repository = require('../repositories/feedbackRepository');
const settingsRepository = require('../repositories/settingsRepository');
const { verifyCaptcha, captchaExists } = require('../utils/captcha');
const { cleanString } = require('../utils/validate');
const { EMAIL_RE } = require('../utils/validate');
const { hashVisitor } = require('../utils/security');
const { sendMail } = require('../utils/mailer');
const { record } = require('../utils/audit');

/** Accepts either { captchaId, captcha } or a single "id:answer" token. */
function checkCaptcha({ captchaId, captcha, captcha_token }) {
  let id = captchaId;
  let answer = captcha;
  if (!id && typeof captcha_token === 'string' && captcha_token.includes(':')) {
    const index = captcha_token.indexOf(':');
    id = captcha_token.slice(0, index);
    answer = captcha_token.slice(index + 1);
  }
  if (!captchaExists(id)) return false;
  return verifyCaptcha(id, typeof answer === 'string' ? answer : '');
}

async function submit(body, req) {
  if (!checkCaptcha(body)) {
    throw new ApiError(400, 'The CAPTCHA answer is incorrect. Please try again.');
  }
  const data = {
    name: cleanString(body.name, 100),
    email: cleanString(body.email, 160),
    phone: cleanString(body.phone, 20),
    subject: cleanString(body.subject, 150),
    message: cleanString(body.message, 2000)
  };
  const fields = {};
  if (data.name.length < 2) fields.name = 'Please enter your name.';
  if (!EMAIL_RE.test(data.email)) fields.email = 'Please enter a valid e-mail address.';
  if (data.phone && !/^[6-9]\d{9}$/.test(data.phone)) fields.phone = 'Please enter a valid 10-digit mobile number.';
  if (data.message.length < 10) fields.message = 'Please enter a message of at least 10 characters.';
  if (Object.keys(fields).length) {
    const error = new ApiError(400, 'Please correct the highlighted fields.');
    error.details = fields;
    throw error;
  }

  const ipHash = hashVisitor(req.ip || '');
  const id = await repository.insert({ ...data, ipHash });
  const system = await settingsRepository.get('system');
  const sent = await sendMail({
    to: system.feedbackNotifyEmail,
    subject: `[DSTI website] New feedback #${id}`,
    text: `New feedback received on the DSTI website.\n\nName: ${data.name}\nE-mail: ${data.email}\nSubject: ${data.subject}\n\nSign in to the CMS to read and respond.`
  });
  if (sent) await repository.markNotified(id);
  await record(null, 'FEEDBACK_RECEIVED', `feedback/${id}`, data.subject, req.ip);
  return { id, reference: `FB-${String(id).padStart(5, '0')}` };
}

/* ----------------------------- CMS inbox ------------------------------- */

const toApi = (row) => ({
  id: row.feedback_id,
  name: row.name,
  email: row.email,
  phone: row.phone || '',
  subject: row.subject,
  message: row.message,
  status: row.status,
  notified: Boolean(row.notified_at),
  notified_at: row.notified_at,
  created_at: row.created_at
});

async function listForAdmin() {
  return repository.listForAdmin();
}

async function list(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const { rows, total } = await repository.list({ status: query.status, from: query.from, to: query.to, page, limit });
  return {
    rows: rows.map(toApi),
    meta: { page, limit, total: Number(total) || 0, pages: Math.max(1, Math.ceil((Number(total) || 0) / limit)) }
  };
}

async function get(id) {
  const row = await repository.getById(id);
  if (!row) throw new ApiError(404, 'Feedback not found.');
  await repository.markRead(id);
  return toApi({ ...row, status: row.status === 'new' ? 'read' : row.status });
}

const ALLOWED = ['new', 'read', 'replied', 'resolved', 'closed'];

async function setStatus(id, status, user) {
  if (!ALLOWED.includes(status)) throw new ApiError(400, 'Invalid status.');
  const row = await repository.getById(id);
  if (!row) throw new ApiError(404, 'Feedback not found.');
  await repository.setStatus(id, status);
  if (user) await repository.setHandler(id, user.id);
  await record(user, 'FEEDBACK', `feedback/${id}`, status, '');
  return { ok: true };
}

async function remove(id, user) {
  const row = await repository.getById(id);
  if (!row) throw new ApiError(404, 'Feedback not found.');
  await repository.remove(id);
  await record(user, 'FEEDBACK_DELETE', `feedback/${id}`, '', '');
  return { ok: true };
}

async function exportCsv() {
  const rows = await repository.allForExport();
  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const header = ['ID', 'Name', 'Email', 'Phone', 'Subject', 'Message', 'Status', 'Received'];
  const lines = [header.join(',')];
  for (const row of rows) {
    lines.push(
      [row.feedback_id, row.name, row.email, row.phone, row.subject, row.message, row.status, row.created_at]
        .map(escape)
        .join(',')
    );
  }
  return lines.join('\n');
}

module.exports = { submit, listForAdmin, list, get, setStatus, remove, exportCsv };
