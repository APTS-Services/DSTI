// src/content/resources.js — the single description of every database-backed
// content type. It drives (a) /api/v1 public reads, (b) /api/v1 admin CRUD,
// and (c) the frontend compatibility layer.
//
// `columns` is the write allowlist: any body key not listed here is ignored,
// so a client can never write an arbitrary column.

const S = (name, opts = {}) => ({ name, type: 'string', ...opts });
const I = (name, opts = {}) => ({ name, type: 'int', ...opts });
const D = (name, opts = {}) => ({ name, type: 'date', ...opts });
const DT = (name, opts = {}) => ({ name, type: 'datetime', ...opts });
const B = (name, opts = {}) => ({ name, type: 'bool', ...opts });
const DEC = (name, opts = {}) => ({ name, type: 'decimal', ...opts });

/** Two writable columns for one public bilingual field. */
const bi = (base, max = 255, { required = false } = {}) => [
  S(`${base}_en`, { max, base, lang: 'en', required }),
  S(`${base}_te`, { max, base, lang: 'te' })
];

const STATUS = {
  column: 'status',
  published: ['published'],
  draft: 'draft',
  pending: 'pending',
  archived: 'archived'
};
const ACTIVE = { column: 'is_active', type: 'active', published: 1, draft: 0 };

const resources = {
  pages: {
    table: 'pages',
    pk: 'page_id',
    slug: 'slug',
    status: STATUS,
    order: 'display_order',
    search: ['title_en', 'body_en', 'slug'],
    bi: { title: ['title_en', 'title_te'], body: ['body_en', 'body_te'], metaDesc: ['meta_desc_en', 'meta_desc_te'] },
    columns: [
      S('slug', { max: 150, required: true }),
      S('section', { enum: ['home', 'about', 'ict', 'investor', 'ecitizen', 'media', 'contact', 'statutory'] }),
      I('parent_page_id'), ...bi('title', 255, { required: true }),
      ...bi('body', 65000), ...bi('meta_desc', 300),
      I('og_image_id'), B('show_in_footer'), I('display_order'),
      S('status', { enum: ['draft', 'pending', 'published', 'archived'] })
    ]
  },
  banners: {
    table: 'banners',
    pk: 'banner_id',
    status: ACTIVE,
    order: 'display_order',
    search: ['title_en'],
    bi: { title: ['title_en', 'title_te'], message: ['message_en', 'message_te'] },
    columns: [
      ...bi('title', 255, { required: true }), ...bi('message', 500),
      I('image_id'), S('link_url', { max: 500, url: true }), I('display_order'), B('is_active')
    ]
  },
  news: {
    table: 'news_updates',
    pk: 'news_id',
    status: STATUS,
    order: null,
    sortDefault: 'publish_date',
    search: ['title_en', 'title_te'],
    bi: { title: ['title_en', 'title_te'] },
    columns: [
      ...bi('title', 300, { required: true }), S('link_url', { max: 500, url: true }),
      D('publish_date', { required: true }), D('expiry_date'), B('is_ticker'),
      S('status', { enum: ['draft', 'published', 'archived'] })
    ]
  },
  'audience-cards': {
    table: 'audience_cards',
    pk: 'card_id',
    slug: 'audience',
    status: null,
    order: 'display_order',
    search: ['title_en'],
    bi: { title: ['title_en', 'title_te'], description: ['description_en', 'description_te'] },
    columns: [
      S('audience', { enum: ['citizen', 'student', 'researcher', 'investor'], required: true }),
      ...bi('title', 150, { required: true }), ...bi('description', 400),
      S('link_url', { max: 500, url: true }), I('display_order')
    ]
  },
  'quick-links': {
    table: 'quick_links',
    pk: 'link_id',
    status: ACTIVE,
    order: 'display_order',
    search: ['label_en'],
    bi: { label: ['label_en', 'label_te'] },
    columns: [
      S('link_group', { enum: ['home_quick', 'useful_link', 'social'], required: true }),
      ...bi('label', 200, { required: true }), S('url', { max: 500, required: true, url: true }),
      B('opens_new_tab'), I('display_order'), B('is_active')
    ]
  },
  'social-links': {
    table: 'social_links',
    pk: 'social_id',
    status: ACTIVE,
    order: 'display_order',
    search: ['platform'],
    bi: {},
    columns: [S('platform', { max: 50, required: true }), S('url', { max: 500, required: true, url: true }), I('display_order'), B('is_active')]
  },
  'story-panels': {
    table: 'story_panels',
    pk: 'panel_id',
    status: ACTIVE,
    order: 'display_order',
    search: ['title_en'],
    bi: { title: ['title_en', 'title_te'], text: ['text_en', 'text_te'] },
    columns: [...bi('title', 200, { required: true }), ...bi('text', 1000), I('image_id'), I('display_order'), B('is_active')]
  },
  almanac: {
    table: 'almanac_entries',
    pk: 'entry_id',
    status: null,
    order: null,
    search: ['title_en'],
    bi: { title: ['title_en', 'title_te'], description: ['description_en', 'description_te'] },
    columns: [
      S('entry_type', { enum: ['science_day', 'observance', 'this_day'], required: true }),
      I('month_no', { required: true }), I('day_no', { required: true }), I('event_year'),
      ...bi('title', 255, { required: true }), ...bi('description', 10000)
    ]
  },
  awards: {
    table: 'awards',
    pk: 'award_id',
    status: { column: 'status', published: ['published'], draft: 'draft', pending: null, archived: null },
    order: null,
    sortDefault: 'award_year',
    search: ['title_en', 'recipient_en'],
    bi: { title: ['title_en', 'title_te'], recipient: ['recipient_en', 'recipient_te'], description: ['description_en', 'description_te'] },
    columns: [
      I('award_year', { required: true }), ...bi('title', 255, { required: true }),
      ...bi('recipient', 255), ...bi('description', 10000), I('image_id'),
      S('status', { enum: ['draft', 'published'] })
    ]
  },
  officers: {
    table: 'officers',
    pk: 'officer_id',
    status: ACTIVE,
    order: 'display_order',
    search: ['name_en', 'designation_en'],
    bi: { name: ['name_en', 'name_te'], designation: ['designation_en', 'designation_te'] },
    columns: [
      ...bi('name', 150, { required: true }), ...bi('designation', 200, { required: true }),
      S('phone', { max: 30 }), S('email', { max: 190, email: true }), I('photo_id'), I('display_order'), B('is_active')
    ]
  },
  'office-contacts': {
    table: 'office_contacts',
    pk: 'contact_id',
    status: null,
    order: null,
    search: ['office_name_en'],
    bi: { officeName: ['office_name_en', 'office_name_te'], address: ['address_en', 'address_te'] },
    columns: [
      ...bi('office_name', 200, { required: true }), ...bi('address', 500),
      S('phone', { max: 30 }), S('email', { max: 190, email: true }),
      DEC('latitude'), DEC('longitude'), S('working_hours', { max: 150 })
    ]
  },
  organisations: {
    table: 'organisations',
    pk: 'org_id',
    slug: 'slug',
    status: STATUS,
    order: 'display_order',
    search: ['name_en', 'about_en', 'short_name'],
    bi: { name: ['name_en', 'name_te'], about: ['about_en', 'about_te'] },
    columns: [
      S('slug', { max: 150, required: true }), ...bi('name', 255, { required: true }),
      S('short_name', { max: 50 }), ...bi('about', 65000),
      S('website_url', { max: 500, url: true }), S('email', { max: 190, email: true }),
      S('phone', { max: 30 }), S('address_en', { max: 500 }), I('logo_id'),
      I('display_order'), S('status', { enum: ['draft', 'published', 'archived'] })
    ]
  },
  sectors: {
    table: 'sectors',
    pk: 'sector_id',
    slug: 'slug',
    status: null,
    order: null,
    search: ['name_en'],
    bi: { name: ['name_en', 'name_te'] },
    columns: [...bi('name', 150, { required: true }), S('slug', { max: 100, required: true })]
  },
  policies: {
    table: 'policies',
    pk: 'policy_id',
    slug: 'slug',
    status: STATUS,
    order: 'display_order',
    search: ['name_en', 'summary_en', 'body_en'],
    bi: { name: ['name_en', 'name_te'], summary: ['summary_en', 'summary_te'], body: ['body_en', 'body_te'] },
    columns: [
      S('slug', { max: 150, required: true }), ...bi('name', 255, { required: true }),
      ...bi('summary', 10000), ...bi('body', 65000), S('policy_period', { max: 30 }),
      I('sector_id'), I('pdf_file_id'), I('display_order'),
      S('status', { enum: ['draft', 'published', 'archived'] })
    ]
  },
  districts: {
    table: 'districts',
    pk: 'district_id',
    slug: 'slug',
    status: null,
    order: null,
    search: ['name_en'],
    bi: { name: ['name_en', 'name_te'] },
    columns: [
      ...bi('name', 100, { required: true }), S('slug', { max: 100, required: true }),
      S('map_code', { max: 20 }), DEC('latitude'), DEC('longitude')
    ]
  },
  'district-institutions': {
    table: 'district_institutions',
    pk: 'inst_id',
    status: STATUS,
    order: null,
    search: ['name_en', 'description_en'],
    bi: { name: ['name_en', 'name_te'], description: ['description_en', 'description_te'] },
    columns: [
      I('district_id', { required: true }), I('org_id'), ...bi('name', 255, { required: true }),
      S('category', { enum: ['institution', 'research_centre', 'incubator', 'park', 'lab', 'project', 'activity'], required: true }),
      I('sector_id'), ...bi('description', 10000), S('address_en', { max: 500 }),
      DEC('latitude'), DEC('longitude'), S('website_url', { max: 500, url: true }),
      S('status', { enum: ['draft', 'published', 'archived'] })
    ]
  },
  'document-categories': {
    table: 'document_categories',
    pk: 'category_id',
    slug: 'slug',
    status: null,
    order: 'display_order',
    search: ['name_en'],
    bi: { name: ['name_en', 'name_te'] },
    columns: [S('slug', { max: 80, required: true }), ...bi('name', 150, { required: true }), I('display_order')]
  },
  documents: {
    table: 'documents',
    pk: 'doc_id',
    status: STATUS,
    order: null,
    sortDefault: 'doc_date',
    search: ['title_en', 'description_en', 'doc_number'],
    bi: { title: ['title_en', 'title_te'], description: ['description_en', 'description_te'] },
    columns: [
      I('category_id', { required: true }), S('doc_number', { max: 100 }), ...bi('title', 500, { required: true }),
      ...bi('description', 10000), D('doc_date', { required: true }), I('policy_id'), I('file_id'),
      S('status', { enum: ['draft', 'pending', 'published', 'archived'] })
    ]
  },
  faqs: {
    table: 'faqs',
    pk: 'faq_id',
    status: { column: 'status', published: ['published'], draft: 'draft', pending: null, archived: null },
    order: 'display_order',
    search: ['question_en', 'answer_en'],
    bi: { question: ['question_en', 'question_te'], answer: ['answer_en', 'answer_te'] },
    columns: [...bi('question', 500, { required: true }), ...bi('answer', 10000, { required: true }), I('display_order'), S('status', { enum: ['draft', 'published'] })]
  },
  tenders: {
    table: 'tenders',
    pk: 'tender_id',
    status: { column: 'publish_status', published: ['published'], draft: 'draft', pending: 'pending', archived: 'archived' },
    order: null,
    sortDefault: 'published_date',
    search: ['title_en', 'description_en', 'tender_number'],
    bi: { title: ['title_en', 'title_te'], description: ['description_en', 'description_te'] },
    columns: [
      S('tender_number', { max: 100, required: true }), ...bi('title', 500, { required: true }),
      ...bi('description', 10000), D('published_date', { required: true }), DT('last_date', { required: true }),
      S('status', { enum: ['open', 'closed', 'cancelled'] }), I('file_id'),
      I('corrigendum_file_id'), S('publish_status', { enum: ['draft', 'pending', 'published', 'archived'] })
    ]
  },
  'science-stories': {
    table: 'science_stories',
    pk: 'story_id',
    status: STATUS,
    order: 'display_order',
    search: ['title_en', 'description_en'],
    bi: { title: ['title_en', 'title_te'], description: ['description_en', 'description_te'] },
    columns: [
      ...bi('title', 255, { required: true }), ...bi('description', 10000),
      I('video_file_id'), S('video_url', { max: 500, url: true }), I('thumbnail_id'),
      I('captions_file_id'), I('duration_sec'), D('publish_date'), I('display_order'),
      S('status', { enum: ['draft', 'published', 'archived'] })
    ]
  },
  events: {
    table: 'events',
    pk: 'event_id',
    slug: 'slug',
    status: STATUS,
    order: null,
    sortDefault: 'start_datetime',
    search: ['title_en', 'description_en'],
    bi: { title: ['title_en', 'title_te'], description: ['description_en', 'description_te'], venue: ['venue_en', 'venue_te'] },
    columns: [
      S('slug', { max: 150, required: true }), ...bi('title', 255, { required: true }),
      ...bi('description', 65000), ...bi('venue', 255), I('district_id'),
      DT('start_datetime', { required: true }), DT('end_datetime'),
      S('registration_url', { max: 500, url: true }), I('banner_id'),
      S('status', { enum: ['draft', 'published', 'archived'] })
    ]
  }
};

// Resources addressed by database id are writable through the generic admin
// routes; `connections` has a bespoke handler and is intentionally excluded.
const CRUD_RESOURCES = Object.keys(resources);

function getResource(key) {
  return Object.prototype.hasOwnProperty.call(resources, key) ? resources[key] : null;
}

/** SQL fragment selecting only publicly visible rows. */
function publicWhere(resource, alias = '') {
  const prefix = alias ? `${alias}.` : '';
  const status = resource.status;
  if (!status) return { sql: '1 = 1', params: [] };
  if (status.type === 'active') return { sql: `${prefix}${status.column} = 1`, params: [] };
  return { sql: `${prefix}${status.column} IN (${status.published.map(() => '?').join(', ')})`, params: [...status.published] };
}

module.exports = { resources, CRUD_RESOURCES, getResource, publicWhere, STATUS, ACTIVE };
