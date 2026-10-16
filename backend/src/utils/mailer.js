// Optional e-mail notifications (feedback). Disabled when SMTP_HOST is empty.
import nodemailer from 'nodemailer';
import env from '../config/env.js';

let transport = null;
if (env.smtp.host) {
  transport = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.password } : undefined,
  });
}

export async function sendMail({ to, subject, text }) {
  if (!transport || !to) return false;
  try {
    await transport.sendMail({ from: env.smtp.from, to, subject, text });
    return true;
  } catch (err) {
    console.error('mail delivery failed:', err.message);
    return false;
  }
}
