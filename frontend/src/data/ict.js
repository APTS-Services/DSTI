// src/data/ict.js — ICT: e-Governance initiatives and projects.

export const eGovernance = [
  {
    id: 'egov-1',
    name: { en: 'Integrated Departmental Service Portal', te: 'సమగ్ర శాఖా సేవా పోర్టల్' },
    summary: {
      en: 'A single digital window for all Department services, approvals, incentives and grievance redressal, integrated with Aadhaar and e-KYC.',
      te: 'అన్ని శాఖా సేవలు, అనుమతులు, ప్రోత్సాహకాలు మరియు ఫిర్యాదు పరిష్కారానికి ఒకే డిజిటల్ విండో; ఆధార్ మరియు ఈ-కేవైసీతో అనుసంధానం.',
    },
    status: 'Live',
    tags: ['Single window', 'e-KYC', 'Grievance'],
  },
  {
    id: 'egov-2',
    name: { en: 'Digital Document & e-Office', te: 'డిజిటల్ పత్రం & ఈ-ఆఫీసు' },
    summary: {
      en: 'Paperless file movement, digital signatures and an online record room for Government Orders, notifications and tenders.',
      te: 'పేపర్‌లెస్ ఫైల్ కదలిక, డిజిటల్ సంతకాలు మరియు ప్రభుత్వ ఆదేశాలు, నోటిఫికేషన్లు, టెండర్ల కోసం ఆన్‌లైన్ రికార్డ్ రూమ్.',
    },
    status: 'Live',
    tags: ['e-Office', 'Paperless', 'e-Sign'],
  },
  {
    id: 'egov-3',
    name: { en: 'Geospatial Decision Support', te: 'భౌగోళిక నిర్ణయ మద్దతు' },
    summary: {
      en: 'Satellite and GIS based dashboards for land use, crops, water bodies and disaster risk, used by multiple departments.',
      te: 'భూమి వినియోగం, పంటలు, నీటి వనరులు మరియు విపత్తు ప్రమాదం కోసం ఉపగ్రహ మరియు GIS ఆధారిత డాష్‌బోర్డులు.',
    },
    status: 'Live',
    tags: ['GIS', 'Remote sensing', 'Dashboards'],
  },
  {
    id: 'egov-4',
    name: { en: 'State Cyber-security Operations Centre', te: 'రాష్ట్ర సైబర్-భద్రతా కార్యకలాపాల కేంద్రం' },
    summary: {
      en: '24x7 monitoring aligned to the AP Cyber Security Framework, protecting departmental applications and citizen data.',
      te: 'ఏపీ సైబర్ భద్రతా ఫ్రేమ్‌వర్క్‌కు అనుగుణంగా 24x7 పర్యవేక్షణ, శాఖా అప్లికేషన్లు మరియు పౌరుల డేటాను రక్షించడం.',
    },
    status: 'Live',
    tags: ['Cyber security', 'SOC', 'OWASP'],
  },
];

export const projects = [
  {
    id: 'proj-1',
    name: { en: 'AP Fibre Grid & Last-Mile Connectivity', te: 'ఏపీ ఫైబర్ గ్రిడ్ & లాస్ట్-మైల్ కనెక్టివిటీ' },
    sector: 'Connectivity',
    summary: {
      en: 'Extending high-speed fibre to every village and government institution to enable digital service delivery.',
      te: 'డిజిటల్ సేవల అందజేతను సాధ్యం చేయడానికి ప్రతి గ్రామం మరియు ప్రభుత్వ సంస్థకు హై-స్పీడ్ ఫైబర్ విస్తరణ.',
    },
    status: 'Ongoing',
    progress: 78,
  },
  {
    id: 'proj-2',
    name: { en: 'Drone Services for Agriculture', te: 'వ్యవసాయానికి డ్రోన్ సేవలు' },
    sector: 'Drones',
    summary: {
      en: 'Drone-based crop health surveys, spraying and yield estimation deployed through village service centres.',
      te: 'గ్రామ సేవా కేంద్రాల ద్వారా డ్రోన్ ఆధారిత పంట ఆరోగ్య సర్వేలు, స్ప్రేయింగ్ మరియు దిగుబడి అంచనా.',
    },
    status: 'Ongoing',
    progress: 62,
  },
  {
    id: 'proj-3',
    name: { en: 'Space-Tech Incubation Park', te: 'స్పేస్-టెక్ ఇన్‌క్యుబేషన్ పార్క్' },
    sector: 'Space',
    summary: {
      en: 'A dedicated facility for space-tech start-ups with clean rooms, testing labs and a ground-station demonstrator.',
      te: 'క్లీన్ రూమ్‌లు, పరీక్ష ప్రయోగశాలలు మరియు గ్రౌండ్-స్టేషన్ ప్రదర్శనతో స్పేస్-టెక్ స్టార్టప్‌లకు అంకిత సౌకర్యం.',
    },
    status: 'In progress',
    progress: 45,
  },
  {
    id: 'proj-4',
    name: { en: 'AI & Emerging Technologies Mission', te: 'AI & ఉద్భవిస్తున్న సాంకేతికతల మిషన్' },
    sector: 'AI',
    summary: {
      en: 'Applied AI pilot projects in health, agriculture and citizen services, with an ethics and safety framework.',
      te: 'ఆరోగ్యం, వ్యవసాయం మరియు పౌర సేవలలో అనువర్తిత AI పైలట్ ప్రాజెక్టులు; నైతికత మరియు భద్రతా ఫ్రేమ్‌వర్క్‌తో.',
    },
    status: 'Ongoing',
    progress: 55,
  },
  {
    id: 'proj-5',
    name: { en: 'Semiconductor Fab & ATMP Cluster', te: 'సెమీకండక్టర్ ఫ్యాబ్ & ATMP క్లస్టర్' },
    sector: 'Semiconductors',
    summary: {
      en: 'Development of land, power and talent infrastructure for semiconductor and display manufacturing.',
      te: 'సెమీకండక్టర్ మరియు డిస్ప్లే తయారీ కోసం భూమి, విద్యుత్ మరియు ప్రతిభా మౌలిక సదుపాయాల అభివృద్ధి.',
    },
    status: 'In progress',
    progress: 38,
  },
  {
    id: 'proj-6',
    name: { en: 'Digital Literacy & Rural Innovation', te: 'డిజిటల్ అక్షరాస్యత & గ్రామీణ ఆవిష్కరణ' },
    sector: 'Skilling',
    summary: {
      en: 'Digital literacy drives and rural innovation centres to ensure inclusive access to technology.',
      te: 'సాంకేతికతకు సమగ్ర ప్రాప్యత కోసం డిజిటల్ అక్షరాస్యత కార్యక్రమాలు మరియు గ్రామీణ ఆవిష్కరణ కేంద్రాలు.',
    },
    status: 'Ongoing',
    progress: 70,
  },
];
