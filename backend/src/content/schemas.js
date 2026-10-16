// Content model for the CMS.
//
// Every editable part of the public website is described here once. The same
// definitions drive (a) server-side validation / sanitisation of every write and
// (b) the auto-generated admin forms. Adding a field here is all it takes to make
// it editable from the CMS.
//
// Field types:
//   text, textarea, bi (English/Telugu line), bitext (English/Telugu paragraph),
//   bilist (list of bilingual lines), list (list of plain lines), number, date,
//   bool, select, url, file (PDF/image upload), image, color, repeater (array of
//   objects with sub-fields).

const f = (name, type, label, opts = {}) => ({ name, type, label, ...opts });

const ICONS = [
  'Users', 'GraduationCap', 'FlaskConical', 'Briefcase', 'Building2', 'ScrollText', 'CalendarDays', 'MapPinned',
  'Lightbulb', 'Rocket', 'Sprout', 'Cpu', 'Atom', 'Satellite', 'ShieldCheck', 'FileText', 'Landmark', 'Globe',
];
const TONES = ['lavender', 'sky', 'blush', 'mint'];

export const collections = {
  // ---------- Home page ----------
  heroSlides: {
    label: 'Hero banner slides', group: 'Home page', titleField: 'title',
    fields: [
      f('title', 'bi', 'Key message', { required: true }),
      f('subtitle', 'bitext', 'Supporting text'),
      f('ctaLabel', 'bi', 'Button label'),
      f('ctaLink', 'url', 'Button link'),
      f('image', 'image', 'Background image (optional, 1600×700)'),
    ],
  },
  services: {
    label: 'Feature cards', group: 'Home page', titleField: 'title',
    fields: [
      f('title', 'bi', 'Title', { required: true }),
      f('text', 'bitext', 'Description'),
      f('to', 'url', 'Link'),
      f('icon', 'select', 'Icon', { options: ICONS }),
      f('tone', 'select', 'Card colour', { options: TONES }),
    ],
  },
  audiences: {
    label: '"What brings you here?"', group: 'Home page', titleField: 'title', keyField: 'id',
    fields: [
      f('id', 'slug', 'Identifier', { required: true }),
      f('title', 'bi', 'Audience', { required: true }),
      f('blurb', 'bitext', 'Description'),
      f('icon', 'select', 'Icon', { options: ICONS }),
      f('links', 'repeater', 'Links', { fields: [f('label', 'bi', 'Label', { required: true }), f('to', 'url', 'Link', { required: true })] }),
    ],
  },
  storyChapters: {
    label: 'Illustrated story', group: 'Home page', titleField: 'title',
    fields: [f('title', 'bi', 'Chapter title', { required: true }), f('text', 'bitext', 'Text'), f('icon', 'select', 'Icon', { options: ICONS })],
  },
  news: {
    label: 'Latest updates / news', group: 'Home page', titleField: 'title', sortField: 'date',
    fields: [
      f('date', 'date', 'Date', { required: true }),
      f('title', 'bi', 'Headline', { required: true }),
      f('category', 'select', 'Category', { options: ['News', 'Tender', 'Event', 'Circular', 'Government Order', 'Notification'] }),
      f('link', 'url', 'Link'),
      f('image', 'image', 'Image (optional)'),
      f('isNew', 'bool', 'Show "New" badge'),
    ],
  },
  navigation: {
    label: 'Main menu', group: 'Site', titleField: 'label', keyField: 'id',
    fields: [
      f('id', 'slug', 'Identifier', { required: true }),
      f('label', 'bi', 'Menu label', { required: true }),
      f('to', 'url', 'Link', { required: true }),
      f('children', 'repeater', 'Sub-menu', { fields: [f('label', 'bi', 'Label', { required: true }), f('to', 'url', 'Link', { required: true })] }),
    ],
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
      f('logo', 'image', 'Logo'),
    ],
  },
  awards: {
    label: 'Awards (year-wise)', group: 'Department', titleField: 'title', keyField: 'id', sortField: 'year',
    fields: [
      f('id', 'slug', 'Identifier (year)', { required: true }),
      f('year', 'number', 'Year', { required: true, min: 1950, max: 2100 }),
      f('title', 'bi', 'Title'),
      f('awards', 'repeater', 'Awards', { fields: [f('name', 'bi', 'Award', { required: true }), f('recipient', 'text', 'Recipient'), f('field', 'text', 'Field')] }),
    ],
  },
  officers: {
    label: 'List of officers', group: 'Department', titleField: 'name',
    fields: [
      f('name', 'text', 'Name', { required: true }),
      f('designation', 'text', 'Designation'),
      f('office', 'text', 'Office'),
      f('phone', 'text', 'Phone', { max: 40 }),
      f('email', 'email', 'Email'),
      f('roleTag', 'select', 'Special role', { options: ['', 'pio', 'posh'] }),
    ],
  },
  egov: {
    label: 'ICT – e-Governance', group: 'Department', titleField: 'name', keyField: 'id',
    fields: [
      f('id', 'slug', 'Identifier', { required: true }),
      f('name', 'bi', 'Name', { required: true }),
      f('summary', 'bitext', 'Summary'),
      f('status', 'text', 'Status'),
      f('tags', 'list', 'Tags'),
    ],
  },
  projects: {
    label: 'ICT – Projects & initiatives', group: 'Department', titleField: 'name', keyField: 'id',
    fields: [
      f('id', 'slug', 'Identifier', { required: true }),
      f('name', 'bi', 'Name', { required: true }),
      f('sector', 'text', 'Sector'),
      f('summary', 'bitext', 'Summary'),
      f('status', 'text', 'Status'),
      f('progress', 'number', 'Progress (%)', { min: 0, max: 100 }),
    ],
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
      f('file', 'file', 'Policy document (PDF)'),
    ],
  },
  investorIncentives: {
    label: "Investor's Corner – incentives", group: 'Department', titleField: 'title',
    fields: [f('title', 'bi', 'Incentive', { required: true }), f('detail', 'bitext', 'Detail')],
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
      f('size', 'text', 'File size label', { max: 20 }),
    ],
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
      f('documents', 'repeater', 'Documents', { fields: [f('name', 'text', 'Name', { required: true }), f('file', 'file', 'PDF file', { required: true }), f('size', 'text', 'Size label')] }),
    ],
  },
  faqs: {
    label: 'FAQs', group: 'Documents & tenders', titleField: 'q',
    fields: [f('q', 'bi', 'Question', { required: true }), f('a', 'bitext', 'Answer', { required: true })],
  },
  usefulLinks: {
    label: 'Useful links', group: 'Documents & tenders', titleField: 'name',
    fields: [f('name', 'bi', 'Name', { required: true }), f('url', 'url', 'URL', { required: true })],
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
      f('image', 'image', 'Image'),
    ],
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
      f('summary', 'bitext', 'Summary'),
    ],
  },
  scienceDays: {
    label: 'Science almanac – observances', group: 'Media', titleField: 'name',
    fields: [
      f('month', 'number', 'Month (1-12)', { required: true, min: 1, max: 12 }),
      f('day', 'number', 'Day (1-31)', { required: true, min: 1, max: 31 }),
      f('name', 'bi', 'Observance', { required: true }),
      f('theme', 'text', 'Theme'),
    ],
  },
  thisDay: {
    label: 'Science almanac – this day in science', group: 'Media', titleField: 'date', keyField: 'id',
    fields: [
      f('id', 'slug', 'Identifier (MM-DD)', { required: true }),
      f('date', 'text', 'Day (MM-DD)', { required: true, pattern: '^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$' }),
      f('text', 'bitext', 'Fact', { required: true }),
    ],
  },

  // ---------- Districts ----------
  regions: {
    label: 'Regions', group: 'District explorer', titleField: 'name', keyField: 'id',
    fields: [f('id', 'slug', 'Identifier', { required: true }), f('name', 'bi', 'Region name', { required: true }), f('color', 'color', 'Map colour')],
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
      f('activities', 'bilist', 'Activities'),
    ],
  },

  // ---------- Pages ----------
  pages: {
    label: 'Content pages', group: 'Pages', titleField: 'title', keyField: 'id',
    fields: [
      f('id', 'slug', 'Page identifier', { required: true }),
      f('title', 'bi', 'Title', { required: true }),
      f('subtitle', 'bi', 'Subtitle'),
      f('sections', 'repeater', 'Sections', { fields: [f('heading', 'bi', 'Heading'), f('body', 'bilist', 'Paragraphs')] }),
    ],
  },
};

