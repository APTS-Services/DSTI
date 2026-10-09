// src/utils/searchIndex.js
// Builds a searchable index over all published site content.
// Powers (a) the site-wide search overlay / results page and
// (b) the "Ask Vigyan Mitra" assistant, which answers only from this content.

import { organisations } from '../data/organisations';
import { policies } from '../data/policies';
import { eGovernance, projects } from '../data/ict';
import { tenders } from '../data/tenders';
import { documents } from '../data/documents';
import { events } from '../data/events';
import { scienceStories } from '../data/scienceStories';
import { faqs } from '../data/faqs';
import { news } from '../data/news';
import { awardYears, aboutIntro, mission, objectives } from '../data/about';
import { districts } from '../data/districts';
import { statutoryPages } from '../data/statutory';
import { whyInvest, investorIntro, investorIncentives } from '../data/investors';

const join = (...vals) =>
  vals
    .flat()
    .filter(Boolean)
    .map((v) => (typeof v === 'string' ? v : `${v.en || ''} ${v.te || ''}`))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

const bilingual = (v) => (v && typeof v === 'object' ? `${v.en || ''} ${v.te || ''}` : v || '');

function makeRecord({ id, type, title, text, path, meta }) {
  return {
    id,
    type,
    title: bilingual(title),
    titleObj: typeof title === 'object' ? title : { en: title, te: title },
    text,
    haystack: `${bilingual(title)} ${text}`.toLowerCase(),
    path,
    meta: meta || {},
  };
}

// Build the index once on first use.
let INDEX = null;

export function buildSearchIndex() {
  if (INDEX) return INDEX;
  const records = [];

  // Pages / sections
  const staticPages = [
    { id: 'page-home', title: { en: 'Home', te: 'హోమ్' }, text: 'DSTI department of science technology innovation Andhra Pradesh home', path: '/' },
    { id: 'page-about', title: { en: 'About the Department', te: 'శాఖ పరిచయం' }, text: join(aboutIntro, mission), path: '/about' },
    { id: 'page-objectives', title: { en: 'Objectives', te: 'లక్ష్యాలు' }, text: join(objectives), path: '/about/objectives' },
    { id: 'page-districts', title: { en: 'District Explorer', te: 'జిల్లా అన్వేషకుడు' }, text: 'district map 26 districts science institutions activities andhra pradesh', path: '/districts' },
    { id: 'page-connect', title: { en: 'How it all connects', te: 'అన్నీ ఎలా అనుసంధానమవుతాయి' }, text: 'organisations policies sectors connections', path: '/how-it-connects' },
    { id: 'page-investors', title: { en: "Investor's Corner", te: 'పెట్టుబడిదారుల విభాగం' }, text: join(investorIntro, whyInvest, investorIncentives.map((i) => [i.title, i.detail])), path: '/investors' },
    { id: 'page-ecitizen', title: { en: 'e-Citizen', te: 'ఇ-పౌరుడు' }, text: 'rti acts rules government orders notifications policies guidelines faqs useful links it act posh', path: '/ecitizen' },
    { id: 'page-contact', title: { en: 'Contact Us', te: 'సంప్రదించండి' }, text: 'head office officers feedback contact department', path: '/contact' },
  ];
  staticPages.forEach((p) => records.push(makeRecord({ ...p, type: 'page' })));

  // Organisations
  organisations.forEach((o) =>
    records.push(
      makeRecord({
        id: `org-${o.id}`,
        type: 'organisation',
        title: o.name,
        text: join(o.summary, o.functions, o.category, o.abbr),
        path: `/organisations/${o.id}`,
        meta: { abbr: o.abbr, category: o.category },
      })
    )
  );

  // Policies
  policies.forEach((p) =>
    records.push(
      makeRecord({
        id: `policy-${p.id}`,
        type: 'policy',
        title: p.name,
        text: join(p.summary, p.objectives, p.incentives, p.sector),
        path: `/policies/${p.id}`,
        meta: { sector: p.sector, year: p.year },
      })
    )
  );

  // ICT
  eGovernance.forEach((e) =>
    records.push(makeRecord({ id: `egov-${e.id}`, type: 'ict', title: e.name, text: join(e.summary, e.tags), path: '/ict' }))
  );
  projects.forEach((p) =>
    records.push(makeRecord({ id: `proj-${p.id}`, type: 'ict', title: p.name, text: join(p.summary, p.sector), path: '/ict/projects' }))
  );

  // Tenders
  tenders.forEach((t) =>
    records.push(
      makeRecord({
        id: `tender-${t.id}`,
        type: 'tender',
        title: t.title,
        text: join(t.tenderNo, t.department, t.status),
        path: '/tenders',
        meta: { status: t.status, number: t.tenderNo },
      })
    )
  );

  // Documents — route each type to its e-Citizen page.
  const docPath = (d) => {
    if (d.id.startsWith('it-')) return '/ecitizen/it-act-2000';
    if (d.id.startsWith('posh')) return '/ecitizen/posh-act';
    if (d.type === 'go') return '/ecitizen/government-orders';
    if (d.type === 'notification' || d.type === 'circular') return '/ecitizen/notifications';
    if (d.type === 'act' || d.type === 'rule') return '/ecitizen/acts';
    return '/ecitizen/guidelines';
  };
  documents.forEach((d) =>
    records.push(
      makeRecord({
        id: `doc-${d.id}`,
        type: 'document',
        title: d.title,
        text: join(d.number, d.department, d.type),
        path: docPath(d),
        meta: { number: d.number, docType: d.type },
      })
    )
  );

  // Events
  events.forEach((e) =>
    records.push(
      makeRecord({ id: `event-${e.id}`, type: 'event', title: e.title, text: join(e.summary, e.category, e.location), path: '/media/events', meta: { date: e.date, status: e.status } })
    )
  );

  // Science stories
  scienceStories.forEach((s) =>
    records.push(makeRecord({ id: `story-${s.id}`, type: 'video', title: s.title, text: join(s.summary, s.category), path: '/media/science-stories' }))
  );

  // FAQs
  faqs.forEach((f, i) =>
    records.push(makeRecord({ id: `faq-${i}`, type: 'faq', title: f.q, text: f.a, path: '/ecitizen/faqs' }))
  );

  // Awards
  awardYears.forEach((y) =>
    y.awards.forEach((a, i) =>
      records.push(
        makeRecord({ id: `award-${y.year}-${i}`, type: 'award', title: a.name, text: join(a.recipient, a.field), path: `/about/awards?year=${y.year}` })
      )
    )
  );

  // Districts
  districts.forEach((d) =>
    records.push(
      makeRecord({
        id: `district-${d.id}`,
        type: 'district',
        title: d.name,
        text: join(d.institutions.map((x) => x.name), d.activities, d.hq),
        path: `/districts?district=${d.id}`,
        meta: { districtId: d.id },
      })
    )
  );

  // Statutory pages
  statutoryPages.forEach((p) =>
    records.push(
      makeRecord({
        id: `statutory-${p.slug}`,
        type: 'page',
        title: p.title,
        text: join(p.sections.map((s) => [s.heading, s.body])),
        path: `/policies/${p.slug}`,
      })
    )
  );

  // News
  news.forEach((n) =>
    records.push(makeRecord({ id: `news-${n.id}`, type: 'news', title: n.title, text: n.category, path: n.link, meta: { date: n.date } }))
  );

  INDEX = records;
  return INDEX;
}

