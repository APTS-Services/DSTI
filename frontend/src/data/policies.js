// src/data/policies.js — the Department's sector policies.

export const policies = [
  {
    id: 'it-gcc',
    name: { en: 'IT & Global Capability Centres (GCC) Policy', te: 'ఐటీ & గ్లోబల్ కేపబిలిటీ సెంటర్ల (GCC) విధానం' },
    sector: 'Information Technology',
    year: 2024,
    status: 'In force',
    relatedOrgs: ['apts', 'apedc'],
    summary: {
      en: 'Positions Andhra Pradesh as the preferred destination for IT services and Global Capability Centres, with incentives for new units, expansion and job creation.',
      te: 'ఐటీ సేవలు మరియు గ్లోబల్ కేపబిలిటీ సెంటర్లకు ఆంధ్రప్రదేశ్‌ను ప్రధాన గమ్యస్థానంగా నిలిపే విధానం; కొత్త యూనిట్లు, విస్తరణ మరియు ఉద్యోగ సృష్టికి ప్రోత్సాహకాలు.',
    },
    objectives: [
      { en: 'Attract marquee IT and GCC investments', te: 'ప్రముఖ ఐటీ మరియు GCC పెట్టుబడులను ఆకర్షించడం' },
      { en: 'Create high-value technology jobs', te: 'అధిక-విలువ సాంకేతిక ఉద్యోగాల సృష్టి' },
      { en: 'Develop tier-2 and tier-3 IT destinations', te: 'టైర్-2 మరియు టైర్-3 ఐటీ గమ్యస్థానాల అభివృద్ధి' },
    ],
    incentives: [
      { en: 'Capital subsidy on fixed assets', te: 'స్థిర ఆస్తులపై మూలధన సబ్సిడీ' },
      { en: 'Employment-linked incentive per job created', te: 'సృష్టించిన ప్రతి ఉద్యోగానికి ఉద్యోగ-ఆధారిత ప్రోత్సాహకం' },
      { en: 'Stamp duty and electricity tariff reimbursement', te: 'స్టాంప్ డ్యూటీ మరియు విద్యుత్ టారిఫ్ వాపసు' },
    ],
  },
  {
    id: 'electronics',
    name: { en: 'Electronics Policy', te: 'ఎలక్ట్రానిక్స్ విధానం' },
    sector: 'Electronics',
    year: 2023,
    status: 'In force',
    relatedOrgs: ['apedc'],
    summary: {
      en: 'Builds a complete electronics manufacturing ecosystem, from components and PCB assembly to finished devices.',
      te: 'భాగాలు మరియు PCB అసెంబ్లీ నుండి పూర్తి పరికరాల వరకు పూర్తి ఎలక్ట్రానిక్స్ తయారీ పర్యావరణ వ్యవస్థను నిర్మించడం.',
    },
    objectives: [
      { en: 'Grow electronics manufacturing output', te: 'ఎలక్ట్రానిక్స్ తయారీ ఉత్పత్తిని పెంచడం' },
      { en: 'Develop electronics manufacturing clusters', te: 'ఎలక్ట్రానిక్స్ తయారీ క్లస్టర్ల అభివృద్ధి' },
      { en: 'Create a skilled electronics workforce', te: 'నైపుణ్యం కలిగిన ఎలక్ట్రానిక్స్ కార్మిక శక్తిని సృష్టించడం' },
    ],
    incentives: [
      { en: 'Capital subsidy linked to investment', te: 'పెట్టుబడికి అనుసంధానించిన మూలధన సబ్సిడీ' },
      { en: 'Interest subvention on term loans', te: 'సావధాన రుణాలపై వడ్డీ రాయితీ' },
      { en: 'Support for common facility centres', te: 'సాధారణ సౌకర్య కేంద్రాలకు మద్దతు' },
    ],
  },
  {
    id: 'semiconductor',
    name: { en: 'Semiconductor & Display Fab Policy', te: 'సెమీకండక్టర్ & డిస్ప్లే ఫ్యాబ్ విధానం' },
    sector: 'Semiconductors',
    year: 2024,
    status: 'In force',
    relatedOrgs: ['apedc'],
    summary: {
      en: 'Targets semiconductor fabrication, ATMP/OSAT units and display manufacturing with a competitive incentive package.',
      te: 'సెమీకండక్టర్ ఫ్యాబ్రికేషన్, ATMP/OSAT యూనిట్లు మరియు డిస్ప్లే తయారీని పోటీ ప్రోత్సాహక ప్యాకేజీతో లక్ష్యంగా పెట్టుకుంది.',
    },
    objectives: [
      { en: 'Establish semiconductor fabs and ATMP units', te: 'సెమీకండక్టర్ ఫ్యాబ్‌లు మరియు ATMP యూనిట్ల ఏర్పాటు' },
      { en: 'Build a semiconductor talent pipeline', te: 'సెమీకండక్టర్ నైపుణ్య పైప్‌లైన్ నిర్మాణం' },
      { en: 'Anchor the semiconductor supply chain', te: 'సెమీకండక్టర్ సరఫరా శృంఖలాన్ని స్థిరపరచడం' },
    ],
    incentives: [
      { en: 'Capital support for fab and ATMP projects', te: 'ఫ్యాబ్ మరియు ATMP ప్రాజెక్టులకు మూలధన మద్దతు' },
      { en: 'Land and utility concessions', te: 'భూమి మరియు యుటిలిటీ రాయితీలు' },
      { en: 'Skill development and training grants', te: 'నైపుణ్యాభివృద్ధి మరియు శిక్షణ గ్రాంట్లు' },
    ],
  },
  {
    id: 'data-centre',
    name: { en: 'Data Centre Policy', te: 'డేటా సెంటర్ విధానం' },
    sector: 'Data Centres',
    year: 2023,
    status: 'In force',
    relatedOrgs: ['apts'],
    summary: {
      en: 'Encourages hyperscale and edge data centres, making Andhra Pradesh a data-centre and cloud hub on the east coast.',
      te: 'హైపర్‌స్కేల్ మరియు ఎడ్జ్ డేటా సెంటర్లను ప్రోత్సహిస్తూ, ఆంధ్రప్రదేశ్‌ను తూర్పు తీరంలో డేటా సెంటర్ మరియు క్లౌడ్ హబ్‌గా మార్చడం.',
    },
    objectives: [
      { en: 'Attract hyperscale data-centre investment', te: 'హైపర్‌స్కేల్ డేటా సెంటర్ పెట్టుబడిని ఆకర్షించడం' },
      { en: 'Ensure reliable power and connectivity', te: 'నమ్మదగిన విద్యుత్ మరియు కనెక్టివిటీని నిర్ధారించడం' },
      { en: 'Grow the cloud and hosting ecosystem', te: 'క్లౌడ్ మరియు హోస్టింగ్ పర్యావరణ వ్యవస్థను పెంచడం' },
    ],
    incentives: [
      { en: 'Power tariff concessions for data centres', te: 'డేటా సెంటర్లకు విద్యుత్ టారిఫ్ రాయితీలు' },
      { en: 'Capital subsidy on IT infrastructure', te: 'ఐటీ మౌలిక సదుపాయాలపై మూలధన సబ్సిడీ' },
      { en: 'Single-window clearances', te: 'ఏక్-విండో అనుమతులు' },
    ],
  },
  {
    id: 'drone',
    name: { en: 'Drone Policy', te: 'డ్రోన్ విధానం' },
    sector: 'Drones & UAV',
    year: 2022,
    status: 'In force',
    relatedOrgs: ['apsac'],
    summary: {
      en: 'Promotes drone manufacturing, drone-as-a-service delivery and a drone pilot training ecosystem across the State.',
      te: 'రాష్ట్రవ్యాప్తంగా డ్రోన్ తయారీ, డ్రోన్-అస్-ఎ-సర్వీస్ మరియు డ్రోన్ పైలట్ శిక్షణ పర్యావరణ వ్యవస్థను ప్రోత్సహిస్తుంది.',
    },
    objectives: [
      { en: 'Establish drone manufacturing clusters', te: 'డ్రోన్ తయారీ క్లస్టర్ల ఏర్పాటు' },
      { en: 'Adopt drone services in agriculture and governance', te: 'వ్యవసాయం మరియు పరిపాలనలో డ్రోన్ సేవల స్వీకరణ' },
      { en: 'Create certified drone pilots', te: 'ధృవీకరించిన డ్రోన్ పైలట్ల సృష్టి' },
    ],
    incentives: [
      { en: 'Manufacturing and testing incentives', te: 'తయారీ మరియు పరీక్షల ప్రోత్సాహకాలు' },
      { en: 'Support for drone pilot training centres', te: 'డ్రోన్ పైలట్ శిక్షణ కేంద్రాలకు మద్దతు' },
      { en: 'Government procurement preference', te: 'ప్రభుత్వ కొనుగోలు ప్రాధాన్యత' },
    ],
  },
  {
    id: 'space',
    name: { en: 'Space-Tech Policy', te: 'అంతరిక్ష-టెక్ విధానం' },
    sector: 'Space Technology',
    year: 2023,
    status: 'In force',
    relatedOrgs: ['apsac', 'apsrac'],
    summary: {
      en: 'Builds a space-technology value chain of satellite manufacturing, launch support, ground stations and downstream applications.',
      te: 'ఉపగ్రహ తయారీ, ప్రయోగ మద్దతు, గ్రౌండ్ స్టేషన్లు మరియు డౌన్‌స్ట్రీమ్ అనువర్తనాల అంతరిక్ష-సాంకేతిక విలువ శృంఖలాన్ని నిర్మించడం.',
    },
    objectives: [
      { en: 'Grow space-tech start-ups and MSMEs', te: 'స్పేస్-టెక్ స్టార్టప్‌లు మరియు MSMEల వృద్ధి' },
      { en: 'Establish ground stations and test facilities', te: 'గ్రౌండ్ స్టేషన్లు మరియు పరీక్ష సౌకర్యాల ఏర్పాటు' },
      { en: 'Enable geospatial data-driven governance', te: 'భౌగోళిక డేటా-ఆధారిత పరిపాలనను సాధ్యం చేయడం' },
    ],
    incentives: [
      { en: 'Capital and R&D support for space-tech', te: 'స్పేస్-టెక్‌కు మూలధన మరియు పరిశోధన మద్దతు' },
      { en: 'Preference for Indian space-tech products', te: 'భారతీయ స్పేస్-టెక్ ఉత్పత్తులకు ప్రాధాన్యత' },
      { en: 'Incubation and testing infrastructure', te: 'ఇన్‌క్యుబేషన్ మరియు పరీక్ష మౌలిక సదుపాయాలు' },
    ],
  },
  {
    id: 'biotechnology',
    name: { en: 'Biotechnology Policy', te: 'జీవ సాంకేతిక విధానం' },
    sector: 'Life Sciences',
    year: 2021,
    status: 'In force',
    relatedOrgs: ['apmedtech'],
    summary: {
      en: 'Accelerates the life-sciences and biotechnology sector through research parks, incubation and industry partnerships.',
      te: 'పరిశోధన పార్కులు, ఇన్‌క్యుబేషన్ మరియు పరిశ్రమ భాగస్వామ్యాల ద్వారా జీవ విజ్ఞాన మరియు జీవ సాంకేతిక రంగాన్ని వేగవంతం చేస్తుంది.',
    },
    objectives: [
      { en: 'Promote biotech R&D and manufacturing', te: 'బయోటెక్ పరిశోధన మరియు తయారీని ప్రోత్సహించడం' },
      { en: 'Develop biotech parks and incubators', te: 'బయోటెక్ పార్కులు మరియు ఇన్‌క్యుబేటర్ల అభివృద్ధి' },
      { en: 'Strengthen industry–academia links', te: 'పరిశ్రమ–అకాడమీ సంబంధాలను బలోపేతం చేయడం' },
    ],
    incentives: [
      { en: 'Capital subsidy for biotech units', te: 'బయోటెక్ యూనిట్లకు మూలధన సబ్సిడీ' },
      { en: 'R&D grants and incubation support', te: 'పరిశోధన గ్రాంట్లు మరియు ఇన్‌క్యుబేషన్ మద్దతు' },
      { en: 'Skill and talent development', te: 'నైపుణ్య మరియు ప్రతిభావంతుల అభివృద్ధి' },
    ],
  },
  {
    id: 'science',
    name: { en: 'Science Policy', te: 'విజ్ఞాన విధానం' },
    sector: 'Science',
    year: 2022,
    status: 'In force',
    relatedOrgs: ['apcost', 'apcsti'],
    summary: {
      en: 'Promotes scientific temper, science education and grant support for basic and applied research across the State.',
      te: 'శాస్త్రీయ దృక్పథం, విజ్ఞాన విద్య మరియు రాష్ట్రవ్యాప్తంగా ప్రాథమిక మరియు అనువర్తిత పరిశోధనకు గ్రాంట్ మద్దతును ప్రోత్సహిస్తుంది.',
    },
    objectives: [
      { en: 'Strengthen scientific temper and outreach', te: 'శాస్త్రీయ దృక్పథం మరియు ప్రచారాన్ని బలోపేతం చేయడం' },
      { en: 'Support research grants and fellowships', te: 'పరిశోధన గ్రాంట్లు మరియు ఫెలోషిప్‌లకు మద్దతు' },
      { en: 'Improve science infrastructure in universities', te: 'విశ్వవిద్యాలయాల్లో విజ్ఞాన మౌలిక సదుపాయాల మెరుగుదల' },
    ],
    incentives: [
      { en: 'Research grants for institutions', te: 'సంస్థలకు పరిశోధన గ్రాంట్లు' },
      { en: 'Science popularisation programme funding', te: 'విజ్ఞాన ప్రచార కార్యక్రమాలకు నిధులు' },
      { en: 'Awards and fellowships for scientists', te: 'శాస్త్రవేత్తలకు అవార్డులు మరియు ఫెలోషిప్‌లు' },
    ],
  },
  {
    id: 'technology-innovation',
    name: { en: 'Technology & Innovation Policy', te: 'సాంకేతిక & ఆవిష్కరణ విధానం' },
    sector: 'Innovation',
    year: 2024,
    status: 'In force',
    relatedOrgs: ['apis', 'apcsti'],
    summary: {
      en: 'Creates a thriving innovation and start-up ecosystem with incubators, funding and a single window for emerging technologies.',
      te: 'ఇన్‌క్యుబేటర్లు, నిధులు మరియు ఉద్భవిస్తున్న సాంకేతికతలకు ఏక్-విండోతో వర్ధిల్లే ఆవిష్కరణ మరియు స్టార్టప్ పర్యావరణ వ్యవస్థను సృష్టించడం.',
    },
    objectives: [
      { en: 'Support start-ups from idea to scale', te: 'ఆలోచన నుండి స్కేల్ వరకు స్టార్టప్‌లకు మద్దతు' },
      { en: 'Establish incubators in every region', te: 'ప్రతి ప్రాంతంలో ఇన్‌క్యుబేటర్ల ఏర్పాటు' },
      { en: 'Promote emerging technologies: AI, IoT, blockchain', te: 'AI, IoT, బ్లాక్‌చెయిన్ వంటి ఉద్భవిస్తున్న సాంకేతికతల ప్రోత్సాహం' },
    ],
    incentives: [
      { en: 'Seed and scale-up funding', te: 'సీడ్ మరియు స్కేల్-అప్ నిధులు' },
      { en: 'Incubation and mentoring support', te: 'ఇన్‌క్యుబేషన్ మరియు మెంటరింగ్ మద్దతు' },
      { en: 'Innovation challenge grants', te: 'ఆవిష్కరణ ఛాలెంజ్ గ్రాంట్లు' },
    ],
  },
];

export const getPolicy = (id) => policies.find((p) => p.id === id);
