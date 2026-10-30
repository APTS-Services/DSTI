// Site-wide search over all published content. "Ask Vigyan Mitra" uses the
// richer records in utils/assistant.js, which answers from the same content.

const bi = (v) => (v && typeof v === 'object' ? `${v.en || ''} ${v.te || ''}` : v || '');
const one = (v, lang) => (v && typeof v === 'object' ? v[lang] || v.en || '' : v || '');
const flat = (vals, lang) => vals.flat(3).filter(Boolean).map((v) => one(v, lang)).join(' ').replace(/\s+/g, ' ').trim();
// Text is kept per language so answers are shown in the visitor's language.
const join = (...vals) => ({ en: flat(vals, 'en'), te: flat(vals, 'te') });

function rec(id, type, title, text, path, meta = {}) {
  const titleObj = title && typeof title === 'object' ? title : { en: title || '', te: title || '' };
  const t = typeof text === 'string' ? { en: text, te: text } : text;
  return { id, type, titleObj, text: t, path, meta, haystack: `${bi(title)} ${t.en} ${t.te}`.toLowerCase(), titleLower: bi(title).toLowerCase() };
}

export const docPath = (d) => {
  if (d.topic === 'it-act') return '/ecitizen/it-act-2000';
  if (d.topic === 'posh') return '/ecitizen/posh-act';
  if (d.type === 'go') return '/ecitizen/government-orders';
  if (d.type === 'notification' || d.type === 'circular') return '/ecitizen/notifications';
  if (d.type === 'act' || d.type === 'rule') return '/ecitizen/acts';
  return '/ecitizen/guidelines';
};

const PAGE_PATHS = {
  rti: '/ecitizen/rti', 'it-act-2000': '/ecitizen/it-act-2000', 'posh-act': '/ecitizen/posh-act',
  'screen-reader-access': '/screen-reader-access', help: '/help', ecitizen: '/ecitizen',
};
export const pagePath = (id) => PAGE_PATHS[id] || `/policies/${id}`;

const cache = new WeakMap();

export function buildIndex(data) {
  if (cache.has(data)) return cache.get(data);
  const c = data.collections || {};
  const s = data.settings || {};
  const L = (name) => c[name] || [];
  const r = [];

  r.push(rec('about', 'page', { en: 'About the Department', te: 'శాఖ గురించి' }, join(s.about?.intro, s.about?.mission), '/about'));
  r.push(rec('objectives', 'page', { en: 'Objectives', te: 'లక్ష్యాలు' }, join(s.about?.objectives), '/about/objectives'));
  r.push(rec('structure', 'page', { en: 'Organisation Structure', te: 'సంస్థాగత నిర్మాణం' }, join(s.about?.orgStructure), '/about/organisation'));
  r.push(rec('investors', 'page', { en: "Investor's Corner", te: 'పెట్టుబడిదారుల విభాగం' }, join(s.investors?.intro, s.investors?.whyInvest, L('investorIncentives').map((i) => [i.title, i.detail])), '/investors'));
  r.push(rec('contact', 'page', { en: 'Contact Us', te: 'సంప్రదించండి' }, join('head office address phone email officers feedback', s.contact?.headOffice, s.contact?.email, s.contact?.phone), '/contact'));
  r.push(rec('feedback', 'page', { en: 'Feedback & Suggestions', te: 'అభిప్రాయాలు & సూచనలు' }, 'feedback suggestion grievance complaint track reference status reply response time dashboard', '/feedback'));
  r.push(rec('districts', 'page', { en: 'District Explorer', te: 'జిల్లా అన్వేషిణి' }, 'district map 26 districts science institutions activities andhra pradesh', '/districts'));

  L('organisations').forEach((o) => r.push(rec(`org-${o.id}`, 'organisation', o.name, join(o.abbr, o.category, o.summary, o.functions), `/organisations/${o.id}`)));
  L('policies').forEach((p) => r.push(rec(`pol-${p.id}`, 'policy', p.name, join(p.sector, p.summary, p.objectives, p.incentives), `/policies/${p.id}`)));
  L('egov').forEach((e) => r.push(rec(`egov-${e.id}`, 'ict', e.name, join(e.summary, e.tags), '/ict')));
  L('projects').forEach((p) => r.push(rec(`proj-${p.id}`, 'ict', p.name, join(p.sector, p.summary), '/ict/projects')));
  L('tenders').forEach((t) => r.push(rec(`t-${t.id}`, 'tender', t.title, join(t.tenderNo, t.department, t.status), '/tenders', { status: t.status })));
  L('documents').forEach((d) => r.push(rec(`d-${d.id}`, 'document', d.title, join(d.number, d.department, d.type), docPath(d))));
  L('events').forEach((e) => r.push(rec(`e-${e.id}`, 'event', e.title, join(e.category, e.location, e.summary), '/media/events')));
  L('scienceStories').forEach((v) => r.push(rec(`v-${v.id}`, 'video', v.title, join(v.category, v.summary), '/media/science-stories')));
  L('faqs').forEach((f) => r.push(rec(`f-${f.id}`, 'faq', f.q, join(f.a), '/ecitizen/faqs')));
  L('awards').forEach((y) => (y.awards || []).forEach((a, i) => r.push(rec(`a-${y.id}-${i}`, 'award', a.name, join(a.recipient, a.field, String(y.year)), `/about/awards?year=${y.year}`))));
  L('districts').forEach((d) => r.push(rec(`dist-${d.id}`, 'district', d.name, join(d.hq, (d.institutions || []).map((x) => x.name), d.activities), `/districts?district=${d.id}`)));
  L('pages').forEach((p) => r.push(rec(`p-${p.id}`, 'page', p.title, join(p.subtitle, (p.sections || []).map((x) => [x.heading, x.body])), pagePath(p.id))));
  L('news').forEach((n) => r.push(rec(`n-${n.id}`, 'news', n.title, join(n.category), n.link || '/')));

  cache.set(data, r);
  return r;
}

const STOP = new Set(['the', 'a', 'an', 'of', 'to', 'in', 'and', 'or', 'for', 'on', 'is', 'are', 'what', 'how', 'where', 'when', 'can', 'i', 'do', 'does', 'me', 'my', 'you', 'your', 'about', 'with', 'at', 'which', 'who', 'there', 'any']);

const tokenize = (q) => q.toLowerCase().replace(/[^a-z0-9ఀ-౿\s]/g, ' ').split(/\s+/).filter((t) => t.length > 1 && !STOP.has(t));

export function search(data, query, { limit = 25, lang = 'en' } = {}) {
  const terms = tokenize(query || '');
  if (!terms.length) return [];
  return buildIndex(data)
    .map((r) => {
      let score = 0;
      let hits = 0;
      for (const t of terms) {
        const stem = t.length > 4 ? t.slice(0, t.length - 2) : t;
        if (r.titleLower.includes(t)) score += 6;
        if (r.haystack.includes(t)) { score += 2; hits += 1; } else if (r.haystack.includes(stem)) { score += 1; hits += 1; }
      }
      if (hits === terms.length) score += 3;
      return { r, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ r, score }) => ({ ...r, score, snippet: snippet(r.text[lang] || r.text.en, terms) }));
}

function snippet(text, terms) {
  const lower = text.toLowerCase();
  let at = -1;
  for (const t of terms) {
    at = lower.indexOf(t);
    if (at >= 0) break;
  }
  if (at < 0) return text.slice(0, 160);
  const start = Math.max(0, at - 60);
  return `${start > 0 ? '… ' : ''}${text.slice(start, start + 180).trim()}${text.length > start + 180 ? ' …' : ''}`;
}