const STOP = new Set([
  'the', 'a', 'an', 'of', 'to', 'in', 'and', 'or', 'for', 'on', 'is', 'are', 'what', 'how',
  'where', 'when', 'can', 'i', 'do', 'does', 'me', 'my', 'you', 'your', 'about', 'with', 'at',
]);

function tokenize(q) {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9\u0C00-\u0C7F\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

/** Ranked full-text search across the site content. */
export function searchContent(query, { limit = 20, types } = {}) {
  const idx = buildSearchIndex();
  const terms = tokenize(query);
  if (!terms.length) return [];
  const pool = types ? idx.filter((r) => types.includes(r.type)) : idx;

  const scored = pool
    .map((r) => {
      let score = 0;
      for (const term of terms) {
        const inTitle = r.title.toLowerCase().includes(term);
        const inBody = r.haystack.includes(term);
        if (inTitle) score += 6;
        if (inBody) score += 2;
        // Partial / prefix match (helps for Telugu and inflections)
        if (r.haystack.includes(term.slice(0, Math.max(3, term.length - 2)))) score += 0.5;
      }
      return { record: r, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((s) => ({
    ...s.record,
    score: s.score,
    snippet: makeSnippet(s.record, terms),
  }));
}

function makeSnippet(record, terms) {
  const source = record.text;
  const lower = source.toLowerCase();
  let at = -1;
  for (const t of terms) {
    at = lower.indexOf(t);
    if (at >= 0) break;
  }
  if (at < 0) return source.slice(0, 140);
  const start = Math.max(0, at - 50);
  return (start > 0 ? '… ' : '') + source.slice(start, start + 150).trim() + (source.length > start + 150 ? ' …' : '');
}

/**
 * Vigyan Mitra: answer only from the site's own content and cite the source page.
 * Returns { answer, sources, matched }.
 */
export function askVigyanMitra(query) {
  const trimmed = (query || '').trim();
  if (!trimmed) {
    return { answer: '', sources: [], matched: false };
  }
  const results = searchContent(trimmed, { limit: 4 });
  if (!results.length) {
    return {
      answer:
        'I could not find an answer to that in the content published on this website. Please try rephrasing, use the site search, or contact the Department through the Contact Us page.',
      sources: [],
      matched: false,
    };
  }

  const best = results[0];
  const answer = `According to “${best.title}”: ${best.snippet}`;
  const sources = results.slice(0, 3).map((r) => ({ title: r.title, path: r.path, type: r.type }));
  return { answer, sources, matched: true };
}
