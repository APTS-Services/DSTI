// src/data/services.js — "What brings you here?" audience journeys.

export const audiences = [
  {
    id: 'citizens',
    icon: 'Users',
    title: { en: 'Citizens', te: 'పౌరులు' },
    blurb: {
      en: 'Access services, schemes, Right to Information and grievance redressal.',
      te: 'సేవలు, పథకాలు, సమాచార హక్కు మరియు ఫిర్యాదు పరిష్కారాన్ని పొందండి.',
    },
    links: [
      { key: 'rti', to: '/ecitizen/rti' },
      { key: 'governmentOrders', to: '/ecitizen/government-orders' },
      { key: 'faqs', to: '/ecitizen/faqs' },
      { key: 'contact', to: '/contact' },
    ],
  },
  {
    id: 'students',
    icon: 'GraduationCap',
    title: { en: 'Students', te: 'విద్యార్థులు' },
    blurb: {
      en: 'Explore science fairs, talent search programmes, internships and scholarships.',
      te: 'విజ్ఞాన ప్రదర్శనలు, ప్రతిభా అన్వేషణ కార్యక్రమాలు, ఇంటర్న్‌షిప్‌లు మరియు స్కాలర్‌షిప్‌లను అన్వేషించండి.',
    },
    links: [
      { key: 'events', to: '/media/events' },
      { key: 'scienceStories', to: '/media/science-stories' },
      { key: 'notificationsCirculars', to: '/ecitizen/notifications' },
      { key: 'awards', to: '/about/awards' },
    ],
  },
  {
    id: 'researchers',
    icon: 'FlaskConical',
    title: { en: 'Researchers', te: 'పరిశోధకులు' },
    blurb: {
      en: 'Find research grants, fellowships, policy documents and collaboration opportunities.',
      te: 'పరిశోధన గ్రాంట్లు, ఫెలోషిప్‌లు, విధాన పత్రాలు మరియు సహకార అవకాశాలను కనుగొనండి.',
    },
    links: [
      { key: 'policies', to: '/policies' },
      { key: 'documents', to: '/ecitizen/guidelines' },
      { key: 'organisations', to: '/organisations' },
      { key: 'ict', to: '/ict/projects' },
    ],
  },
  {
    id: 'investors',
    icon: 'Briefcase',
    title: { en: 'Investors', te: 'పెట్టుబడిదారులు' },
    blurb: {
      en: 'Learn about incentives, sector policies, land banks and single-window clearances.',
      te: 'ప్రోత్సాహకాలు, రంగ విధానాలు, భూ బ్యాంకులు మరియు ఏక్-విండో అనుమతుల గురించి తెలుసుకోండి.',
    },
    links: [
      { key: 'investors', to: '/investors' },
      { key: 'policies', to: '/policies' },
      { key: 'tenders', to: '/tenders' },
      { key: 'contact', to: '/contact' },
    ],
  },
];
