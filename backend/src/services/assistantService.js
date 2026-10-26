// src/services/assistantService.js — "Ask Vigyan Mitra".
//
// Answers are composed here, on the server, from the records published in MySQL
// — the same rows the website renders (tenders, documents, policies, districts,
// events, organisations, officers, contact details, RTI, news, FAQs). Nothing is
// hard-coded copy about those sections: every number, title and date is read
// from the database when the question is asked. When no section matches, the
// question falls back to the ranked site search, and the citation list always
// points at the page that holds the answer.
const contentRepository = require('../repositories/contentRepository');
const settingsRepository = require('../repositories/settingsRepository');
const searchRepository = require('../repositories/searchRepository');
const { normaliseLang, pick } = require('../utils/bilingual');
const { cleanString } = require('../utils/validate');
const ApiError = require('../utils/ApiError');

const MAX_BULLETS = 4;
const MAX_SOURCES = 3;

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'is', 'are', 'was', 'were', 'be', 'been',
  'what', 'how', 'do', 'does', 'did', 'can', 'i', 'we', 'you', 'me', 'my', 'our', 'it', 'this', 'that',
  'please', 'tell', 'about', 'with', 'from', 'at', 'by', 'as', 'if', 'when', 'where', 'which', 'who',
  'show', 'list', 'give', 'any', 'all', 'there', 'here', 'have', 'has', 'get', 'see', 'more', 'latest'
]);

const words = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));

const textOf = (value, lang) => {
  if (value && typeof value === 'object') return pick(value.en, value.te, lang) || '';
  return value == null ? '' : String(value);
};

const fmtDate = (value, lang) => {
  const iso = String(value || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(lang === 'te' ? 'te-IN' : 'en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC'
  });
};

const byDate = (field, direction = 1) => (a, b) =>
  direction * String(a[field] || '').localeCompare(String(b[field] || ''));

const today = () => new Date().toISOString().slice(0, 10);

/** Does the question mention one of the given words (whole words only)? */
const mentions = (text, pattern) => pattern.test(text);

// ---------------------------------------------------------------------------
// Answer builders — each returns null when the database has nothing to quote
// ---------------------------------------------------------------------------

async function tendersAnswer({ lang, qLower, previousIntent }) {
  const all = await contentRepository.list('tenders');
  if (!all.length) return null;

  const wantsClosed = /\b(closed|expired|past|archive|old)\b/.test(qLower) || (previousIntent === 'tenders' && /\bclosed\b/.test(qLower));
  const isOpen = (item) => item.status === 'open' && (!item.closingDate || item.closingDate >= today());
  const byClosing = (a, b) => byDate('closingDate')(a, b);

  let items = all.filter((item) => (wantsClosed ? !isOpen(item) : isOpen(item))).sort(byClosing);
  const empty = items.length === 0;
  // Nothing in the requested bucket: quote the most recent tenders instead of
  // answering with a bare zero, and say plainly that nothing is open.
  if (empty) items = [...all].sort(byClosing).reverse().slice(0, MAX_BULLETS);

  const n = items.length;
  const openCount = all.filter(isOpen).length;
  let lead;
  if (wantsClosed) {
    lead = lang === 'te'
      ? `ఈ వెబ్‌సైట్‌లో ${n} మూసివేసిన టెండర్లు ఉన్నాయి.`
      : `There ${n === 1 ? 'is' : 'are'} ${n} closed tender${n === 1 ? '' : 's'} in the archive.`;
  } else if (empty) {
    lead = lang === 'te'
      ? 'ప్రస్తుతం తెరిచి ఉన్న టెండర్లు లేవు. ఇటీవలి టెండర్లు ఇవి.'
      : 'No tender is open right now. These are the most recent tenders published.';
  } else {
    lead = lang === 'te'
      ? `ఈ వెబ్‌సైట్‌లో ప్రస్తుతం ${openCount} టెండర్లు తెరిచి ఉన్నాయి.`
      : `There ${openCount === 1 ? 'is' : 'are'} ${openCount} open tender${openCount === 1 ? '' : 's'} published on this website.`;
  }

  if (!n) {
    return {
      intent: 'tenders',
      lead,
      bullets: [],
      note: lang === 'te' ? 'తాజా టెండర్ల కోసం టెండర్ల పేజీ చూడండి.' : 'Check the Tenders page for the current list.',
      sources: [{ title: lang === 'te' ? 'టెండర్లు' : 'Tenders', url: '/tenders' }],
      followUps: []
    };
  }

  const bullets = items.slice(0, MAX_BULLETS).map((item) => ({
    label: item.tenderNo || textOf(item.title, lang),
    value: [
      textOf(item.title, lang),
      item.closingDate
        ? (lang === 'te' ? `చివరి తేదీ ${fmtDate(item.closingDate, lang)}` : `closes ${fmtDate(item.closingDate, lang)}`)
        : '',
      item.emd ? `EMD ${item.emd}` : ''
    ].filter(Boolean).join(' — ')
  }));

  return {
    intent: 'tenders',
    lead,
    bullets,
    note: lang === 'te'
      ? 'పూర్తి వివరాలు మరియు షరతుల కోసం టెండర్ పత్రాన్ని చదవండి.'
      : 'Always read the tender document for the full scope, EMD and submission conditions.',
    sources: [{ title: lang === 'te' ? 'టెండర్లు' : 'Tenders', url: '/tenders' }],
    followUps: wantsClosed
      ? [lang === 'te' ? 'తెరిచి ఉన్న టెండర్లు చూపించు' : 'Show the open tenders']
      : [lang === 'te' ? 'మూసివేసిన టెండర్లు చూపించు' : 'Show the closed tenders']
  };
}

