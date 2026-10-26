// "Ask Vigyan Mitra" answer engine.
//
// Answers are composed when a question is asked, from the content the website
// itself publishes (the same CMS bundle the pages render). There is no external
// AI service: retrieval, filtering and sentence selection all happen against
// published fields, and every answer ends with links to the pages it used.
//
// A handler may return null when the question does not really belong to it; the
// engine then falls through to general retrieval, so an unusual question still
// gets an answer when the content supports one.

import { formatDate } from './format.js';
import { docPath, pagePath } from './searchIndex.js';

const B = (en, te) => ({ en, te });
const pick = (value, lang) => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value !== 'object') return String(value);
  return String(value[lang] || value.en || value.te || '');
};

/** Flatten any content value to plain text in one language. */
function text(value, lang) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map((v) => text(v, lang)).filter(Boolean).join(' · ');
  if (typeof value === 'object') {
    if ('en' in value || 'te' in value) return String(value[lang] || value.en || value.te || '');
    return Object.values(value).map((v) => text(v, lang)).filter(Boolean).join(' · ');
  }
  return '';
}

// ---------------------------------------------------------------- tokenising

const STOP = new Set([
  'the', 'a', 'an', 'of', 'to', 'in', 'and', 'or', 'for', 'on', 'is', 'are', 'was', 'were', 'be', 'been',
  'what', 'how', 'where', 'when', 'which', 'who', 'whom', 'whose', 'why', 'can', 'could', 'should', 'would',
  'i', 'me', 'my', 'you', 'your', 'we', 'our', 'it', 'its', 'this', 'that', 'these', 'those', 'there', 'here',
  'do', 'does', 'did', 'has', 'have', 'had', 'about', 'with', 'at', 'by', 'from', 'into', 'any', 'all', 'please',
  'tell', 'give', 'show', 'find', 'get', 'need', 'want', 'know', 'much', 'many', 'also', 'but', 'if', 'so',
  'లో', 'కు', 'కై', 'ఏమి', 'ఎలా', 'ఎక్కడ', 'ఉంది', 'ఉన్న', 'గురించి', 'మరియు', 'దయచేసి', 'చేయాలి', 'ఏవి',
]);

const tokenize = (q) => String(q || '')
  .toLowerCase()
  .replace(/[^a-z0-9\u0c00-\u0c7f\s]/g, ' ')
  .split(/\s+/)
  .filter((t) => t.length > 1 && !STOP.has(t));

