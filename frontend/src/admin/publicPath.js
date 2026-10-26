// Where an item appears on the public website (for "View on site" links).
const MAP = {
  organisations: (i) => `/organisations/${i.id}`,
  policies: (i) => `/policies/${i.id}`,
  news: () => '/',
  heroSlides: () => '/',
  services: () => '/',
  audiences: () => '/',
  storyChapters: () => '/',
  events: () => '/media/events',
  scienceStories: () => '/media/science-stories',
  tenders: () => '/tenders',
  documents: () => '/ecitizen/government-orders',
  faqs: () => '/ecitizen/faqs',
  usefulLinks: () => '/ecitizen/useful-links',
  officers: () => '/contact',
  egov: () => '/ict',
  projects: () => '/ict/projects',
  awards: (i) => `/about/awards?year=${i.year}`,
  districts: (i) => `/districts?district=${i.id}`,
  regions: () => '/districts',
  investorIncentives: () => '/investors',
  scienceDays: () => '/',
  thisDay: () => '/',
};
const PAGES = { rti: '/ecitizen/rti', 'it-act-2000': '/ecitizen/it-act-2000', 'posh-act': '/ecitizen/posh-act', 'screen-reader-access': '/screen-reader-access', help: '/help', ecitizen: '/ecitizen' };

export default function publicPath(collection, item) {
  if (collection === 'pages') return item.path || PAGES[item.id] || `/p/${item.id}`;
  return MAP[collection]?.(item) || '/';
}
