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

const CATEGORIES = ['General', 'Schemes & programmes', 'Tenders & procurement', 'RTI', 'Website', 'Grievance', 'Suggestion'];

const reference = (id) => `FB-${String(id).padStart(5, '0')}`;

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
    category: CATEGORIES.includes(body.category) ? body.category : 'General',
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
  return { id, reference: reference(id) };
}

/* ------------------------- public dashboard ---------------------------- */

const round = (value, digits = 1) => Math.round(Number(value || 0) * 10 ** digits) / 10 ** digits;
let cached = null;

/** Aggregate figures only (no personal data); cached for a minute. */
async function publicStats() {
  if (cached && cached.expires > Date.now()) return cached.value;
  const { totals, months, categories } = await repository.stats();
  const received = Number(totals?.received || 0);
  const answered = Number(totals?.answered || 0);
  const value = {
    received,
    answered,
    pending: Math.max(0, received - answered),
    last30Days: Number(totals?.last30 || 0),
    answeredRate: received ? round((answered / received) * 100, 0) : 0,
    avgResponseHours: totals?.avgMinutes == null ? null : round(Number(totals.avgMinutes) / 60),
    within7DaysRate: answered ? round((Number(totals?.within7 || 0) / answered) * 100, 0) : 0,
    months: months.map((m) => ({ month: m.month, received: Number(m.received), answered: Number(m.answered || 0) })),
    categories: categories.map((c) => ({ category: c.category, received: Number(c.received), answered: Number(c.answered || 0) })),
    updatedAt: new Date().toISOString()
  };
  cached = { value, expires: Date.now() + 60 * 1000 };
  return value;
}

const STATUS_LABEL = { new: 'Received', read: 'Under examination', replied: 'Answered', resolved: 'Resolved', closed: 'Resolved' };

/**
 * Lets a citizen follow their submission. Both the reference number and the
 * e-mail address used must match, and every failure gets the same answer.
 */
async function track({ reference: ref, email }) {
  const match = /^FB-?(\d{1,9})$/i.exec(String(ref || '').trim());
  const address = String(email || '').trim().toLowerCase();
  const row = match && address ? await repository.getById(Number(match[1])) : null;
  if (!row || String(row.email).trim().toLowerCase() !== address) {
    throw new ApiError(404, 'No feedback matches this reference number and e-mail address.');
  }
  return {
    reference: reference(row.feedback_id),
    subject: row.subject || '',
    category: row.category || 'General',
    status: row.status === 'closed' ? 'resolved' : row.status,
    statusLabel: STATUS_LABEL[row.status] || row.status,
    receivedAt: row.created_at,
    respondedAt: row.responded_at,
    response: row.response || ''
  };
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
  cached = null;
  return { ok: true };
}

/** Records the Department's reply, e-mails it to the citizen when SMTP is set up. */
async function reply(id, text, user) {
  const response = cleanString(text, 4000);
  if (response.length < 5) throw new ApiError(400, 'Please write a reply of at least 5 characters.');
  const row = await repository.getById(id);
  if (!row) throw new ApiError(404, 'Feedback not found.');
  await repository.saveResponse(id, response, user?.id || null);
  const emailed = await sendMail({
    to: row.email,
    subject: `Reply to your feedback ${reference(id)} — DSTI, Government of Andhra Pradesh`,
    text: `Dear ${row.name},\n\nThank you for writing to the Department of Science, Technology & Innovation.\n\nYour message (${reference(id)}${row.subject ? `: ${row.subject}` : ''}):\n${row.message}\n\nOur reply:\n${response}\n\nYou can also see this reply on the website: Contact → Feedback → Track your feedback.\n\nDepartment of Science, Technology & Innovation\nGovernment of Andhra Pradesh`
  });
  await record(user, 'FEEDBACK_REPLY', `feedback/${id}`, emailed ? 'emailed' : 'saved', '');
  cached = null;
  return { ok: true, emailed };
}

async function remove(id, user) {
  const row = await repository.getById(id);
  if (!row) throw new ApiError(404, 'Feedback not found.');
  await repository.remove(id);
  await record(user, 'FEEDBACK_DELETE', `feedback/${id}`, '', '');
  cached = null;
  return { ok: true };
}

async function exportCsv() {
  const rows = await repository.allForExport();
  // Cells starting with = + - @ (or a tab / CR) would run as formulas in Excel
  // (CSV injection), so they are prefixed with an apostrophe.
  const escape = (value) => {
    const text = String(value ?? '');
    const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const header = ['Reference', 'Name', 'Email', 'Phone', 'Category', 'Subject', 'Message', 'Status', 'Reply', 'Received', 'Answered'];
  const lines = [header.join(',')];
  for (const row of rows) {
    lines.push(
      [reference(row.feedback_id), row.name, row.email, row.phone, row.category, row.subject, row.message, row.status, row.response, row.created_at, row.responded_at]
        .map(escape)
        .join(',')
    );
  }
  return lines.join('\n');
}

module.exports = { CATEGORIES, submit, publicStats, track, listForAdmin, list, get, setStatus, reply, remove, exportCsv };