/** Very light stemming; Telugu words are left untouched. */
function stem(word) {
  if (/[^\x00-\x7f]/.test(word)) return word;
  if (word.length > 5 && word.endsWith('ies')) return `${word.slice(0, -3)}y`;
  if (word.length > 5 && word.endsWith('ing')) return word.slice(0, -3);
  if (word.length > 4 && word.endsWith('ed')) return word.slice(0, -2);
  if (word.length > 5 && word.endsWith('es')) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

// --------------------------------------------------------------------- labels

const LABEL = {
  address: B('Address', 'చిరునామా'),
  phone: B('Phone', 'ఫోన్'),
  email: B('Email', 'ఇమెయిల్'),
  fax: B('Fax', 'ఫ్యాక్స్'),
  hours: B('Working hours', 'పని వేళలు'),
  pio: B('Public Information Officer', 'ప్రజా సమాచార అధికారి'),
  institutions: B('Institutions', 'సంస్థలు'),
  activities: B('Activities', 'కార్యక్రమాలు'),
  headquarters: B('Headquarters', 'ప్రధాన కేంద్రం'),
  closing: B('Closing date', 'ముగింపు తేదీ'),
  tenderNo: B('Tender no.', 'టెండర్ నం.'),
  department: B('Department', 'శాఖ'),
  sector: B('Sector', 'రంగం'),
  number: B('Number', 'సంఖ్య'),
  date: B('Date', 'తేదీ'),
  location: B('Location', 'ప్రదేశం'),
  organisations: B('Organisations', 'సంస్థలు'),
  policies: B('Policies', 'విధానాలు'),
  tenders: B('Tenders', 'టెండర్లు'),
  documents: B('Documents', 'పత్రాలు'),
  districts: B('Districts', 'జిల్లాలు'),
  faqs: B('FAQs', 'తరచుగా అడిగే ప్రశ్నలు'),
  contact: B('Contact Us', 'సంప్రదించండి'),
  help: B('Help', 'సహాయం'),
  events: B('Events', 'కార్యక్రమాలు'),
  latest: B('Latest updates', 'తాజా నవీకరణలు'),
  districtsPage: B('District Explorer', 'జిల్లా అన్వేషిణి'),
  documentsPage: B('Document repository', 'పత్రాల నిలయం'),
  policiesPage: B('Policies', 'విధానాలు'),
  tendersPage: B('Tenders', 'టెండర్లు'),
};

const TYPE_LABEL = {
  page: B('Page', 'పేజీ'),
  organisation: B('Organisation', 'సంస్థ'),
  policy: B('Policy', 'విధానం'),
  tender: B('Tender', 'టెండర్'),
  document: B('Document', 'పత్రం'),
  faq: B('FAQ', 'ప్రశ్న'),
  event: B('Event', 'కార్యక్రమం'),
  video: B('Video', 'వీడియో'),
  news: B('Update', 'సమాచారం'),
  district: B('District', 'జిల్లా'),
  officer: B('Officer', 'అధికారి'),
  award: B('Award', 'అవార్డు'),
  link: B('Useful link', 'ఉపయోగకరమైన లింకు'),
  service: B('Service', 'సేవ'),
};

// -------------------------------------------------------------------- records

const CACHE = new WeakMap();

function record({ id, type, title, path, body, facts = [] }) {
  const t = { en: text(title, 'en'), te: text(title, 'te') };
  const b = { en: text(body, 'en'), te: text(body, 'te') };
  const f = facts
    .map((x) => ({ label: x && x.label, value: { en: text(x && x.value, 'en'), te: text(x && x.value, 'te') } }))
    .filter((x) => x.value.en || x.value.te);
  const factText = `${f.map((x) => x.value.en).join(' ')} ${f.map((x) => x.value.te).join(' ')}`;
  return {
    id,
    type,
    path,
    title: t,
    text: b,
    facts: f,
    titleLower: `${t.en} ${t.te}`.toLowerCase(),
    factsLower: factText.toLowerCase(),
    hayLower: `${t.en} ${t.te} ${b.en} ${b.te} ${factText}`.toLowerCase(),
  };
}

const localPath = (p) => (typeof p === 'string' && p.startsWith('/') && !p.startsWith('//') ? p.split('?')[0] : null);

/** The district a question names, if any — matches English or Telugu spellings. */
function findDistrict(data, qLower) {
  const districts = data.collections?.districts || [];
  return districts.find((d) => [text(d.name, 'en'), text(d.name, 'te')]
    .some((name) => name.length > 3 && qLower.includes(name.toLowerCase()))) || null;
}

function buildRecords(data) {
  if (CACHE.has(data)) return CACHE.get(data);
  const c = data.collections || {};
  const s = data.settings || {};
  const list = (name) => (Array.isArray(c[name]) ? c[name] : []);
  const out = [];

  out.push(record({
    id: 'settings-about', type: 'page', path: '/about',
    title: B('About the Department', 'శాఖ గురించి'),
    body: [s.about?.intro, s.about?.mission, s.about?.objectives, s.about?.orgStructure],
  }));
  out.push(record({
    id: 'settings-investors', type: 'page', path: '/investors',
    title: B("Investor's Corner", 'పెట్టుబడిదారుల విభాగం'),
    body: [s.investors?.intro, s.investors?.whyInvest, s.investors?.steps, list('investorIncentives').map((i) => [i.title, i.detail])],
  }));
  out.push(record({
    id: 'settings-contact', type: 'page', path: '/contact', title: LABEL.contact,
    body: [s.contact?.headOffice, s.contact?.phone, s.contact?.email, s.contact?.workingHours, s.site?.footerAbout],
    facts: [
      { label: LABEL.address, value: s.contact?.headOffice },
      { label: LABEL.phone, value: s.contact?.phone },
      { label: LABEL.email, value: s.contact?.email },
      { label: LABEL.hours, value: s.contact?.workingHours },
    ],
  }));

  list('pages').forEach((p) => out.push(record({
    id: `page-${p.id}`, type: 'page', path: pagePath(p.id), title: p.title,
    body: [p.subtitle, (p.sections || []).map((x) => [x.heading, x.body])],
  })));

  list('organisations').forEach((o) => out.push(record({
    id: `org-${o.id}`, type: 'organisation', path: `/organisations/${o.id}`, title: o.name,
    body: [o.abbr, o.category, o.summary, o.functions, o.website],
    facts: [
      { label: B('Abbreviation', 'సంక్షిప్త నామం'), value: o.abbr },
      { label: B('Category', 'వర్గం'), value: o.category },
      { label: B('Established', 'స్థాపన'), value: o.established },
    ],
  })));

  list('policies').forEach((p) => out.push(record({
    id: `policy-${p.id}`, type: 'policy', path: `/policies/${p.id}`, title: p.name,
    body: [p.sector, p.summary, p.objectives, p.incentives],
    facts: [
      { label: LABEL.sector, value: p.sector },
      { label: B('Year', 'సంవత్సరం'), value: p.year },
      { label: B('Status', 'స్థితి'), value: p.status },
    ],
  })));

  list('tenders').forEach((t) => out.push(record({
    id: `tender-${t.id}`, type: 'tender', path: '/tenders', title: t.title,
    body: [t.tenderNo, t.department, t.status, t.emd, t.publishedDate, t.closingDate],
    facts: [
      { label: LABEL.tenderNo, value: t.tenderNo },
      { label: LABEL.department, value: t.department },
      { label: LABEL.closing, value: formatDate(t.closingDate, 'en') },
      { label: B('Status', 'స్థితి'), value: t.status },
    ],
  })));

  list('documents').forEach((d) => out.push(record({
    id: `doc-${d.id}`, type: 'document', path: docPath(d), title: d.title,
    body: [d.number, d.department, d.type, d.date],
    facts: [
      { label: LABEL.number, value: d.number },
      { label: LABEL.date, value: formatDate(d.date, 'en') },
      { label: LABEL.department, value: d.department },
    ],
  })));

  list('faqs').forEach((f) => out.push(record({
    id: `faq-${f.id}`, type: 'faq', path: '/ecitizen/faqs', title: f.q, body: [f.a],
  })));

  list('events').forEach((e) => out.push(record({
    id: `event-${e.id}`, type: 'event', path: '/media/events', title: e.title,
    body: [e.category, e.location, e.summary, e.status],
    facts: [{ label: LABEL.date, value: formatDate(e.date, 'en') }, { label: LABEL.location, value: e.location }],
  })));

  list('scienceStories').forEach((v) => out.push(record({
    id: `video-${v.id}`, type: 'video', path: '/media/science-stories', title: v.title,
    body: [v.category, v.summary],
  })));

  list('news').forEach((n) => out.push(record({
    id: `news-${n.id}`, type: 'news', path: localPath(n.link) || '/', title: n.title,
    body: [n.category], facts: [{ label: LABEL.date, value: formatDate(n.date, 'en') }],
  })));

  list('districts').forEach((d) => out.push(record({
    id: `district-${d.id}`, type: 'district', path: `/districts?district=${encodeURIComponent(d.id)}`, title: d.name,
    body: [d.hq, (d.institutions || []).map((i) => [i.name, i.type]), d.activities],
    facts: [{ label: LABEL.headquarters, value: d.hq }],
  })));

  list('egov').forEach((e) => out.push(record({
    id: `egov-${e.id}`, type: 'page', path: '/ict', title: e.name, body: [e.summary, e.status, e.tags],
  })));

  list('projects').forEach((p) => out.push(record({
    id: `project-${p.id}`, type: 'page', path: '/ict/projects', title: p.name, body: [p.sector, p.summary, p.status],
  })));

  list('awards').forEach((y) => (y.awards || []).forEach((a, i) => out.push(record({
    id: `award-${y.id}-${i}`, type: 'award', path: `/about/awards?year=${y.year}`, title: a.name,
    body: [a.recipient, a.field, String(y.year)],
    facts: [{ label: B('Year', 'సంవత్సరం'), value: y.year }, { label: B('Recipient', 'గ్రహీత'), value: a.recipient }],
  }))));

  list('officers').forEach((o, i) => out.push(record({
    id: `officer-${i}`, type: 'officer', path: '/contact', title: o.name,
    body: [o.designation, o.office, o.phone, o.email],
    facts: [{ label: B('Designation', 'హోదా'), value: o.designation }, { label: LABEL.phone, value: o.phone }],
  })));

  list('services').forEach((srv, i) => out.push(record({
    id: `service-${i}`, type: 'service', path: localPath(srv.to) || '/', title: srv.title, body: [srv.text],
  })));

  list('audiences').forEach((a) => out.push(record({
    id: `audience-${a.id}`, type: 'page', path: '/', title: a.title, body: [a.blurb, (a.links || []).map((l) => l.label)],
  })));

  const clean = out.filter((r) => r.title.en || r.title.te);
  CACHE.set(data, clean);
  return clean;
}

// ------------------------------------------------------------------ retrieval

function scoreRecord(rec, terms) {
  let total = 0;
  let hits = 0;
  for (const term of terms) {
    const s = stem(term);
    let weight = 0;
    if (rec.titleLower.includes(term) || (s !== term && rec.titleLower.includes(s))) weight = 6;
    else if (rec.factsLower.includes(term) || (s !== term && rec.factsLower.includes(s))) weight = 3;
    else if (rec.hayLower.includes(term) || (s !== term && rec.hayLower.includes(s))) weight = 1.5;
    if (weight) {
      total += weight;
      hits += 1;
    }
  }
  if (!hits) return 0;
  total += hits === terms.length ? 2 + terms.length : hits * 0.5;
  return total;
}

function ranked(state, { types, terms = state.terms, limit = 4 } = {}) {
  const pool = types ? state.records.filter((r) => types.includes(r.type)) : state.records;
  return pool
    .map((rec) => ({ rec, score: scoreRecord(rec, terms) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.rec.path.localeCompare(b.rec.path))
    .slice(0, limit);
}

/**
 * Pick the sentences of a record that actually answer the question, so the
 * reply is composed rather than a fixed snippet.
 */
function passage(rec, terms, lang, maxChars = 320) {
  const body = rec.text[lang] || rec.text.en || '';
  if (!body) return '';
  const parts = body
    .split(/(?<=[.!?])\s+|\s+·\s+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 2);
  if (parts.length <= 1) return body.slice(0, maxChars).trim();

  // Headings and short fragments make poor answers; prefer whole sentences,
  // and in Telugu prefer the sentences that are actually in Telugu.
  const solid = parts.filter((p) => p.length >= 30);
  const base = solid.length ? solid : parts;
  const localized = lang === 'te' ? base.filter((p) => /[\u0c00-\u0c7f]/.test(p)) : base;
  const pool = localized.length ? localized : base;
  const scored = pool.map((part, index) => {
    const lower = part.toLowerCase();
    const hits = terms.filter((t) => lower.includes(t) || lower.includes(stem(t))).length;
    return { part, index, hits };
  });
  const best = scored.filter((x) => x.hits > 0).sort((a, b) => b.hits - a.hits || a.index - b.index).slice(0, 2);
  const chosen = (best.length ? best : scored.slice(0, 2)).sort((a, b) => a.index - b.index);

  let outText = '';
  for (const { part } of chosen) {
    if (outText && outText.length + part.length + 3 > maxChars) break;
    outText += `${outText ? ' ' : ''}${part}`;
  }
  return outText || body.slice(0, maxChars).trim();
}

// ------------------------------------------------------------------- answers

function reply(state, { intent, lead, bullets = [], note = '', sources = [], followUps = [] }) {
  if (!lead) return null;
  const lang = state.lang;
  const cleanBullets = bullets
    .map((b) => ({ label: pick(b && b.label, lang), value: pick(b && b.value, lang) }))
    .filter((b) => b.value);
  const seen = new Set();
  const cleanSources = [];
  for (const s of sources) {
    const path = s && (s.path || '');
    if (!path.startsWith('/') || path.startsWith('//') || seen.has(path)) continue;
    seen.add(path);
    cleanSources.push({ title: pick(s.title, lang) || path, path, type: s.type || 'page' });
  }
  if (!cleanSources.length) return null;
  return {
    matched: true,
    intent,
    lang,
    lead,
    bullets: cleanBullets.slice(0, 4),
    note,
    sources: cleanSources.slice(0, 3),
    followUps: followUps.filter(Boolean).slice(0, 3),
  };
}

const today = () => new Date().toISOString().slice(0, 10);
const byAsc = (field) => (a, b) => String(a[field] || '').localeCompare(String(b[field] || ''));
const byDesc = (field) => (a, b) => String(b[field] || '').localeCompare(String(a[field] || ''));

function contactAnswer(state) {
  const c = state.data.settings?.contact;
  if (!c) return null;
  const bullets = [
    { label: LABEL.address, value: c.headOffice },
    { label: LABEL.phone, value: c.phone },
    { label: LABEL.email, value: c.email },
    { label: LABEL.hours, value: c.workingHours },
  ];
  if (!bullets.some((b) => pick(b.value, 'en'))) return null;
  return reply(state, {
    intent: 'contact',
    lead: state.lang === 'te'
      ? 'ఈ వెబ్‌సైట్‌లో ప్రచురించిన సంప్రదింపు వివరాలు ఇవి.'
      : 'These are the contact details the Department publishes on this website.',
    bullets,
    sources: [{ title: LABEL.contact, path: '/contact' }, { title: LABEL.faqs, path: '/ecitizen/faqs' }],
    followUps: [
      state.lang === 'te' ? 'అధికారుల జాబితా చూపించు' : 'Show the list of officers',
      state.lang === 'te' ? 'నేను అభిప్రాయం ఎలా పంపాలి?' : 'How do I send feedback?',
    ],
  });
}

function rtiAnswer(state) {
  const page = state.records.find((r) => r.id === 'page-rti');
  const pio = (state.data.collections?.officers || []).filter((o) => o.roleTag === 'pio');
  const docs = (state.data.collections?.documents || []).filter((d) => d.topic === 'rti');
  if (!page && !pio.length) return null;

  const lead = page
    ? passage(page, ['request', 'information', 'citizen', 'pio', 'rti'], state.lang, 340)
    : '';
  const bullets = pio.map((o) => ({
    label: LABEL.pio,
    value: [o.name, o.designation, o.phone, o.email].filter(Boolean).join(' · '),
  }));
  if (docs.length) {
    bullets.push({ label: LABEL.documents, value: docs.slice(0, 3).map((d) => text(d.title, state.lang)).join(' · ') });
  }
  return reply(state, {
    intent: 'rti',
    lead: lead || (state.lang === 'te'
      ? 'సమాచార హక్కు చట్టం, 2005 కింద శాఖ వద్ద ఉన్న సమాచారాన్ని అభ్యర్థించవచ్చు.'
      : 'Under the Right to Information Act, 2005 any citizen may request information held by the Department.'),
    bullets,
    note: /public information officer|ప్రజా సమాచార అధికారి/i.test(lead)
      ? ''
      : (state.lang === 'te'
        ? 'అభ్యర్థనలను ప్రజా సమాచార అధికారికి పంపాలి.'
        : 'Requests are addressed to the Public Information Officer (PIO) named on the Right to Information page.'),
    sources: [
      { title: B('Right to Information', 'సమాచార హక్కు'), path: '/ecitizen/rti' },
      { title: LABEL.contact, path: '/contact' },
      { title: LABEL.faqs, path: '/ecitizen/faqs' },
    ],
    followUps: [
      state.lang === 'te' ? 'RTI పత్రాలు ఏవి ప్రచురించబడ్డాయి?' : 'Which RTI documents are published?',
      state.lang === 'te' ? 'ప్రజా సమాచార అధికారి ఎవరు?' : 'Who is the Public Information Officer?',
    ],
  });
}

function tenderAnswer(state) {
  const all = state.data.collections?.tenders || [];
  if (!all.length) return null;
  const q = state.qLower;
  const wantsClosed = /closed|expired|past|మూస|ముగిసిన/.test(q);
  const wantsOpen = /open|live|current|closing|తెరిచి|ప్రస్తుత/.test(q);
  const status = wantsClosed && !wantsOpen ? 'closed' : wantsOpen && !wantsClosed ? 'open' : null;
  const lang = state.lang;

  let items = status ? all.filter((t) => t.status === status) : [...all];
  items.sort(status === 'closed' ? byDesc('closingDate') : byAsc('closingDate'));

  const extra = state.terms.filter((t) => !/tender|bid|emd|eoi|open|closed|expired|status|closing|date/.test(t) && t.length > 2);
  if (extra.length) {
    const filtered = items.filter((t) => {
      const hay = [text(t.title, 'en'), text(t.title, 'te'), t.tenderNo, t.department, t.district].join(' ').toLowerCase();
      return extra.some((t2) => hay.includes(t2) || hay.includes(stem(t2)));
    });
    if (filtered.length) items = filtered;
  }

  if (!items.length) {
    return reply(state, {
      intent: 'tenders',
      lead: status === 'open'
        ? (lang === 'te' ? 'ప్రస్తుతం తెరిచి ఉన్న టెండర్లు ఏవీ ప్రచురించబడలేదు.' : 'No open tenders are published on this website right now.')
        : (lang === 'te' ? 'ఆ స్థితిలో టెండర్లు ఏవీ ప్రచురించబడలేదు.' : 'No tenders with that status are published on this website right now.'),
      note: lang === 'te' ? 'టెండర్ పేజీలో మూసిన నోటీసులు కూడా ఉంటాయి.' : 'The tenders page also keeps closed notices for reference.',
      sources: [{ title: LABEL.tendersPage, path: '/tenders' }],
      followUps: [lang === 'te' ? 'మూసిన టెండర్లు చూపించు' : 'Show closed tenders'],
    });
  }

  const label = status === 'open' ? (lang === 'te' ? 'తెరిచి ఉన్న టెండర్లు' : 'open tenders')
    : status === 'closed' ? (lang === 'te' ? 'మూసిన టెండర్లు' : 'closed tenders')
      : (lang === 'te' ? 'టెండర్లు' : 'tenders');
  const n = items.length;
  const lead = lang === 'te'
    ? `ఈ వెబ్‌సైట్‌లో ${n} ${label} ప్రచురించబడ్డాయి.`
    : `This website publishes ${n} ${label}.`;
  const next = items[0];
  const bullets = items.slice(0, 4).map((t) => ({
    label: t.tenderNo || LABEL.tenderNo,
    value: `${text(t.title, lang)} — ${lang === 'te' ? 'ముగింపు' : 'closes'} ${formatDate(t.closingDate, lang)}`,
  }));
  return reply(state, {
    intent: 'tenders',
    lead,
    bullets,
    note: next
      ? (lang === 'te'
        ? `తదుపరి ముగింపు తేదీ ${formatDate(next.closingDate, lang)}.`
        : `The nearest closing date is ${formatDate(next.closingDate, lang)}.`)
      : '',
    sources: [
      { title: LABEL.tendersPage, path: status === 'open' ? '/tenders?status=open' : '/tenders' },
    ],
    followUps: [
      status === 'closed' ? (lang === 'te' ? 'తెరిచి ఉన్న టెండర్లు చూపించు' : 'Show open tenders')
        : (lang === 'te' ? 'మూసిన టెండర్లు చూపించు' : 'Show closed tenders'),
      lang === 'te' ? 'టెండర్ పత్రాన్ని ఎలా డౌన్‌లోడ్ చేయాలి?' : 'How do I download a tender document?',
    ],
  });
}

const DISTRICT_NOISE = /^(district|districts|institution|institutions|activity|activities|జిల్ల|సంస్థ|కార్యక్రమ)/;

function districtAnswer(state) {
  const districts = state.data.collections?.districts || [];
  if (!districts.length) return null;
  const lang = state.lang;
  const named = findDistrict(state.data, state.qLower);

  if (named) {
    const bullets = [];
    (named.institutions || []).slice(0, 4).forEach((i) => bullets.push({ label: i.type || LABEL.institutions, value: i.name }));
    if ((named.activities || []).length) {
      bullets.push({ label: LABEL.activities, value: named.activities.map((a) => text(a, lang)).join(' · ') });
    }
    return reply(state, {
      intent: 'districts',
      lead: lang === 'te'
        ? `${text(named.name, lang)} జిల్లా — ప్రధాన కేంద్రం ${named.hq}.`
        : `${text(named.name, lang)} district — headquarters ${named.hq}.`,
      bullets,
      note: lang === 'te' ? 'వివరాలు జిల్లా అన్వేషిణి పేజీలో ఉన్నాయి.' : 'The District Explorer page lists every institution and activity for this district.',
      sources: [{ title: named.name, path: `/districts?district=${encodeURIComponent(named.id)}` }, { title: LABEL.districtsPage, path: '/districts' }],
      followUps: [lang === 'te' ? 'అన్ని జిల్లాలు చూపించు' : 'Show all districts'],
    });
  }

  const terms = state.terms.filter((t) => !DISTRICT_NOISE.test(t) && t.length > 2);
  if (terms.length) {
    const partsOf = (d) => (d.institutions || []).map((i) => text(i.name, lang))
      .concat((d.activities || []).map((a) => text(a, lang)))
      .filter(Boolean);
    const hasTerm = (part, term) => {
      const lower = part.toLowerCase();
      return lower.includes(term) || lower.includes(stem(term));
    };
    const scored = districts.map((d) => {
      const parts = partsOf(d);
      const hits = terms.filter((t) => parts.some((p) => hasTerm(p, t))).length;
      const where = parts.find((p) => terms.some((t) => hasTerm(p, t))) || '';
      return { d, hits, where };
    });
    const exact = scored.filter((x) => x.hits === terms.length);
    let matches = exact.length ? exact : scored.filter((x) => x.hits > 0);
    matches = matches.sort((a, b) => b.hits - a.hits);
    if (matches.length) {
      return reply(state, {
        intent: 'districts',
        lead: lang === 'te'
          ? `మీ ప్రశ్నకు సరిపోయే సంస్థలు లేదా కార్యక్రమాలు ${matches.length} జిల్లాల్లో ఉన్నాయి.`
          : `${matches.length} ${matches.length === 1 ? 'district lists' : 'districts list'} institutions or activities matching your question.`,
        bullets: matches.slice(0, 4).map(({ d, where }) => ({ label: text(d.name, lang), value: where })),
        note: lang === 'te' ? 'ప్రతి జిల్లా పేజీ దాని సంస్థలను, కార్యక్రమాలను చూపుతుంది.' : 'Each district page lists its institutions and activities in full.',
        sources: matches.slice(0, 3).map(({ d }) => ({ title: d.name, path: `/districts?district=${encodeURIComponent(d.id)}` })),
        followUps: [lang === 'te' ? 'అన్ని జిల్లాలు చూపించు' : 'Show all districts'],
      });
    }
    return null;
  }

  return reply(state, {
    intent: 'districts',
    lead: lang === 'te'
      ? `ఈ వెబ్‌సైట్ ${districts.length} జిల్లాలను కవర్ చేస్తుంది, ప్రతి జిల్లాకు సంస్థలు మరియు కార్యక్రమాలు ఉన్నాయి.`
      : `This website covers ${districts.length} districts, each with its own institutions and activities.`,
    bullets: districts.slice(0, 4).map((d) => ({ label: text(d.name, lang), value: d.hq })),
    sources: [{ title: LABEL.districtsPage, path: '/districts' }],
    followUps: districts.slice(0, 2).map((d) => (lang === 'te'
      ? `${text(d.name, lang)}లో ఏ సంస్థలు ఉన్నాయి?`
      : `Which institutions are in ${text(d.name, lang)}?`)),
  });
}

function newsAnswer(state) {
  const items = [...(state.data.collections?.news || [])].sort(byDesc('date'));
  if (!items.length) return null;
  const lang = state.lang;
  return reply(state, {
    intent: 'news',
    lead: lang === 'te' ? 'ఈ వెబ్‌సైట్‌లో ప్రచురించిన తాజా నవీకరణలు:' : 'These are the latest updates published on this website.',
    bullets: items.slice(0, 4).map((n) => ({ label: formatDate(n.date, lang), value: n.title })),
    sources: [
      ...items.slice(0, 2).map((n) => ({ title: n.title, path: localPath(n.link) || '/', type: 'news' })),
      { title: LABEL.latest, path: '/' },
    ],
    followUps: [lang === 'te' ? 'రాబోయే కార్యక్రమాలు చూపించు' : 'Show upcoming events'],
  });
}

function eventsAnswer(state) {
  const items = (state.data.collections?.events || []).filter((e) => e.status !== 'past' && String(e.date || '') >= today());
  if (!items.length) return null;
  items.sort(byAsc('date'));
  const lang = state.lang;
  return reply(state, {
    intent: 'events',
    lead: lang === 'te'
      ? `${items.length} రాబోయే కార్యక్రమాలు ఈ వెబ్‌సైట్‌లో ఉన్నాయి.`
      : `${items.length} upcoming ${items.length === 1 ? 'event is' : 'events are'} listed on this website.`,
    bullets: items.slice(0, 4).map((e) => ({
      label: formatDate(e.date, lang),
      value: [text(e.title, lang), text(e.location, lang)].filter(Boolean).join(' · '),
    })),
    sources: [{ title: LABEL.events, path: '/media/events' }, { title: LABEL.latest, path: '/' }],
    followUps: [lang === 'te' ? 'తాజా నవీకరణలు చూపించు' : 'Show the latest updates'],
  });
}

function policiesAnswer(state) {
  const items = ranked(state, { types: ['policy'], limit: 4 });
  if (!items.length) return null;
  const lang = state.lang;
  const total = (state.data.collections?.policies || []).length;
  const best = items[0];
  const strong = best.score >= 8 && (!items[1] || best.score > items[1].score * 1.15);

  if (strong) {
    const rec = best.rec;
    const summary = passage(rec, state.terms, lang, 320);
    return reply(state, {
      intent: 'policies',
      lead: summary || (lang === 'te'
        ? `${rec.title[lang] || rec.title.en} ఈ వెబ్‌సైట్‌లో ప్రచురించబడింది.`
        : `${rec.title[lang] || rec.title.en} is published on this website.`),
      bullets: items.slice(1).map(({ rec: r }) => ({ label: TYPE_LABEL.policy, value: r.title[lang] || r.title.en })),
      note: lang === 'te' ? `మూలం: ${rec.title[lang] || rec.title.en}` : `From the ${rec.title[lang] || rec.title.en} page.`,
      sources: items.map(({ rec: r }) => ({ title: r.title, path: r.path, type: 'policy' })),
      followUps: [lang === 'te' ? 'ఈ విధానం కింద ప్రోత్సాహకాలు ఏవి?' : 'What incentives does this policy offer?'],
    });
  }

  return reply(state, {
    intent: 'policies',
    lead: items[0].score >= 6
      ? (lang === 'te' ? 'ఈ వెబ్‌సైట్‌లో ఈ విధానం ప్రచురించబడింది:' : 'This website publishes the following policy:')
      : (lang === 'te'
        ? `ఈ వెబ్‌సైట్‌లో ${total} రంగ విధానాలు ఉన్నాయి. మీ ప్రశ్నకు సంబంధించినవి:`
        : `This website publishes ${total} sector policies. These match your question:`),
    bullets: items.map(({ rec }) => ({
      label: rec.facts.find((f) => f.label === LABEL.sector)?.value || TYPE_LABEL.policy,
      value: rec.title[lang] || rec.title.en,
    })),
    sources: items.slice(0, 3).map(({ rec }) => ({ title: rec.title, path: rec.path, type: 'policy' })),
    followUps: [lang === 'te' ? 'పెట్టుబడిదారుల ప్రోత్సాహకాలు ఏవి?' : 'What incentives are available for investors?'],
  });
}

function documentsAnswer(state) {
  const all = state.data.collections?.documents || [];
  if (!all.length) return null;
  const lang = state.lang;
  if (/it act|information technology act|posh|వేధింపుల/.test(state.qLower)) return null;

  const types = [];
  if (/\bg\.?o\b|government order|ఉత్తర్వ/.test(state.qLower)) types.push('go');
  if (/notification|నోటిఫికేషన్/.test(state.qLower)) types.push('notification');
  if (/circular|సర్క్యులర్/.test(state.qLower)) types.push('circular');
  if (/\bact\b|చట్ట/.test(state.qLower)) types.push('act');
  if (/\brule/.test(state.qLower)) types.push('rule');
  if (/guideline|మార్గదర్శక/.test(state.qLower)) types.push('guideline');

  let items = types.length ? all.filter((d) => types.includes(d.type)) : [...all];
  items.sort(byDesc('date'));
  const extra = state.terms.filter((t) => !/document|documents|download|pdf|order|orders|notification|circular|act|rule|rules|guideline|guidelines|government|g\.o|పత్ర|చట్ట|నియమ|మార్గదర్శక/.test(t) && t.length > 2);
  if (extra.length) {
    const filtered = items.filter((d) => {
      const hay = [text(d.title, 'en'), text(d.title, 'te'), d.number, d.department].join(' ').toLowerCase();
      return extra.some((t) => hay.includes(t) || hay.includes(stem(t)));
    });
    if (!filtered.length) return null;
    items = filtered;
  }

  const typeName = types.length === 1
    ? { go: B('government orders', 'ప్రభుత్వ ఆదేశాలు'), notification: B('notifications', 'నోటిఫికేషన్లు'), circular: B('circulars', 'సర్క్యులర్లు'), act: B('Acts', 'చట్టాలు'), rule: B('rules', 'నియమాలు'), guideline: B('guidelines', 'మార్గదర్శకాలు') }[types[0]]
    : B('documents', 'పత్రాలు');
  return reply(state, {
    intent: 'documents',
    lead: lang === 'te'
      ? `${items.length} ${pick(typeName, lang)} ఈ వెబ్‌సైట్‌లో ప్రచురించబడ్డాయి.`
      : `${items.length} ${pick(typeName, lang)} ${items.length === 1 ? 'is' : 'are'} published on this website.`,
    bullets: items.slice(0, 4).map((d) => ({
      label: d.number,
      value: `${text(d.title, lang)} — ${formatDate(d.date, lang)}`,
    })),
    sources: items.slice(0, 3).map((d) => ({ title: d.title, path: docPath(d), type: 'document' })),
    followUps: [lang === 'te' ? 'టెండర్లు చూపించు' : 'Show open tenders'],
  });
}

function capabilitiesAnswer(state) {
  const lang = state.lang;
  const c = state.data.collections || {};
  const counts = [
    { label: LABEL.organisations, value: (c.organisations || []).length },
    { label: LABEL.policies, value: (c.policies || []).length },
    { label: LABEL.tenders, value: (c.tenders || []).length },
    { label: LABEL.documents, value: (c.documents || []).length },
    { label: LABEL.districts, value: (c.districts || []).length },
  ].filter((x) => x.value > 0);
  if (!counts.length) return null;
  return reply(state, {
    intent: 'capabilities',
    lead: lang === 'te'
      ? 'నేను ఈ వెబ్‌సైట్‌లో ప్రచురించిన విషయం నుండి మాత్రమే సమాధానం చెబుతాను, ప్రతి సమాధానంతో మూల పేజీ లింక్ ఉంటుంది. ఇలా అడగవచ్చు:'
      : 'I answer only from the content published on this website, and every answer links to its source page. You can ask me about:',
    bullets: counts.map((x) => ({ label: x.label, value: String(x.value) })),
    note: lang === 'te' ? 'సమాధానం దొరకకపోతే వెబ్‌సైట్ శోధనను ఉపయోగించండి.' : 'If the website does not cover something, I say so instead of guessing.',
    sources: [{ title: LABEL.help, path: '/help' }, { title: LABEL.contact, path: '/contact' }],
    followUps: suggestions(state.data, lang).slice(0, 3),
  });
}

function faqAnswer(state, hit) {
  const faq = (state.data.collections?.faqs || []).find((f) => `faq-${f.id}` === hit.rec.id);
  if (!faq) return null;
  const lang = state.lang;
  const answer = text(faq.a, lang);
  if (!answer) return null;
  const others = (state.data.collections?.faqs || [])
    .filter((f) => f.id !== faq.id)
    .slice(0, 2)
    .map((f) => text(f.q, lang));
  return reply(state, {
    intent: 'faq',
    lead: answer,
    note: lang === 'te' ? 'ఇది శాఖ ప్రచురించిన తరచుగా అడిగే ప్రశ్నల నుండి.' : 'Answered in the FAQs published by the Department.',
    sources: [{ title: LABEL.faqs, path: '/ecitizen/faqs' }, { title: LABEL.contact, path: '/contact' }],
    followUps: others,
  });
}

function generalAnswer(state) {
  const hits = ranked(state, { limit: 4 });
  if (!hits.length || hits[0].score < 3) return null;
  const best = hits[0].rec;
  if (best.type === 'faq') return faqAnswer(state, hits[0]);
  const lang = state.lang;
  const lead = passage(best, state.terms, lang);
  if (!lead) return null;
  const related = hits.slice(1, 4);
  return reply(state, {
    intent: 'content',
    lead,
    bullets: related.map(({ rec }) => ({
      label: TYPE_LABEL[rec.type] || TYPE_LABEL.page,
      value: rec.title[lang] || rec.title.en,
    })),
    note: lang === 'te' ? 'ఇది ఈ వెబ్‌సైట్‌లో ప్రచురించిన విషయం నుండి తీసుకోబడింది.' : 'Taken from the content published on this website.',
    sources: [{ title: best.title, path: best.path, type: best.type }, ...related.map(({ rec }) => ({ title: rec.title, path: rec.path, type: rec.type }))],
    followUps: related.slice(0, 2).map(({ rec }) => (rec.title[lang] || rec.title.en).slice(0, 70)),
  });
}

// -------------------------------------------------------------- intent routing

const INTENTS = [
  { id: 'capabilities', weight: 0.9, words: ['what can you', 'who are you', 'how can you help', 'what do you do', 'help me', 'ఏం చేయగల', 'సహాయం చేయ'] },
  { id: 'rti', weight: 1.5, words: ['rti', 'right to information', 'information officer', 'pio', 'సమాచార హక్కు', 'ఆర్టీఐ'] },
  { id: 'tenders', weight: 1.35, words: ['tender', 'bid', 'emd', 'eoi', 'expression of interest', 'టెండర', 'బిడ్'] },
  { id: 'contact', weight: 1.2, words: ['contact', 'phone', 'telephone', 'email', 'e-mail', 'address', 'fax', 'office', 'feedback', 'reach', 'సంప్రదించ', 'ఫోన్', 'ఇమెయిల్', 'చిరునామా', 'కార్యాలయ', 'అభిప్రాయ'] },
  { id: 'districts', weight: 1.25, words: ['district', 'జిల్లా', 'జిల్లాలు'] },
  { id: 'policies', weight: 1.05, words: ['policy', 'policies', 'విధాన'] },
  { id: 'documents', weight: 1, words: ['government order', 'g.o', 'notification', 'circular', 'act', 'rules', 'guideline', 'download', 'pdf', 'document', 'ఉత్తర్వ', 'నోటిఫికేషన్', 'సర్క్యులర్', 'చట్ట', 'నియమ', 'మార్గదర్శక', 'పత్ర'] },
  { id: 'news', weight: 0.95, words: ['news', 'latest', 'update', 'announcement', 'వార్త', 'తాజా', 'నవీకరణ'] },
  { id: 'events', weight: 0.95, words: ['event', 'workshop', 'conference', 'seminar', 'expo', 'conclave', 'కార్యక్రమ', 'సదస్సు', 'వర్క్షాప్'] },
];

const GREETING = /(^|\s)(hi|hello|hey|namaste|నమస్తే|హాయ్)(\s|$)/;

/** Match a keyword at a word start, so "rti" never matches "participate". */
function keywordMatch(q, word) {
  if (/[\u0c00-\u0c7f]/.test(word)) return q.includes(word);
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${escaped}[a-z]*([^a-z0-9]|$)`, 'i').test(q);
}

function detectIntent(qLower) {
  if (GREETING.test(qLower.trim())) return 'capabilities';
  let best = null;
  for (const intent of INTENTS) {
    const matches = intent.words.filter((w) => keywordMatch(qLower, w)).length;
    if (!matches) continue;
    const score = matches * intent.weight;
    if (!best || score > best.score) best = { id: intent.id, score };
  }
  return best ? best.id : null;
}

const HANDLERS = {
  capabilities: capabilitiesAnswer,
  rti: rtiAnswer,
  contact: contactAnswer,
  tenders: tenderAnswer,
  districts: districtAnswer,
  news: newsAnswer,
  events: eventsAnswer,
  policies: policiesAnswer,
  documents: documentsAnswer,
};

// --------------------------------------------------------------------- public

function stateFor(data, question, lang) {
  const q = String(question || '').replace(/\s+/g, ' ').trim().slice(0, 240);
  return {
    data,
    lang,
    q,
    qLower: ` ${q.toLowerCase()} `,
    terms: tokenize(q),
    records: buildRecords(data),
  };
}

const none = () => ({ matched: false, intent: null, lang: 'en', lead: '', bullets: [], note: '', sources: [], followUps: [] });

/**
 * Answer a question from the website's own published content.
 * `previousIntent` keeps the thread of a conversation, so a follow-up such as
 * "what about the closed ones?" is answered in the context of the last answer;
 * `previous` (the earlier question) is the fallback for content questions.
 */
export function ask(data, question, lang = 'en', { previous = '', previousIntent = null } = {}) {
  if (!data || !data.collections) return none();
  const state = stateFor(data, question, lang);
  // Does this question itself mention something the site publishes? Without
  // that, neither the previous topic nor the previous question may be used —
  // otherwise unrelated words would inherit an answer from the conversation.
  const ownSignal = state.terms.some((term) => {
    const s = stem(term);
    return state.records.some((r) => r.hayLower.includes(term) || (s !== term && r.hayLower.includes(s)));
  });
  const intent = detectIntent(state.qLower)
    || (findDistrict(data, state.qLower) ? 'districts' : null)
    || (ownSignal ? previousIntent : null);
  const handler = intent ? HANDLERS[intent] : null;
  let answer = handler ? handler(state) : null;
  if (!answer) answer = generalAnswer(state);
  if (!answer && previous && ownSignal) {
    answer = generalAnswer(stateFor(data, `${previous} ${question}`, lang));
  }
  if (!answer) return { ...none(), lang };
  return answer;
}

/** Dynamic opening suggestions, built from what the site actually publishes. */
export function suggestions(data, lang = 'en', limit = 4) {
  if (!data || !data.collections) return [];
  const c = data.collections;
  const out = [];
  (c.faqs || []).slice(0, 2).forEach((f) => out.push(text(f.q, lang)));
  if ((c.tenders || []).some((t) => t.status === 'open')) {
    out.push(lang === 'te' ? 'తెరిచి ఉన్న టెండర్లు చూపించు' : 'Show the open tenders');
  }
  // Name a district that actually publishes institutions, not whichever row
  // happens to sort first in the CMS.
  const d = [...(c.districts || [])]
    .filter((x) => text(x.name, lang) && (x.institutions || []).length > 0)
    .sort((a, b) => (b.institutions || []).length - (a.institutions || []).length)[0];
  if (d) {
    out.push(lang === 'te'
      ? `${text(d.name, lang)}లో ఏ సంస్థలు ఉన్నాయి?`
      : `Which institutions are in ${text(d.name, lang)}?`);
  }
  if ((c.policies || []).length) {
    out.push(lang === 'te' ? 'పెట్టుబడిదారుల ప్రోత్సాహకాలు ఏవి?' : 'What incentives are available for investors?');
  }
  return [...new Set(out.filter(Boolean))].slice(0, limit);
}
