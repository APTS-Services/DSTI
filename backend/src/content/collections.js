// src/content/collections.js — the CMS content model.
//
// `fields` describes the admin form and server-side validation; it is the same
// contract the React CMS already consumes through /api/admin/schemas.
//
// `storage` maps each CMS collection onto the MySQL schema in database/schema.sql:
//   kind: 'table'  → rows in a real table, mapped columns + cms_extras JSON
//   kind: 'block'  → cms_blocks JSON rows (collections with no dedicated table)
//   kind: 'custom' → bespoke handler (awards are one row per award, grouped by year)
//
// Field types: text, textarea, bi, bitext, bilist, list, number, date, bool,
// select, url, file, image, color, slug, youtube, email, repeater.

const f = (name, type, label, opts = {}) => ({ name, type, label, ...opts });

const ICONS = [
  'Users', 'GraduationCap', 'FlaskConical', 'Briefcase', 'Building2', 'ScrollText', 'CalendarDays', 'MapPinned',
  'Lightbulb', 'Rocket', 'Sprout', 'Cpu', 'Atom', 'Satellite', 'ShieldCheck', 'FileText', 'Landmark', 'Globe'
];
const TONES = ['lavender', 'sky', 'blush', 'mint'];

const block = () => ({ kind: 'block' });
const table = (config) => ({ kind: 'table', ...config });