const DOCUMENT_SECTIONS = [
  { key: 'go', re: /\b(go|gos|g\.o\.?|government order|government orders)\b/, path: '/ecitizen/government-orders', en: 'government orders', te: 'ప్రభుత్వ ఉత్తర్వులు' },
  { key: 'notification', re: /\bnotification/, path: '/ecitizen/notifications', en: 'notifications', te: 'నోటిఫికేషన్లు' },
  { key: 'circular', re: /\bcircular/, path: '/ecitizen/notifications', en: 'circulars', te: 'సర్క్యులర్లు' },
  { key: 'act', re: /\bacts?\b/, path: '/ecitizen/acts', en: 'Acts', te: 'చట్టాలు' },
  { key: 'rule', re: /\brules?\b/, path: '/ecitizen/acts', en: 'Rules', te: 'నియమాలు' },
  { key: 'guideline', re: /\bguideline/, path: '/ecitizen/guidelines', en: 'guidelines', te: 'మార్గదర్శకాలు' }
];

async function documentsAnswer({ lang, qLower }) {
  const section = DOCUMENT_SECTIONS.find((candidate) => candidate.re.test(qLower));
  const all = await contentRepository.list('documents');
  const items = (section ? all.filter((item) => item.type === section.key) : all)
    .sort((a, b) => byDate('date', -1)(a, b));
  if (!items.length) return null;

  const name = section ? (lang === 'te' ? section.te : section.en) : (lang === 'te' ? 'పత్రాలు' : 'documents');
  const lead = lang === 'te'
    ? `${name} విభాగంలో ${items.length} పత్రాలు ప్రచురించబడ్డాయి.`
    : `${items.length} ${name} ${items.length === 1 ? 'is' : 'are'} published in the document repository.`;

  return {
    intent: 'documents',
    lead,
    bullets: items.slice(0, MAX_BULLETS).map((item) => ({
      label: item.number || item.type,
      value: `${textOf(item.title, lang)}${item.date ? ` (${fmtDate(item.date, lang)})` : ''}`
    })),
    note: lang === 'te' ? 'ప్రతి పత్రం PDF రూపంలో అందుబాటులో ఉంది.' : 'Each record can be downloaded as a PDF from the repository.',
    sources: [{ title: lang === 'te' ? 'పత్రాల విభాగం' : (section ? name : 'Documents'), url: section ? section.path : '/ecitizen/government-orders' }],
    followUps: [lang === 'te' ? 'తాజా ప్రభుత్వ ఉత్తర్వులు చూపించు' : 'Show the latest government orders']
  };
}

