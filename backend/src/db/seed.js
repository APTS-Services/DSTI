// src/db/seed.js — imports the starter website content from seed/content.json.
//
// The content is written through the same repository the API and the CMS use,
// so every row lands in the normalised MySQL tables (and cms_extras / cms_blocks
// where the schema has no dedicated column). Nothing bypasses validation.
//
// Usage:
//   npm run seed              upsert: update items that already exist, create the rest
//   npm run seed -- --reset   wipe the content collections first, then import fresh
//
// Collections with a stable natural key (slug / block key / awards year) are
// always upserted, so re-running is safe. Collections stored under an
// auto-increment primary key (news, documents, tenders, events, officers, …)
// are only imported into an empty collection, which prevents duplicates.
const fs = require('fs');
const path = require('path');

const config = require('../config');
const { q } = require('../config/db');
const contentRepository = require('../repositories/contentRepository');
const mediaRepository = require('../repositories/mediaRepository');
const { getCollection } = require('../content/collections');

const seedFile = path.join(__dirname, '..', '..', 'seed', 'content.json');

// Content tables emptied by --reset. Reference tables (roles, districts stubs,
// document_categories, sectors, audience_cards, site_settings) and operational
// data (users, feedback, audit log, analytics, sessions) are left untouched —
// districts and audience_cards are updated in place by the upsert below.
const CONTENT_TABLES = [
  'cms_blocks',
  'cms_extras',
  'documents',
  'tenders',
  'events',
  'science_stories',
  'news_updates',
  'faqs',
  'quick_links',
  'pages',
  'policies',
  'organisations',
  'officers',
  'banners',
  'story_panels',
  'almanac_entries',
  'awards'
];

/** Minimal one-page PDF used as a stand-in until real documents are uploaded. */
function placeholderPdf(title) {
  const safe = String(title).replace(/[()\\]/g, '');
  const stream = `BT /F1 18 Tf 72 760 Td (Department of Science, Technology & Innovation) Tj 0 -28 Td /F1 12 Tf (Government of Andhra Pradesh) Tj 0 -40 Td (${safe}) Tj 0 -24 Td (Sample document - replace this file from the CMS.) Tj ET`;
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
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

/**
 * A collection can be upserted item by item only when each item has a stable
 * natural key: JSON block rows, the bespoke awards handler, or a table whose
 * CMS identifier is a slug that is not the numeric primary key.
 */
function hasStableKey(name, schema) {
  const storage = schema.storage;
  if (storage.kind === 'block') return true;
  if (storage.kind === 'custom') return true;
  return Boolean(schema.keyField);
}

/** Converts one seed item to the backup-item shape contentRepository.restore() reads. */
function toBackupItem(collection, item, index) {
  const { id, _status, _order, _updatedAt, ...data } = item;
  return {
    collection,
    item_key: String(id ?? `${collection}-${index + 1}`),
    status: _status === 'draft' ? 'draft' : 'published',
    sort_order: Number.isFinite(Number(_order)) ? Number(_order) : (index + 1) * 10,
    data
  };
}

async function wipeContent() {
  for (const table of CONTENT_TABLES) {
    await q(`DELETE FROM \`${table}\``);
  }
}

/** Writes the placeholder files the seed content links to and registers them as media. */
async function materialiseSeedFiles(files) {
  let created = 0;
  for (const file of files || []) {
    if (typeof file !== 'string' || !file.startsWith('/uploads/')) continue;
    const relative = file.replace(/^\/uploads\//, '');
    const target = path.join(config.paths.uploadsDir, relative);
    if (!target.startsWith(config.paths.uploadsDir)) continue; // path traversal guard
    if (!fs.existsSync(target)) {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, placeholderPdf(path.basename(relative, path.extname(relative))));
      created += 1;
    }
    const existing = await mediaRepository.getByPath(file);
    if (!existing) {
      const bytes = fs.statSync(target).size;
      await mediaRepository.insert({
        fileName: path.basename(relative),
        filePath: file,
        mime: 'application/pdf',
        sizeKb: Math.max(1, Math.ceil(bytes / 1024))
      });
    }
  }
  return created;
}

async function seed({ reset = false } = {}) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
  } catch (err) {
    throw new Error(`Cannot read seed/content.json: ${err.message}`);
  }

  if (reset) {
    await wipeContent();
    console.log('Content collections cleared.');
  }

  const items = [];
  let skipped = 0;

  // Collections the seed owns completely (e.g. the main menu): items that are
  // no longer in content.json are removed so a re-run leaves no stale entries.
  for (const name of data.replace || []) {
    if (getCollection(name)?.storage.kind === 'block') await q('DELETE FROM cms_blocks WHERE collection = ?', [name]);
  }

  // Placeholder files first: document rows resolve their file_id against
  // media_files, so the media rows must exist before the import runs.
  const filesCreated = await materialiseSeedFiles(data.seedFiles);

  for (const [name, list] of Object.entries(data.collections || {})) {
    const schema = getCollection(name);
    if (!schema) {
      console.warn(`- ${name}: unknown section in content.json, skipped`);
      continue;
    }
    if (!hasStableKey(name, schema)) {
      const existing = await contentRepository.list(name, { includeDrafts: true });
      if (existing.length) {
        skipped += 1;
        console.log(`- ${name}: ${existing.length} item(s) already present, skipped`);
        continue;
      }
    }
    list.forEach((item, index) => items.push(toBackupItem(name, item, index)));
  }

  for (const [name, value] of Object.entries(data.settings || {})) {
    items.push({ collection: '_settings', item_key: name, status: 'published', sort_order: 0, data: value });
  }

  const { restored, warnings } = await contentRepository.restore(items);
  for (const warning of warnings) console.warn(`! ${warning}`);

  contentRepository.bumpVersion();

  console.log(
    `Seed complete: ${restored} item(s) imported, ${skipped} collection(s) skipped, ${filesCreated} placeholder file(s) created.`
  );
}

if (require.main === module) {
  seed({ reset: process.argv.includes('--reset') })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed failed:', err.message);
      process.exit(1);
    });
}

module.exports = { seed, placeholderPdf };