const collections = {
  // ---------- Home page ----------
  heroSlides: {
    label: 'Hero banner slides', group: 'Home page', titleField: 'title',
    fields: [
      f('title', 'bi', 'Key message', { required: true }),
      f('subtitle', 'bitext', 'Supporting text'),
      f('ctaLabel', 'bi', 'Button label'),
      f('ctaLink', 'url', 'Button link'),
      f('image', 'image', 'Background image (optional, 1600×700)')
    ],
    storage: table({
      table: 'banners', pk: 'banner_id', keyColumn: 'banner_id',
      status: { kind: 'active', column: 'is_active' }, order: 'display_order',
      map: {
        title: { bi: ['title_en', 'title_te'] },
        subtitle: { bi: ['message_en', 'message_te'] },
        ctaLink: { col: 'link_url' },
        image: { file: 'image_id' }
      }
    })
  },
  services: {
    label: 'Feature cards', group: 'Home page', titleField: 'title',
    fields: [
      f('title', 'bi', 'Title', { required: true }),
      f('text', 'bitext', 'Description'),
      f('to', 'url', 'Link'),
      f('icon', 'select', 'Icon', { options: ICONS }),
      f('tone', 'select', 'Card colour', { options: TONES })
    ],
    storage: block()
  },
  audiences: {
    label: '"What brings you here?"', group: 'Home page', titleField: 'title', keyField: 'id',
    fields: [
      f('id', 'slug', 'Identifier', { required: true }),
      f('title', 'bi', 'Audience', { required: true }),
      f('blurb', 'bitext', 'Description'),
      f('icon', 'select', 'Icon', { options: ICONS }),
      f('links', 'repeater', 'Links', { fields: [f('label', 'bi', 'Label', { required: true }), f('to', 'url', 'Link', { required: true })] })
    ],
    storage: table({
      table: 'audience_cards', pk: 'card_id', keyColumn: 'audience',
      status: null, order: 'display_order',
      map: {
        id: { key: 'audience' },
        title: { bi: ['title_en', 'title_te'] },
        blurb: { bi: ['description_en', 'description_te'] }
      }
    })
  },
  storyChapters: {
    label: 'Illustrated story', group: 'Home page', titleField: 'title',
    fields: [f('title', 'bi', 'Chapter title', { required: true }), f('text', 'bitext', 'Text'), f('icon', 'select', 'Icon', { options: ICONS })],
    storage: table({
      table: 'story_panels', pk: 'panel_id', keyColumn: 'panel_id',
      status: { kind: 'active', column: 'is_active' }, order: 'display_order',
      map: { title: { bi: ['title_en', 'title_te'] }, text: { bi: ['text_en', 'text_te'] } }
    })
  },
  news: {
    label: 'Latest updates / news', group: 'Home page', titleField: 'title', sortField: 'date',
    fields: [
      f('date', 'date', 'Date', { required: true }),
      f('title', 'bi', 'Headline', { required: true }),
      f('category', 'select', 'Category', { options: ['News', 'Tender', 'Event', 'Circular', 'Government Order', 'Notification'] }),
      f('link', 'url', 'Link'),
      f('image', 'image', 'Image (optional)'),
      f('isNew', 'bool', 'Show "New" badge')
    ],
    storage: table({
      table: 'news_updates', pk: 'news_id', keyColumn: 'news_id',
      status: { kind: 'enum', column: 'status', published: 'published', draft: 'draft', pending: 'draft', archived: 'draft' },
      order: null,
      map: {
        date: { col: 'publish_date' },
        title: { bi: ['title_en', 'title_te'] },
        link: { col: 'link_url' }
      }
    })
  },
  navigation: {
    label: 'Main menu', group: 'Site', titleField: 'label', keyField: 'id',
    fields: [
      f('id', 'slug', 'Identifier', { required: true }),
      f('label', 'bi', 'Menu label', { required: true }),
      f('to', 'route', 'Link', { required: true }),
      f('children', 'repeater', 'Sub-menu', { fields: [f('label', 'bi', 'Label', { required: true }), f('to', 'route', 'Link', { required: true })] })
    ],
    storage: block()
  },

  // ---------- Department ----------
  organisations: {
    label: 'Organisations', group: 'Department', titleField: 'name', keyField: 'id',
    fields: [
      f('id', 'slug', 'URL identifier', { required: true }),
      f('abbr', 'text', 'Abbreviation', { required: true, max: 20 }),
      f('name', 'bi', 'Name', { required: true }),
      f('category', 'text', 'Category'),
      f('established', 'number', 'Year established', { min: 1800, max: 2100 }),
      f('website', 'url', 'Website'),
      f('district', 'text', 'District id (e.g. ntr)'),
      f('summary', 'bitext', 'Summary'),
      f('functions', 'bilist', 'Key functions'),
      f('logo', 'image', 'Logo')
    ],
    storage: table({
      table: 'organisations', pk: 'org_id', keyColumn: 'slug',
      status: { kind: 'enum', column: 'status', published: 'published', draft: 'draft', pending: 'draft', archived: 'draft' },
      order: 'display_order',
      map: {
        id: { key: 'slug' },
        abbr: { col: 'short_name' },
        name: { bi: ['name_en', 'name_te'] },
        website: { col: 'website_url' },
        summary: { bi: ['about_en', 'about_te'] },
        logo: { file: 'logo_id' }
      }
    })
  },
  leaders: {
    label: 'Leadership (CM, Minister, officers)', group: 'Department', titleField: 'designation', keyField: 'id',
    fields: [
      f('id', 'slug', 'Identifier', { required: true }),
      f('name', 'bi', 'Name (leave empty until confirmed)'),
      f('designation', 'bi', 'Designation', { required: true }),
      f('portfolio', 'bi', 'Portfolio / department'),
      f('photo', 'image', 'Official photograph (portrait, 400×480)'),
      f('message', 'bitext', 'Message (shown on the Leadership page)'),
      f('showOnHome', 'bool', 'Show on the home page')
    ],
    storage: block()
  },
  awards: {
    label: 'Awards (year-wise)', group: 'Department', titleField: 'title', keyField: 'id', sortField: 'year',
    fields: [
      f('id', 'slug', 'Identifier (year)', { required: true }),
      f('year', 'number', 'Year', { required: true, min: 1950, max: 2100 }),
      f('title', 'bi', 'Title'),
      f('awards', 'repeater', 'Awards', { fields: [f('name', 'bi', 'Award', { required: true }), f('recipient', 'text', 'Recipient'), f('field', 'text', 'Field')] })
    ],
    storage: { kind: 'custom', handler: 'awards' }
  },
  officers: {
    label: 'List of officers', group: 'Department', titleField: 'name',
    fields: [
      f('name', 'text', 'Name', { required: true }),
      f('designation', 'text', 'Designation'),
      f('office', 'text', 'Office'),
      f('phone', 'text', 'Phone', { max: 40 }),
      f('email', 'email', 'Email'),
      f('roleTag', 'select', 'Special role', { options: ['', 'pio', 'posh'] })
    ],
    storage: table({
      table: 'officers', pk: 'officer_id', keyColumn: 'officer_id',
      status: { kind: 'active', column: 'is_active' }, order: 'display_order',
      map: {
        name: { col: 'name_en' },
        designation: { col: 'designation_en' },
        phone: { col: 'phone' },
        email: { col: 'email' }
      }
    })
  },
  egov: {
    label: 'ICT – e-Governance', group: 'Department', titleField: 'name', keyField: 'id',
    fields: [
      f('id', 'slug', 'Identifier', { required: true }),
      f('name', 'bi', 'Name', { required: true }),
      f('summary', 'bitext', 'Summary'),
      f('status', 'text', 'Status'),
      f('tags', 'list', 'Tags')
    ],
    storage: block()
  },
  projects: {
    label: 'ICT – Projects & initiatives', group: 'Department', titleField: 'name', keyField: 'id',
    fields: [
      f('id', 'slug', 'Identifier', { required: true }),
      f('name', 'bi', 'Name', { required: true }),
      f('sector', 'text', 'Sector'),
      f('summary', 'bitext', 'Summary'),
      f('status', 'text', 'Status'),
      f('progress', 'number', 'Progress (%)', { min: 0, max: 100 })
    ],
    storage: block()
  },
  policies: {
    label: 'Policies', group: 'Department', titleField: 'name', keyField: 'id',
    fields: [
      f('id', 'slug', 'URL identifier', { required: true }),
      f('name', 'bi', 'Policy name', { required: true }),
      f('sector', 'text', 'Sector'),
      f('year', 'number', 'Year', { min: 1950, max: 2100 }),
      f('status', 'text', 'Status'),
      f('relatedOrgs', 'list', 'Related organisation ids'),
      f('summary', 'bitext', 'Summary'),
      f('objectives', 'bilist', 'Objectives'),
      f('incentives', 'bilist', 'Incentives'),
      f('file', 'file', 'Policy document (PDF)')
    ],
    storage: table({
      table: 'policies', pk: 'policy_id', keyColumn: 'slug',
      status: { kind: 'enum', column: 'status', published: 'published', draft: 'draft', pending: 'draft', archived: 'draft' },
      order: 'display_order',
      map: {
        id: { key: 'slug' },
        name: { bi: ['name_en', 'name_te'] },
        summary: { bi: ['summary_en', 'summary_te'] },
        file: { file: 'pdf_file_id' }
      }
    })
  },
  investorIncentives: {
    label: "Investor's Corner – incentives", group: 'Department', titleField: 'title',
    fields: [f('title', 'bi', 'Incentive', { required: true }), f('detail', 'bitext', 'Detail')],
    storage: block()
  },

  // ---------- Documents & tenders ----------
  documents: {
    label: 'Document repository', group: 'Documents & tenders', titleField: 'title', sortField: 'date',
    fields: [
      f('type', 'select', 'Type', { required: true, options: ['go', 'notification', 'circular', 'act', 'rule', 'guideline'] }),
      f('topic', 'select', 'Also show on page', { options: ['', 'rti', 'it-act', 'posh'] }),
      f('number', 'text', 'Number', { required: true }),
      f('date', 'date', 'Date', { required: true }),
      f('title', 'bi', 'Subject', { required: true }),
      f('department', 'text', 'Department'),
      f('file', 'file', 'PDF file'),
      f('size', 'text', 'File size label', { max: 20 })
    ],
    storage: table({
      table: 'documents', pk: 'doc_id', keyColumn: 'doc_id',
      status: { kind: 'enum', column: 'status', published: 'published', draft: 'draft', pending: 'draft', archived: 'draft' },
      order: null,
      map: {
        number: { col: 'doc_number' },
        date: { col: 'doc_date' },
        title: { bi: ['title_en', 'title_te'] },
        file: { file: 'file_id' }
      },
      hooks: 'documents'
    })
  },
  tenders: {
    label: 'Tenders', group: 'Documents & tenders', titleField: 'title', sortField: 'publishedDate',
    fields: [
      f('tenderNo', 'text', 'Tender number', { required: true }),
      f('title', 'bi', 'Title', { required: true }),
      f('department', 'text', 'Department / organisation'),
      f('district', 'text', 'District id'),
      f('publishedDate', 'date', 'Published on', { required: true }),
      f('closingDate', 'date', 'Closing date', { required: true }),
      f('status', 'select', 'Status', { required: true, options: ['open', 'closed'] }),
      f('emd', 'text', 'EMD amount'),
      f('documents', 'repeater', 'Documents', { fields: [f('name', 'text', 'Name', { required: true }), f('file', 'file', 'PDF file', { required: true }), f('size', 'text', 'Size label')] })
    ],
    storage: table({
      table: 'tenders', pk: 'tender_id', keyColumn: 'tender_id',
      status: { kind: 'enum', column: 'publish_status', published: 'published', draft: 'draft', pending: 'draft', archived: 'draft' },
      order: null,
      fixed: { publish_status: 'published' },
      map: {
        tenderNo: { col: 'tender_number' },
        title: { bi: ['title_en', 'title_te'] },
        publishedDate: { col: 'published_date' },
        closingDate: { col: 'last_date' },
        status: { col: 'status' }
      }
    })
  },
  faqs: {
    label: 'FAQs', group: 'Documents & tenders', titleField: 'q',
    fields: [f('q', 'bi', 'Question', { required: true }), f('a', 'bitext', 'Answer', { required: true })],
    storage: table({
      table: 'faqs', pk: 'faq_id', keyColumn: 'faq_id',
      status: { kind: 'enum', column: 'status', published: 'published', draft: 'draft', pending: 'draft', archived: 'draft' },
      order: 'display_order',
      map: { q: { bi: ['question_en', 'question_te'] }, a: { bi: ['answer_en', 'answer_te'] } }
    })
  },
  usefulLinks: {
    label: 'Useful links', group: 'Documents & tenders', titleField: 'name',
    fields: [f('name', 'bi', 'Name', { required: true }), f('url', 'url', 'URL', { required: true })],
    storage: table({
      table: 'quick_links', pk: 'link_id', keyColumn: 'link_id',
      status: { kind: 'active', column: 'is_active' }, order: 'display_order',
      where: { link_group: 'useful_link' }, fixed: { link_group: 'useful_link' },
      map: { name: { bi: ['label_en', 'label_te'] }, url: { col: 'url' } }
    })
  },

  // ---------- Media ----------
  events: {
    label: 'Events', group: 'Media', titleField: 'title', sortField: 'date',
    fields: [
      f('title', 'bi', 'Title', { required: true }),
      f('date', 'date', 'Start date', { required: true }),
      f('endDate', 'date', 'End date'),
      f('location', 'bi', 'Location'),
      f('district', 'text', 'District id'),
      f('category', 'text', 'Category'),
      f('status', 'select', 'Status', { options: ['upcoming', 'past'] }),
      f('summary', 'bitext', 'Summary'),
      f('image', 'image', 'Image')
    ],
    storage: table({
      table: 'events', pk: 'event_id', keyColumn: 'slug',
      status: { kind: 'enum', column: 'status', published: 'published', draft: 'draft', pending: 'draft', archived: 'draft' },
      order: null,
      map: {
        title: { bi: ['title_en', 'title_te'] },
        date: { col: 'start_datetime' },
        endDate: { col: 'end_datetime' },
        location: { bi: ['venue_en', 'venue_te'] },
        summary: { bi: ['description_en', 'description_te'] },
        image: { file: 'banner_id' }
      },
      hooks: 'events'
    })
  },
  scienceStories: {
    label: 'Science stories (videos)', group: 'Media', titleField: 'title', sortField: 'date',
    fields: [
      f('title', 'bi', 'Title', { required: true }),
      f('videoId', 'youtube', 'YouTube video ID (11 characters)'),
      f('video', 'file', 'Or upload an MP4 video'),
      f('thumbnail', 'image', 'Thumbnail image'),
      f('duration', 'text', 'Duration (m:ss)', { max: 10 }),
      f('category', 'text', 'Category'),
      f('date', 'date', 'Date'),
      f('summary', 'bitext', 'Summary')
    ],
    storage: table({
      table: 'science_stories', pk: 'story_id', keyColumn: 'story_id',
      status: { kind: 'enum', column: 'status', published: 'published', draft: 'draft', pending: 'draft', archived: 'draft' },
      order: 'display_order',
      map: {
        title: { bi: ['title_en', 'title_te'] },
        video: { file: 'video_file_id' },
        videoId: { col: 'video_url' },
        thumbnail: { file: 'thumbnail_id' },
        duration: { col: 'duration_sec' },
        date: { col: 'publish_date' },
        summary: { bi: ['description_en', 'description_te'] }
      },
      hooks: 'scienceStories'
    })
  },
  scienceDays: {
    label: 'Science almanac – observances', group: 'Media', titleField: 'name',
    fields: [
      f('month', 'number', 'Month (1-12)', { required: true, min: 1, max: 12 }),
      f('day', 'number', 'Day (1-31)', { required: true, min: 1, max: 31 }),
      f('name', 'bi', 'Observance', { required: true }),
      f('theme', 'text', 'Theme')
    ],
    storage: table({
      table: 'almanac_entries', pk: 'entry_id', keyColumn: 'entry_id',
      status: null, order: null,
      where: { entry_type: 'science_day' }, fixed: { entry_type: 'science_day' },
      map: {
        month: { col: 'month_no' },
        day: { col: 'day_no' },
        name: { bi: ['title_en', 'title_te'] }
      }
    })
  },
  thisDay: {
    label: 'Science almanac – this day in science', group: 'Media', titleField: 'date', keyField: 'id',
    fields: [
      f('id', 'slug', 'Identifier (MM-DD)', { required: true }),
      f('date', 'text', 'Day (MM-DD)', { required: true, pattern: '^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$' }),
      f('text', 'bitext', 'Fact', { required: true })
    ],
    storage: block()
  },

  // ---------- Districts ----------
  regions: {
    label: 'Regions', group: 'District explorer', titleField: 'name', keyField: 'id',
    fields: [f('id', 'slug', 'Identifier', { required: true }), f('name', 'bi', 'Region name', { required: true }), f('color', 'color', 'Map colour')],
    storage: block()
  },
  districts: {
    label: 'Districts', group: 'District explorer', titleField: 'name', keyField: 'id',
    fields: [
      f('id', 'slug', 'Identifier', { required: true }),
      f('name', 'bi', 'District', { required: true }),
      f('region', 'text', 'Region id', { required: true }),
      f('hq', 'text', 'Headquarters'),
      f('x', 'number', 'Map X (0-600)', { min: 0, max: 600 }),
      f('y', 'number', 'Map Y (0-700)', { min: 0, max: 700 }),
      f('institutions', 'repeater', 'Institutions', { fields: [f('name', 'bi', 'Institution', { required: true }), f('type', 'text', 'Type')] }),
      f('activities', 'bilist', 'Activities')
    ],
    storage: table({
      table: 'districts', pk: 'district_id', keyColumn: 'slug',
      status: null, order: null,
      map: { id: { key: 'slug' }, name: { bi: ['name_en', 'name_te'] } }
    })
  },

  // ---------- Pages ----------
  pages: {
    label: 'Content pages', group: 'Pages', titleField: 'title', keyField: 'id',
    fields: [
      f('id', 'slug', 'Page identifier', { required: true }),
      f('title', 'bi', 'Title', { required: true }),
      f('subtitle', 'bi', 'Subtitle'),
      f('sections', 'repeater', 'Sections', { fields: [f('heading', 'bi', 'Heading'), f('body', 'bilist', 'Paragraphs')] }),
      f('showInFooter', 'bool', 'Show in the website footer')
    ],
    storage: table({
      table: 'pages', pk: 'page_id', keyColumn: 'slug',
      status: { kind: 'enum', column: 'status', published: 'published', draft: 'draft', pending: 'draft', archived: 'draft' },
      order: 'display_order',
      fixed: { section: 'about' },
      map: { id: { key: 'slug' }, title: { bi: ['title_en', 'title_te'] }, showInFooter: { col: 'show_in_footer' } },
      hooks: 'pages'
    })
  }
};

function getCollection(name) {
  return Object.prototype.hasOwnProperty.call(collections, name) ? collections[name] : null;
}

/** Collections that use the generic JSON block store. */
const blockCollections = Object.entries(collections)
  .filter(([, schema]) => schema.storage.kind === 'block')
  .map(([name]) => name);

module.exports = { collections, getCollection, blockCollections };