async function policiesAnswer({ lang, qLower, terms }) {
  const all = await contentRepository.list('policies');
  if (!all.length) return null;

  const scored = all
    .map((item) => {
      const haystack = `${textOf(item.name, lang)} ${textOf(item.name, 'en')} ${item.sector || ''} ${textOf(item.summary, lang)}`.toLowerCase();
      return { item, score: terms.filter((term) => haystack.includes(term)).length };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (best && best.score > 0) {
    const item = best.item;
    const bullets = [
      item.sector ? { label: lang === 'te' ? 'రంగం' : 'Sector', value: String(item.sector) } : null,
      item.year ? { label: lang === 'te' ? 'సంవత్సరం' : 'Year', value: String(item.year) } : null,
      item.status ? { label: lang === 'te' ? 'స్థితి' : 'Status', value: String(item.status) } : null,
      textOf(item.summary, lang) ? { label: lang === 'te' ? 'సారాంశం' : 'Summary', value: textOf(item.summary, lang) } : null
    ].filter(Boolean);

    return {
      intent: 'policies',
      lead: lang === 'te'
        ? `${textOf(item.name, lang)} — ఈ విధానం గురించి వెబ్‌సైట్‌లో ఉన్న సమాచారం.`
        : `${textOf(item.name, lang)} — this is what the website publishes about the policy.`,
      bullets: bullets.slice(0, MAX_BULLETS),
      note: (item.objectives || []).length
        ? `${lang === 'te' ? 'లక్ష్యాలు' : 'Objectives'}: ${(item.objectives || []).slice(0, 2).map((o) => textOf(o, lang)).join('; ')}`
        : '',
      sources: [{ title: textOf(item.name, lang), url: `/policies/${item.id}` }, { title: lang === 'te' ? 'విధానాలు' : 'Policies', url: '/policies' }],
      followUps: (all.filter((other) => other.id !== item.id).slice(0, 2).map((other) => textOf(other.name, lang)))
    };
  }

  return {
    intent: 'policies',
    lead: lang === 'te'
      ? `ఈ వెబ్‌సైట్‌లో ${all.length} విధానాలు ప్రచురించబడ్డాయి.`
      : `${all.length} policies are published on this website.`,
    bullets: all.slice(0, MAX_BULLETS).map((item) => ({
      label: item.sector || (lang === 'te' ? 'విధానం' : 'Policy'),
      value: `${textOf(item.name, lang)}${item.year ? ` (${item.year})` : ''}`
    })),
    note: '',
    sources: [{ title: lang === 'te' ? 'విధానాలు' : 'Policies', url: '/policies' }],
    followUps: []
  };
}

async function districtsAnswer({ lang, qLower, district }) {
  const all = district ? null : await contentRepository.list('districts');
  const match = district || null;
  if (!district && !(all || []).length) return null;

  if (match) {
    const regions = match.region ? await contentRepository.list('regions') : [];
    const region = regions.find((item) => item.id === match.region);
    const regionName = region ? textOf(region.name, lang) : match.region;
    const institutions = (match.institutions || []).map((inst) => textOf(inst.name, lang)).filter(Boolean);
    const bullets = [
      match.hq ? { label: lang === 'te' ? 'ప్రధాన కార్యాలయం' : 'Headquarters', value: match.hq } : null,
      regionName ? { label: lang === 'te' ? 'ప్రాంతం' : 'Region', value: regionName } : null,
      institutions.length ? { label: lang === 'te' ? 'సంస్థలు' : 'Institutions', value: institutions.slice(0, 4).join(', ') } : null,
      (match.activities || []).length ? { label: lang === 'te' ? 'కార్యకలాపాలు' : 'Activities', value: (match.activities || []).slice(0, 2).map((a) => textOf(a, lang)).join('; ') } : null
    ].filter(Boolean);

    return {
      intent: 'districts',
      lead: lang === 'te'
        ? `${textOf(match.name, lang)} జిల్లా ప్రొఫైల్.`
        : `${textOf(match.name, lang)} district profile.`,
      bullets: bullets.slice(0, MAX_BULLETS),
      note: institutions.length > 4 ? (lang === 'te' ? `మొత్తం ${institutions.length} సంస్థలు.` : `${institutions.length} institutions in total.`) : '',
      sources: [{ title: textOf(match.name, lang), url: `/districts?district=${match.id}` }],
      followUps: [lang === 'te' ? 'అన్ని జిల్లాలు చూపించు' : 'Show all districts']
    };
  }

  return {
    intent: 'districts',
    lead: lang === 'te'
      ? `ఆంధ్రప్రదేశ్‌లోని ${all.length} జిల్లాల్లో విజ్ఞాన, సాంకేతిక సంస్థల వివరాలు వెబ్‌సైట్‌లో ఉన్నాయి.`
      : `The website maps science and technology institutions across all ${all.length} districts of Andhra Pradesh.`,
    bullets: all.slice(0, MAX_BULLETS).map((item) => ({
      label: item.region || (lang === 'te' ? 'జిల్లా' : 'District'),
      value: `${textOf(item.name, lang)}${item.hq ? ` — ${item.hq}` : ''}`
    })),
    note: '',
    sources: [{ title: lang === 'te' ? 'జిల్లాల అన్వేషణ' : 'District Explorer', url: '/districts' }],
    followUps: []
  };
}

/**
 * A question that names a district is answered from that district's profile,
 * even when it also contains a generic word such as "institutions".
 */
async function findNamedDistrict(qLower) {
  if (!/\b(districts?|institutions?|headquarters?|hq|region|activities|profile|science cent\w*)\b/i.test(qLower)) return null;
  const all = await contentRepository.list('districts');
  return all.find((item) => {
    const name = textOf(item.name, 'en').toLowerCase();
    return name && qLower.includes(name);
  }) || null;
}

async function eventsAnswer({ lang }) {
  const all = await contentRepository.list('events');
  const upcoming = all
    .filter((item) => (item.endDate || item.date || '') >= today())
    .sort((a, b) => byDate('date')(a, b));
  if (!upcoming.length) return null;

  return {
    intent: 'events',
    lead: lang === 'te'
      ? `రాబోయే ${upcoming.length} కార్యక్రమాలు ఉన్నాయి.`
      : `${upcoming.length} upcoming ${upcoming.length === 1 ? 'event is' : 'events are'} listed.`,
    bullets: upcoming.slice(0, MAX_BULLETS).map((item) => ({
      label: fmtDate(item.date, lang),
      value: [textOf(item.title, lang), textOf(item.location, lang)].filter(Boolean).join(' — ')
    })),
    note: '',
    sources: [{ title: lang === 'te' ? 'కార్యక్రమాలు' : 'Events', url: '/media/events' }],
    followUps: []
  };
}

async function organisationsAnswer({ lang }) {
  const all = await contentRepository.list('organisations');
  if (!all.length) return null;

  return {
    intent: 'organisations',
    lead: lang === 'te'
      ? `ఈ శాఖ ఆధ్వర్యంలో ${all.length} సంస్థలు పనిచేస్తున్నాయి.`
      : `${all.length} organisations work with the Department.`,
    bullets: all.slice(0, MAX_BULLETS).map((item) => ({
      label: item.abbr || textOf(item.name, lang),
      value: textOf(item.name, lang)
    })),
    note: '',
    sources: [{ title: lang === 'te' ? 'సంస్థలు' : 'Organisations', url: '/organisations' }],
    followUps: []
  };
}

async function officersAnswer({ lang }) {
  const all = await contentRepository.list('officers');
  if (!all.length) return null;

  return {
    intent: 'officers',
    lead: lang === 'te'
      ? 'ఈ శాఖ అధికారుల జాబితా ఇది.'
      : 'These are the officers listed for the Department.',
    bullets: all.slice(0, MAX_BULLETS).map((item) => ({
      label: item.designation || (lang === 'te' ? 'అధికారి' : 'Officer'),
      value: [item.name, item.phone, item.email].filter(Boolean).join(' · ')
    })),
    note: '',
    sources: [{ title: lang === 'te' ? 'సంప్రదించండి' : 'Contact us', url: '/contact' }],
    followUps: [lang === 'te' ? 'కార్యాలయ చిరునామా చూపించు' : 'Show the office address']
  };
}

async function contactAnswer({ lang }) {
  const contact = await settingsRepository.get('contact');
  const bullets = [
    { label: lang === 'te' ? 'చిరునామా' : 'Address', value: textOf(contact.headOffice, lang) },
    { label: lang === 'te' ? 'ఫోన్' : 'Phone', value: contact.phone || '' },
    { label: lang === 'te' ? 'ఇమెయిల్' : 'Email', value: contact.email || '' },
    { label: lang === 'te' ? 'పని వేళలు' : 'Working hours', value: textOf(contact.workingHours, lang) }
  ].filter((bullet) => bullet.value);
  if (!bullets.length) return null;

  return {
    intent: 'contact',
    lead: lang === 'te'
      ? 'ఈ వెబ్‌సైట్‌లో ప్రచురించిన సంప్రదింపు వివరాలు ఇవి.'
      : 'These are the contact details the Department publishes on this website.',
    bullets: bullets.slice(0, MAX_BULLETS),
    note: '',
    sources: [{ title: lang === 'te' ? 'సంప్రదించండి' : 'Contact us', url: '/contact' }],
    followUps: [lang === 'te' ? 'అధికారుల జాబితా చూపించు' : 'Show the list of officers']
  };
}

async function rtiAnswer({ lang }) {
  const [pages, officers, documents] = await Promise.all([
    contentRepository.list('pages'),
    contentRepository.list('officers'),
    contentRepository.list('documents')
  ]);
  const page = pages.find((item) => item.id === 'rti');
  const pio = officers.find((item) => item.roleTag === 'pio');
  const docs = documents.filter((item) => item.topic === 'rti');

  const bullets = [];
  if (pio) {
    bullets.push({
      label: lang === 'te' ? 'పౌర సమాచార అధికారి' : 'Public Information Officer',
      value: [pio.name, pio.designation, pio.phone, pio.email].filter(Boolean).join(' · ')
    });
  }
  if (docs.length) {
    bullets.push({
      label: lang === 'te' ? 'RTI పత్రాలు' : 'RTI documents',
      value: `${docs.length} ${lang === 'te' ? 'పత్రాలు అందుబాటులో ఉన్నాయి' : `document${docs.length === 1 ? '' : 's'} available`}`
    });
  }

  const section = (page?.sections || [])[0];
  const body = section ? (section.body || []).map((line) => textOf(line, lang)).filter(Boolean)[0] : '';
  const payloadLead = lang === 'te'
    ? 'సమాచార హక్కు చట్టం, 2005 కింద ఏ పౌరుడైనా శాఖలో ఉన్న సమాచారాన్ని అడగవచ్చు.'
    : 'Under the Right to Information Act, 2005 any citizen may request information held by the Department.';

  // Skip the page paragraph when it merely repeats the lead sentence.
  const note = body && !body.toLowerCase().startsWith(payloadLead.slice(0, 40).toLowerCase()) ? body : '';
  return {
    intent: 'rti',
    lead: payloadLead,
    bullets: bullets.slice(0, MAX_BULLETS),
    note,
    sources: [{ title: lang === 'te' ? 'సమాచార హక్కు' : 'Right to Information', url: '/ecitizen/rti' }],
    followUps: [lang === 'te' ? 'RTI పత్రాలు చూపించు' : 'Show the RTI documents']
  };
}

async function newsAnswer({ lang }) {
  const all = (await contentRepository.list('news')).sort((a, b) => byDate('date', -1)(a, b));
  if (!all.length) return null;

  return {
    intent: 'news',
    lead: lang === 'te'
      ? `తాజా ${Math.min(all.length, MAX_BULLETS)} అప్‌డేట్లు ఇవి.`
      : `Here are the latest ${Math.min(all.length, MAX_BULLETS)} updates.`,
    bullets: all.slice(0, MAX_BULLETS).map((item) => ({
      label: fmtDate(item.date, lang),
      value: textOf(item.title, lang)
    })),
    note: '',
    sources: [{ title: lang === 'te' ? 'తాజా అప్‌డేట్లు' : 'Latest updates', url: '/' }],
    followUps: []
  };
}

async function faqsAnswer({ lang, terms }) {
  const all = await contentRepository.list('faqs');
  if (!all.length) return null;
  const scored = all
    .map((item) => {
      const haystack = `${textOf(item.q, 'en')} ${textOf(item.a, 'en')} ${textOf(item.q, 'te')}`.toLowerCase();
      return { item, score: terms.filter((term) => haystack.includes(term)).length };
    })
    .sort((a, b) => b.score - a.score);
  if (!scored.length || scored[0].score === 0) return null;

  return {
    intent: 'faqs',
    lead: textOf(scored[0].item.q, lang),
    bullets: [],
    note: textOf(scored[0].item.a, lang),
    sources: [{ title: lang === 'te' ? 'తరచుగా అడిగే ప్రశ్నలు' : 'FAQs', url: '/ecitizen/faqs' }],
    followUps: scored.slice(1, 3).map((entry) => textOf(entry.item.q, lang))
  };
}

/** Ranked site search across every content type — the general fallback. */
async function searchAnswer({ lang, terms, question }) {
  const hits = [];
  const seen = new Set();
  for (const term of [question, ...terms].slice(0, 4)) {
    const found = await searchRepository.search(term, lang, null);
    for (const hit of found) {
      if (seen.has(hit.url)) continue;
      seen.add(hit.url);
      hits.push(hit);
    }
    if (hits.length >= MAX_BULLETS) break;
  }
  if (!hits.length) return null;

  const top = hits.slice(0, MAX_BULLETS);
  return {
    intent: 'content',
    lead: lang === 'te' ? 'వెబ్‌సైట్‌లో ఈ సమాచారం దొరికింది.' : 'Here is what the website publishes on this.',
    bullets: top.map((hit) => ({
      label: hit.type.charAt(0).toUpperCase() + hit.type.slice(1),
      value: `${hit.title}${hit.snippet ? ` — ${hit.snippet}` : ''}`
    })),
    note: '',
    sources: top.map((hit) => ({ title: hit.title, url: hit.url })),
    followUps: []
  };
}

// ---------------------------------------------------------------------------
// Intent routing
// ---------------------------------------------------------------------------
const INTENTS = [
  { id: 'tenders', re: /\b(tenders?|bids?|bidding|emd|rfps?|rfqs?|corrigend\w*)\b/i, run: tendersAnswer },
  { id: 'rti', re: /\b(rti|right to information|pio|public information officer)\b/i, run: rtiAnswer },
  { id: 'documents', re: /\b(go|gos|g\.o\.?|government orders?|notifications?|circulars?|acts?|rules?|guidelines?|documents?|orders?)\b/i, run: documentsAnswer },
  { id: 'policies', re: /\b(polic(y|ies)|schemes?|incentives?)\b/i, run: policiesAnswer },
  { id: 'districts', re: /\b(districts?)\b|\bwhich district\b/i, run: districtsAnswer },
  { id: 'events', re: /\b(events?|conclaves?|science day|science fair|workshop|seminar|webinar)\b/i, run: eventsAnswer },
  { id: 'officers', re: /\b(officers?|secretary|director|who is the head)\b/i, run: officersAnswer },
  { id: 'organisations', re: /\b(organisations?|organizations?|institutions?|councils?|society|agencies)\b/i, run: organisationsAnswer },
  { id: 'contact', re: /\b(contact|phone|telephone|email|e-mail|address|reach|office hours)\b/i, run: contactAnswer },
  { id: 'news', re: /\b(news|updates?|announcements?|what'?s new)\b/i, run: newsAnswer },
  { id: 'faqs', re: /\b(faqs?|frequently asked)\b/i, run: faqsAnswer }
];

const NOT_ANSWERED = {
  en: 'I could not find an answer to that in the content published on this website. Please try different words, use the site search, or reach the Department through the Contact Us page.',
  te: 'ఈ వెబ్‌సైట్‌లో ప్రచురించిన సమాచారంలో దీనికి సమాధానం దొరకలేదు. దయచేసి వేరే పదాలతో ప్రయత్నించండి లేదా సంప్రదించండి పేజీని చూడండి.'
};

const plainAnswer = ({ lead, bullets, note }) =>
  [lead, ...(bullets || []).map((bullet) => `${bullet.label}: ${bullet.value}`), note].filter(Boolean).join('\n');

/**
 * Answers a question from the published website content.
 * Returns the structured fields the chat renders plus a plain-text `answer`
 * for logs and API clients that only read text.
 */
async function ask({ question, lang, previous = '', previousIntent = '', req } = {}) {
  const text = cleanString(question, 1000);
  if (!text || text.length < 2) throw new ApiError(400, 'Please ask a question.');

  const language = normaliseLang(lang);
  const qLower = text.toLowerCase();
  const terms = words(text);
  const context = { lang: language, qLower, terms, question: text, previous, previousIntent };

  let answer = null;
  // A question that names a district is answered from that district's profile.
  const namedDistrict = await findNamedDistrict(qLower);
  let intent = namedDistrict ? INTENTS.find((candidate) => candidate.id === 'districts') : INTENTS.find((candidate) => candidate.re.test(qLower));

  // Follow-ups ("what about the closed ones?") stay on the previous topic.
  const isFollowUp = /^(what|and|how)\b.*\b(about|closed|open|ones|those|them)\b/i.test(text) || /\b(closed|open|ones)\b/i.test(qLower);
  if (!namedDistrict && !intent && previousIntent && isFollowUp) {
    intent = INTENTS.find((candidate) => candidate.id === previousIntent) || null;
  }

  if (namedDistrict) {
    answer = await districtsAnswer({ ...context, district: namedDistrict });
  } else if (intent) {
    answer = await intent.run(context);
  }
  if (!answer) answer = await searchAnswer(context);

  if (!answer) {
    const lead = NOT_ANSWERED[language];
    await searchRepository.logAssistant({ question: text, answer: lead, sourceUrl: '/contact', lang: language, answered: false });
    return {
      answered: false,
      intent: intent ? intent.id : 'unknown',
      lang: language,
      lead,
      bullets: [],
      note: '',
      sources: [{ title: language === 'te' ? 'సంప్రదించండి' : 'Contact us', url: '/contact' }],
      follow_ups: [],
      answer: lead
    };
  }

  const payload = {
    answered: true,
    intent: answer.intent,
    lang: language,
    lead: answer.lead,
    bullets: (answer.bullets || []).slice(0, MAX_BULLETS),
    note: answer.note || '',
    sources: (answer.sources || []).slice(0, MAX_SOURCES).map((source) => ({ title: source.title, url: source.url })),
    follow_ups: (answer.followUps || []).filter(Boolean).slice(0, 3)
  };
  const logId = await searchRepository.logAssistant({
    question: text,
    answer: plainAnswer(payload),
    sourceUrl: payload.sources[0]?.url,
    lang: language,
    answered: true
  });
  return { ...payload, answer: plainAnswer(payload), log_id: logId };
}

module.exports = { ask };
