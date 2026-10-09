// src/data/site.js — global site configuration and navigation.
import { Landmark, Building2, Cpu, ScrollText, Briefcase, Users, FileText, Newspaper, Mail } from 'lucide-react';

export const site = {
  shortName: 'DSTI',
  name: {
    en: 'Department of Science, Technology & Innovation',
    te: 'ఖగోళ, సాంకేతిక & ఆవిష్కరణ శాఖ',
  },
  tagline: {
    en: 'Science, technology and innovation for a developed Andhra Pradesh',
    te: 'అభివృద్ధి చెందిన ఆంధ్రప్రదేశ్ కోసం విజ్ఞానం, సాంకేతికత, ఆవిష్కరణ',
  },
  gov: {
    en: 'Government of Andhra Pradesh',
    te: 'ఆంధ్రప్రదేశ్ ప్రభుత్వం',
  },
  domain: 'https://dsti.ap.gov.in',
  established: 2019,
  lastUpdated: '2026-10-01',
  social: [
    { id: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/APGovt' },
    { id: 'x', label: 'X (Twitter)', href: 'https://x.com/APGovt' },
    { id: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@APGovt' },
    { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/apgovt' },
  ],
};

// Main navigation. `children` becomes a dropdown / mega-menu.
export const navItems = [
  { key: 'home', to: '/', icon: Landmark },
  {
    key: 'about',
    to: '/about',
    icon: Building2,
    children: [
      { key: 'intro', to: '/about' },
      { key: 'mission', to: '/about/mission' },
      { key: 'objectives', to: '/about/objectives' },
      { key: 'organisationStructure', to: '/about/organisation' },
      { key: 'awards', to: '/about/awards' },
    ],
  },
  {
    key: 'organisations',
    to: '/organisations',
    icon: Building2,
    children: [
      { key: 'allOrganisations', to: '/organisations' },
      { key: 'districtExplorer', to: '/districts' },
      { key: 'howItConnects', to: '/how-it-connects' },
    ],
  },
  {
    key: 'ict',
    to: '/ict',
    icon: Cpu,
    children: [
      { key: 'eGovernance', to: '/ict' },
      { key: 'projects', to: '/ict/projects' },
    ],
  },
  { key: 'policies', to: '/policies', icon: ScrollText },
  { key: 'investors', to: '/investors', icon: Briefcase },
  {
    key: 'ecitizen',
    to: '/ecitizen',
    icon: Users,
    children: [
      { key: 'rti', to: '/ecitizen/rti' },
      { key: 'actsRules', to: '/ecitizen/acts' },
      { key: 'governmentOrders', to: '/ecitizen/government-orders' },
      { key: 'notifications', to: '/ecitizen/notifications' },
      { key: 'policiesEc', to: '/ecitizen/policies' },
      { key: 'guidelines', to: '/ecitizen/guidelines' },
      { key: 'faqs', to: '/ecitizen/faqs' },
      { key: 'usefulLinks', to: '/ecitizen/useful-links' },
      { key: 'itAct2000', to: '/ecitizen/it-act-2000' },
      { key: 'poshAct', to: '/ecitizen/posh-act' },
    ],
  },
  {
    key: 'tenders',
    to: '/tenders',
    icon: FileText,
    children: [
      { key: 'openTenders', to: '/tenders?status=open' },
      { key: 'closedTenders', to: '/tenders?status=closed' },
    ],
  },
  {
    key: 'media',
    to: '/media',
    icon: Newspaper,
    children: [
      { key: 'scienceStories', to: '/media/science-stories' },
      { key: 'events', to: '/media/events' },
    ],
  },
  { key: 'contact', to: '/contact', icon: Mail },
];

// Footer "Website Policies & Help" — statutory pages.
export const statutoryLinks = [
  { key: 'websitePolicy', to: '/policies/website-policy' },
  { key: 'privacyPolicy', to: '/policies/privacy-policy' },
  { key: 'termsOfUse', to: '/policies/terms-of-use' },
  { key: 'copyright', to: '/policies/copyright' },
  { key: 'disclaimer', to: '/policies/disclaimer' },
  { key: 'hyperlinkPolicy', to: '/policies/hyperlink-policy' },
  { key: 'accessibilityStatement', to: '/policies/accessibility-statement' },
  { key: 'screenReaderAccess', to: '/screen-reader-access' },
  { key: 'help', to: '/help' },
  { key: 'sitemap', to: '/sitemap' },
];

export const contact = {
  headOffice: {
    en: 'Department of Science, Technology & Innovation, Government of Andhra Pradesh, 3rd Floor, D-Block, AP Secretariat, Velagapudi, Amaravati – 522238, Andhra Pradesh, India',
    te: 'ఖగోళ, సాంకేతిక & ఆవిష్కరణ శాఖ, ఆంధ్రప్రదేశ్ ప్రభుత్వం, 3వ అంతస్తు, డి-బ్లాక్, ఏపీ సెక్రటేరియట్, వెలగపూడి, అమరావతి – 522238',
  },
  phone: '+91 863 244 1234',
  fax: '+91 863 244 1235',
  email: 'dsti@ap.gov.in',
  workingHours: 'Monday to Friday, 10:00 AM – 5:00 PM (except public holidays)',
};
