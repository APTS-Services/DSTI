// src/data/events.js — events (upcoming & past).

export const events = [
  {
    id: 'ev-1',
    title: { en: 'State Science Fair 2026', te: 'రాష్ట్ర విజ్ఞాన ప్రదర్శన 2026' },
    date: '2026-11-14',
    endDate: '2026-11-17',
    location: { en: 'Amaravati Convention Centre, Vijayawada', te: 'అమరావతి కన్వెన్షన్ సెంటర్, విజయవాడ' },
    district: 'ntr',
    category: 'Science Fair',
    status: 'upcoming',
    summary: {
      en: 'A four-day celebration of science with exhibitions, student projects, robotics and innovation challenges from every district.',
      te: 'ప్రతి జిల్లా నుండి ప్రదర్శనలు, విద్యార్థి ప్రాజెక్టులు, రోబోటిక్స్ మరియు ఆవిష్కరణ సవాళ్లతో నాలుగు రోజుల విజ్ఞాన వేడుక.',
    },
  },
  {
    id: 'ev-2',
    title: { en: 'Space-Tech Conclave 2026', te: 'స్పేస్-టెక్ సదస్సు 2026' },
    date: '2026-10-28',
    endDate: '2026-10-29',
    location: { en: 'Tirupati', te: 'తిరుపతి' },
    district: 'tirupati',
    category: 'Conclave',
    status: 'upcoming',
    summary: {
      en: 'Space-tech start-ups, ISRO partners and academia discuss the downstream space economy and Andhra Pradesh\u2019s role.',
      te: 'స్పేస్-టెక్ స్టార్టప్‌లు, ఇస్రో భాగస్వాములు మరియు అకాడమీ డౌన్‌స్ట్రీమ్ అంతరిక్ష ఆర్థిక వ్యవస్థపై చర్చిస్తారు.',
    },
  },
  {
    id: 'ev-3',
    title: { en: 'National Science Day 2026', te: 'జాతీయ విజ్ఞాన దినోత్సవం 2026' },
    date: '2027-02-28',
    location: { en: 'All districts', te: 'అన్ని జిల్లాలు' },
    district: 'all',
    category: 'Observance',
    status: 'upcoming',
    summary: {
      en: 'Science exhibitions, lectures and open-lab days mark the discovery of the Raman Effect across the State.',
      te: 'రామన్ ఎఫెక్ట్ ఆవిష్కరణను పురస్కరించుకుని రాష్ట్రవ్యాప్తంగా విజ్ఞాన ప్రదర్శనలు, ఉపన్యాసాలు, ఓపెన్-ల్యాబ్ రోజులు.',
    },
  },
  {
    id: 'ev-4',
    title: { en: 'Student Innovation Bootcamp — Rayalaseema', te: 'విద్యార్థి ఆవిష్కరణ శిబిరం — రాయలసీమ' },
    date: '2026-06-20',
    endDate: '2026-06-22',
    location: { en: 'Kurnool', te: 'కర్నూలు' },
    district: 'kurnool',
    category: 'Bootcamp',
    status: 'past',
    summary: {
      en: 'Three-day bootcamp mentoring 240 student teams on prototyping, design thinking and pitching.',
      te: 'ప్రోటోటైపింగ్, డిజైన్ థింకింగ్ మరియు పిచ్‌పై 240 విద్యార్థి జట్లకు మూడు రోజుల శిక్షణ శిబిరం.',
    },
  },
  {
    id: 'ev-5',
    title: { en: 'Drone Technology Workshop for Farmers', te: 'రైతులకు డ్రోన్ సాంకేతిక వర్క్‌షాప్' },
    date: '2026-05-12',
    location: { en: 'Guntur', te: 'గుంటూరు' },
    district: 'guntur',
    category: 'Workshop',
    status: 'past',
    summary: {
      en: 'Hands-on demonstration of drone spraying and crop-health mapping for farmer groups.',
      te: 'రైతు సమూహాలకు డ్రోన్ స్ప్రేయింగ్ మరియు పంట-ఆరోగ్య మ్యాపింగ్ ప్రదర్శన.',
    },
  },
  {
    id: 'ev-6',
    title: { en: 'Start-up Demo Day — Amaravati', te: 'స్టార్టప్ డెమో డే — అమరావతి' },
    date: '2026-04-08',
    location: { en: 'Vijayawada', te: 'విజయవాడ' },
    district: 'ntr',
    category: 'Showcase',
    status: 'past',
    summary: {
      en: 'Fifty start-ups pitched to investors and government departments for pilot deployment.',
      te: 'యాభై స్టార్టప్‌లు పెట్టుబడిదారులు మరియు ప్రభుత్వ శాఖలకు పైలట్ అమలు కోసం పిచ్ చేశాయి.',
    },
  },
];

export const upcomingEvents = events.filter((e) => e.status === 'upcoming');
export const pastEvents = events.filter((e) => e.status === 'past');
