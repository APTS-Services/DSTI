// Loads the initial website content and creates the first administrator.
//   npm run db:seed            -> seeds only an empty database
//   npm run db:seed -- --reset -> replaces ALL content with the seed (users are kept)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import env, { ROOT } from '../config/env.js';
import { collections, settings } from '../content/schemas.js';
import { sanitize } from '../content/validate.js';
import { passwordProblems } from '../utils/security.js';
import { migrate } from './migrate.js';
import { closePool, query } from './pool.js';

const seedFile = path.join(ROOT, 'seed', 'content.json');

/** Minimal one-page PDF used as a stand-in until real documents are uploaded. */
export function placeholderPdf(title) {
  const safe = title.replace(/[()\\]/g, '');
  const stream = `BT /F1 18 Tf 72 760 Td (Department of Science, Technology & Innovation) Tj 0 -28 Td /F1 12 Tf (Government of Andhra Pradesh) Tj 0 -40 Td (${safe}) Tj 0 -24 Td (Sample document - replace this file from the CMS.) Tj ET`;
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let out = '%PDF-1.4\n';
  const offsets = [];
  objs.forEach((o, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, 'latin1');
}

export async function seed({ reset = false, quiet = false } = {}) {
  const log = quiet ? () => {} : console.log;
  await migrate();
  const data = JSON.parse(fs.readFileSync(seedFile, 'utf8'));

  const [{ n }] = await query('SELECT COUNT(*) AS n FROM content');
  if (reset) await query('DELETE FROM content');
  if (reset || Number(n) === 0) {
    let count = 0;
    for (const [name, items] of Object.entries(data.collections)) {
      const schema = collections[name];
      if (!schema) continue;
      for (const [i, raw] of items.entries()) {
        const { value, errors } = sanitize(schema.fields, raw);
        if (errors.length) throw new Error(`Seed ${name}[${i}]: ${errors.join('; ')}`);
        const key = schema.keyField ? value[schema.keyField] : `${name.slice(0, 12).toLowerCase()}-${String(i + 1).padStart(3, '0')}`;
        await query('INSERT INTO content (collection, item_key, data, status, sort_order) VALUES (?, ?, ?, ?, ?)', [name, key, JSON.stringify(value), 'published', (i + 1) * 10]);
        count += 1;
      }
    }
    for (const [name, raw] of Object.entries(data.settings)) {
      const { value, errors } = sanitize(settings[name].fields, raw);
      if (errors.length) throw new Error(`Seed settings.${name}: ${errors.join('; ')}`);
      await query("INSERT INTO content (collection, item_key, data, status) VALUES ('_settings', ?, ?, 'published')", [name, JSON.stringify(value)]);
    }
    log(`Seeded ${count} content items and ${Object.keys(data.settings).length} settings groups.`);
  } else {
    log('Content already present - skipped (use --reset to replace it).');
  }

  // Placeholder PDFs for documents referenced by the seed.
  for (const file of data.seedFiles) {
    const target = path.join(env.uploadDir, file.replace(/^\/uploads\//, ''));
    if (!target.startsWith(env.uploadDir) || fs.existsSync(target)) continue;
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, placeholderPdf(path.basename(file, '.pdf')));
  }

  const [{ users }] = await query('SELECT COUNT(*) AS users FROM users');
  if (Number(users) === 0) {
    const { username, password } = env.admin;
    const problems = passwordProblems(password, username);
    if (problems.length) throw new Error(`ADMIN_PASSWORD in .env ${problems.join(', ')}.`);
    await query("INSERT INTO users (username, full_name, email, role, password_hash, must_change_password) VALUES (?, 'System Administrator', '', 'Administrator', ?, 1)", [
      username.toLowerCase(), await bcrypt.hash(password, 12),
    ]);
    log(`Created administrator "${username}". The password must be changed at first sign-in.`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed({ reset: process.argv.includes('--reset') })
    .catch((err) => {
      console.error('Seeding failed:', err.message);
      process.exitCode = 1;
    })
    .finally(closePool);
}