// Single-record settings.
export const settings = {
  site: {
    label: 'Site identity & social', roles: ['Administrator', 'Publisher'],
    fields: [
      f('name', 'bi', 'Department name', { required: true }),
      f('shortName', 'text', 'Short name', { max: 20 }),
      f('gov', 'bi', 'Government line'),
      f('tagline', 'bi', 'Tagline'),
      f('logo', 'image', 'Header logo (Government of AP emblem)'),
      f('domain', 'url', 'Website address'),
      f('ctaLabel', 'bi', 'Header button label'),
      f('footerAbout', 'bitext', 'Footer description'),
      f('social', 'repeater', 'Social media', { fields: [f('id', 'select', 'Network', { options: ['facebook', 'x', 'youtube', 'instagram', 'linkedin'] }), f('label', 'text', 'Label'), f('href', 'url', 'Profile URL', { required: true })] }),
    ],
  },
  contact: {
    label: 'Contact details', roles: ['Administrator', 'Publisher'],
    fields: [
      f('headOffice', 'bitext', 'Head office address'),
      f('phone', 'text', 'Phone', { max: 40 }),
      f('fax', 'text', 'Fax', { max: 40 }),
      f('email', 'email', 'Email'),
      f('workingHours', 'bi', 'Working hours'),
    ],
  },
  about: {
    label: 'About the Department', roles: ['Administrator', 'Publisher'],
    fields: [
      f('intro', 'bilist', 'Introduction paragraphs'),
      f('mission', 'bitext', 'Mission'),
      f('objectives', 'bilist', 'Objectives'),
      f('orgStructure', 'bitext', 'Organisation structure'),
      f('orgChart', 'image', 'Organisation chart image'),
    ],
  },
  investors: {
    label: "Investor's Corner", roles: ['Administrator', 'Publisher'],
    fields: [f('intro', 'bitext', 'Introduction'), f('whyInvest', 'bilist', 'Why invest'), f('steps', 'bilist', 'How to invest – steps')],
  },
  home: {
    label: 'Home page sections', roles: ['Administrator', 'Publisher'],
    fields: [
      f('showTicker', 'bool', 'Latest updates ticker'),
      f('showServices', 'bool', 'Feature cards'),
      f('showAudiences', 'bool', '"What brings you here?"'),
      f('showStats', 'bool', 'Department at a glance'),
      f('showArticles', 'bool', 'News & updates band'),
      f('articlesTitle', 'bi', 'News band title'),
      f('articlesSubtitle', 'bi', 'News band subtitle'),
      f('showDistricts', 'bool', 'District explorer'),
      f('showAlmanac', 'bool', 'Science almanac'),
      f('showStory', 'bool', 'Illustrated story'),
      f('showConnections', 'bool', 'How it all connects'),
      f('showStories', 'bool', 'Science stories'),
      f('showEvents', 'bool', 'Events'),
    ],
  },
  system: {
    label: 'System', roles: ['Administrator'], private: true,
    fields: [f('feedbackNotifyEmail', 'email', 'Send feedback notifications to')],
  },
};

export function getCollection(name) {
  return Object.prototype.hasOwnProperty.call(collections, name) ? collections[name] : null;
}

export function getSetting(name) {
  return Object.prototype.hasOwnProperty.call(settings, name) ? settings[name] : null;
}
