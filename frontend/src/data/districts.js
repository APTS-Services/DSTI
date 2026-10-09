// src/data/districts.js
// All 26 districts of Andhra Pradesh, with a schematic map position (viewBox 0 0 600 700)
// and the science & technology institutions / activities located there.
// `x` / `y` place each district node on the interactive District Explorer map.

export const regions = [
  // Region colours drawn from the GIGW/UX4G palette; all have >= 3:1 contrast on white.
  { id: 'north-coastal', en: 'North Coastal Andhra', te: 'ఉత్తర తీరాంధ్ర', color: '#4a2bc2' },
  { id: 'godavari', en: 'Godavari Region', te: 'గోదావరి ప్రాంతం', color: '#8e55b3' },
  { id: 'krishna', en: 'Krishna Region', te: 'కృష్ణా ప్రాంతం', color: '#1157ce' },
  { id: 'south-coastal', en: 'South Coastal Andhra', te: 'దక్షిణ తీరాంధ్ర', color: '#08979c' },
  { id: 'rayalaseema', en: 'Rayalaseema', te: 'రాయలసీమ', color: '#a46800' },
];

export const districts = [
  {
    id: 'srikakulam', name: { en: 'Srikakulam', te: 'శ్రీకాకుళం' }, region: 'north-coastal',
    hq: 'Srikakulam', x: 322, y: 46,
    institutions: [
      { name: { en: 'JNTU-GV Regional Centre', te: 'జెఎన్‌టియు-జివి ప్రాంతీయ కేంద్రం' }, type: 'Institution' },
      { name: { en: 'District Science Centre', te: 'జిల్లా విజ్ఞాన కేంద్రం' }, type: 'Science Centre' },
    ],
    activities: [{ en: 'National Science Day expo', te: 'జాతీయ విజ్ఞాన దినోత్సవ ప్రదర్శన' }],
  },
  {
    id: 'vizianagaram', name: { en: 'Vizianagaram', te: 'విజయనగరం' }, region: 'north-coastal',
    hq: 'Vizianagaram', x: 262, y: 82,
    institutions: [
      { name: { en: 'Maharajah\u2019s College (Autonomous)', te: 'మహారాజా కళాశాల' }, type: 'Institution' },
      { name: { en: 'AP Innovation Society Hub', te: 'ఏపీ ఇన్నోవేషన్ సొసైటీ హబ్' }, type: 'Innovation Hub' },
    ],
    activities: [{ en: 'Student innovation bootcamp', te: 'విద్యార్థి ఆవిష్కరణ శిబిరం' }],
  },
  {
    id: 'parvathipuram-manyam', name: { en: 'Parvathipuram Manyam', te: 'పార్వతీపురం మన్యం' }, region: 'north-coastal',
    hq: 'Parvathipuram', x: 212, y: 104,
    institutions: [{ name: { en: 'Tribal Science Outreach Centre', te: 'గిరిజన విజ్ఞాన కేంద్రం' }, type: 'Outreach' }],
    activities: [{ en: 'Science outreach in tribal schools', te: 'గిరిజన పాఠశాలల్లో విజ్ఞాన ప్రచారం' }],
  },
  {
    id: 'alluri-sitharama-raju', name: { en: 'Alluri Sitharama Raju', te: 'అల్లూరి సీతారామరాజు' }, region: 'north-coastal',
    hq: 'Paderu', x: 216, y: 158,
    institutions: [{ name: { en: 'Eastern Ghats Biodiversity Lab', te: 'తూర్పు కనుమల జీవవైవిధ్య ప్రయోగశాల' }, type: 'Research' }],
    activities: [{ en: 'Biodiversity documentation drive', te: 'జీవవైవిధ్య నమోదు కార్యక్రమం' }],
  },
  {
    id: 'visakhapatnam', name: { en: 'Visakhapatnam', te: 'విశాఖపట్నం' }, region: 'north-coastal',
    hq: 'Visakhapatnam', x: 278, y: 128,
    institutions: [
      { name: { en: 'Andhra University', te: 'ఆంధ్ర విశ్వవిద్యాలయం' }, type: 'University' },
      { name: { en: 'Millet & Deep-Tech Incubation Centre', te: 'చిరుధాన్య & డీప్-టెక్ ఇన్‌క్యుబేషన్ కేంద్రం' }, type: 'Incubator' },
    ],
    activities: [{ en: 'Coastal science conclave', te: 'తీర విజ్ఞాన సదస్సు' }],
  },
  {
    id: 'anakapalli', name: { en: 'Anakapalli', te: 'అనకాపల్లి' }, region: 'north-coastal',
    hq: 'Anakapalli', x: 258, y: 172,
    institutions: [{ name: { en: 'Pharma & Life Sciences Cluster', te: 'ఫార్మా & జీవ విజ్ఞాన క్లస్టర్' }, type: 'Cluster' }],
    activities: [{ en: 'Industry–academia meet', te: 'పరిశ్రమ–అకాడమీ సమావేశం' }],
  },
  {
    id: 'kakinada', name: { en: 'Kakinada', te: 'కాకినాడ' }, region: 'godavari',
    hq: 'Kakinada', x: 306, y: 222,
    institutions: [
      { name: { en: 'JNTU Kakinada', te: 'జెఎన్‌టియు కాకినాడ' }, type: 'University' },
      { name: { en: 'Blue Economy & Marine Tech Park', te: 'నీలి ఆర్థిక వ్యవస్థ & సముద్ర సాంకేతిక పార్క్' }, type: 'Tech Park' },
    ],
    activities: [{ en: 'Marine robotics workshop', te: 'సముద్ర రోబోటిక్స్ వర్క్‌షాప్' }],
  },
  {
    id: 'konaseema', name: { en: 'Dr. B.R. Ambedkar Konaseema', te: 'డాక్టర్ బి.ఆర్. అంబేద్కర్ కోనసీమ' }, region: 'godavari',
    hq: 'Amalapuram', x: 300, y: 262,
    institutions: [{ name: { en: 'Aquaculture Technology Centre', te: 'ఆక్వాకల్చర్ సాంకేతిక కేంద్రం' }, type: 'Research' }],
    activities: [{ en: 'Aqua-tech farmer training', te: 'ఆక్వా-టెక్ రైతు శిక్షణ' }],
  },
  {
    id: 'east-godavari', name: { en: 'East Godavari', te: 'తూర్పు గోదావరి' }, region: 'godavari',
    hq: 'Rajahmundry', x: 252, y: 248,
    institutions: [{ name: { en: 'Godavari Institute of Engineering & Technology', te: 'గోదావరి ఇంజినీరింగ్ & టెక్నాలజీ సంస్థ' }, type: 'Institution' }],
    activities: [{ en: 'River basin research programme', te: 'నదీ పరీవాహక పరిశోధన కార్యక్రమం' }],
  },
  {
    id: 'west-godavari', name: { en: 'West Godavari', te: 'పశ్చిమ గోదావరి' }, region: 'godavari',
    hq: 'Bhimavaram', x: 214, y: 288,
    institutions: [{ name: { en: 'Agri-Tech Research Station', te: 'వ్యవసాయ-సాంకేతిక పరిశోధన కేంద్రం' }, type: 'Research' }],
    activities: [{ en: 'Precision farming demo', te: 'ఖచ్చిత వ్యవసాయ ప్రదర్శన' }],
  },
  {
    id: 'eluru', name: { en: 'Eluru', te: 'ఏలూరు' }, region: 'godavari',
    hq: 'Eluru', x: 198, y: 252,
    institutions: [{ name: { en: 'Millet Research & Processing Centre', te: 'చిరుధాన్య పరిశోధన & ప్రాసెసింగ్ కేంద్రం' }, type: 'Research' }],
    activities: [{ en: 'Millet value-chain workshop', te: 'చిరుధాన్య విలువ-శృంఖల వర్క్‌షాప్' }],
  },
  {
    id: 'krishna', name: { en: 'Krishna', te: 'కృష్ణా' }, region: 'krishna',
    hq: 'Machilipatnam', x: 242, y: 308,
    institutions: [{ name: { en: 'Krishna University', te: 'కృష్ణా విశ్వవిద్యాలయం' }, type: 'University' }],
    activities: [{ en: 'Coastal erosion monitoring', te: 'తీర కోత పర్యవేక్షణ' }],
  },
  {
    id: 'ntr', name: { en: 'NTR', te: 'ఎన్‌టీఆర్' }, region: 'krishna',
    hq: 'Vijayawada', x: 252, y: 278,
    institutions: [
      { name: { en: 'AP Innovation & Start-up Hub', te: 'ఏపీ ఇన్నోవేషన్ & స్టార్టప్ హబ్' }, type: 'Incubator' },
      { name: { en: 'SRM University-AP', te: 'ఎస్‌ఆర్‌ఎం విశ్వవిద్యాలయం-ఏపీ' }, type: 'University' },
    ],
    activities: [{ en: 'Start-up showcase & demo day', te: 'స్టార్టప్ ప్రదర్శన & డెమో డే' }],
  },
  {
    id: 'guntur', name: { en: 'Guntur', te: 'గుంటూరు' }, region: 'krishna',
    hq: 'Guntur', x: 256, y: 348,
    institutions: [
      { name: { en: 'Acharya Nagarjuna University', te: 'ఆచార్య నాగార్జున విశ్వవిద్యాలయం' }, type: 'University' },
      { name: { en: 'Chilli & Spice Technology Centre', te: 'మిరప & సుగంధ సాంకేతిక కేంద్రం' }, type: 'Research' },
    ],
    activities: [{ en: 'Food-tech innovation challenge', te: 'ఫుడ్-టెక్ ఆవిష్కరణ సవాలు' }],
  },
  {
    id: 'palnadu', name: { en: 'Palnadu', te: 'పల్నాడు' }, region: 'krishna',
    hq: 'Narasaraopet', x: 214, y: 334,
    institutions: [{ name: { en: 'Skill & Vocational Technology Centre', te: 'నైపుణ్య & వృత్తి సాంకేతిక కేంద్రం' }, type: 'Skill Centre' }],
    activities: [{ en: 'Rural skill development camp', te: 'గ్రామీణ నైపుణ్యాభివృద్ధి శిబిరం' }],
  },
  {
    id: 'bapatla', name: { en: 'Bapatla', te: 'బాపట్ల' }, region: 'south-coastal',
    hq: 'Bapatla', x: 266, y: 388,
    institutions: [{ name: { en: 'Agricultural College & Research Institute', te: 'వ్యవసాయ కళాశాల & పరిశోధన సంస్థ' }, type: 'Research' }],
    activities: [{ en: 'Climate-resilient crops field day', te: 'వాతావరణ-నిరోధక పంటల క్షేత్ర దినం' }],
  },
  {
    id: 'prakasam', name: { en: 'Prakasam', te: 'ప్రకాశం' }, region: 'south-coastal',
    hq: 'Ongole', x: 256, y: 428,
    institutions: [{ name: { en: 'Solar & Renewable Energy Park', te: 'సౌర & పునరుత్పాదక ఇంధన పార్క్' }, type: 'Tech Park' }],
    activities: [{ en: 'Renewable energy awareness drive', te: 'పునరుత్పాదక ఇంధన అవగాహన కార్యక్రమం' }],
  },
  {
    id: 'spsr-nellore', name: { en: 'Sri Potti Sriramulu Nellore', te: 'శ్రీ పొట్టి శ్రీరాములు నెల్లూరు' }, region: 'south-coastal',
    hq: 'Nellore', x: 272, y: 472,
    institutions: [{ name: { en: 'Krishnapatnam Industrial & Tech Zone', te: 'కృష్ణపట్నం పారిశ్రామిక & టెక్ జోన్' }, type: 'Cluster' }],
    activities: [{ en: 'Industrial automation seminar', te: 'పారిశ్రామిక ఆటోమేషన్ సదస్సు' }],
  },
  {
    id: 'tirupati', name: { en: 'Tirupati', te: 'తిరుపతి' }, region: 'south-coastal',
    hq: 'Tirupati', x: 252, y: 512,
    institutions: [
      { name: { en: 'IIT Tirupati', te: 'ఐఐటీ తిరుపతి' }, type: 'University' },
      { name: { en: 'Sri Venkateswara University', te: 'శ్రీ వేంకటేశ్వర విశ్వవిద్యాలయం' }, type: 'University' },
    ],
    activities: [{ en: 'Space-tech student symposium', te: 'అంతరిక్ష-టెక్ విద్యార్థి సదస్సు' }],
  },
  {
    id: 'chittoor', name: { en: 'Chittoor', te: 'చిత్తూరు' }, region: 'rayalaseema',
    hq: 'Chittoor', x: 228, y: 562,
    institutions: [{ name: { en: 'Electronics Manufacturing Cluster', te: 'ఎలక్ట్రానిక్స్ తయారీ క్లస్టర్' }, type: 'Cluster' }],
    activities: [{ en: 'Electronics skill programme', te: 'ఎలక్ట్రానిక్స్ నైపుణ్య కార్యక్రమం' }],
  },
  {
    id: 'annamayya', name: { en: 'Annamayya', te: 'అన్నమయ్య' }, region: 'rayalaseema',
    hq: 'Rayachoti', x: 204, y: 522,
    institutions: [{ name: { en: 'Sericulture Technology Centre', te: 'పట్టు పరిశ్రమ సాంకేతిక కేంద్రం' }, type: 'Research' }],
    activities: [{ en: 'Sericulture modernisation workshop', te: 'పట్టు ఆధునీకరణ వర్క్‌షాప్' }],
  },
  {
    id: 'kadapa', name: { en: 'YSR Kadapa', te: 'వైఎస్ఆర్ కడప' }, region: 'rayalaseema',
    hq: 'Kadapa', x: 178, y: 482,
    institutions: [{ name: { en: 'Yogi Vemana University', te: 'యోగి వేమన విశ్వవిద్యాలయం' }, type: 'University' }],
    activities: [{ en: 'Mineral & materials science meet', te: 'ఖనిజ & పదార్థ విజ్ఞాన సమావేశం' }],
  },
  {
    id: 'anantapur', name: { en: 'Anantapur', te: 'అనంతపురం' }, region: 'rayalaseema',
    hq: 'Anantapur', x: 122, y: 502,
    institutions: [
      { name: { en: 'JNTU Anantapur', te: 'జెఎన్‌టియు అనంతపురం' }, type: 'University' },
      { name: { en: 'National Institute of Technology (proposed)', te: 'జాతీయ సాంకేతిక సంస్థ (ప్రతిపాదిత)' }, type: 'Institution' },
    ],
    activities: [{ en: 'Dryland agriculture tech camp', te: 'ఎండు భూమి వ్యవసాయ టెక్ శిబిరం' }],
  },
  {
    id: 'sri-sathya-sai', name: { en: 'Sri Sathya Sai', te: 'శ్రీ సత్యసాయి' }, region: 'rayalaseema',
    hq: 'Puttaparthi', x: 150, y: 442,
    institutions: [{ name: { en: 'Sri Sathya Sai Institute of Higher Learning', te: 'శ్రీ సత్యసాయి ఉన్నత విద్యా సంస్థ' }, type: 'University' }],
    activities: [{ en: 'Health-tech & AI in medicine workshop', te: 'హెల్త్-టెక్ & వైద్యంలో AI వర్క్‌షాప్' }],
  },
  {
    id: 'kurnool', name: { en: 'Kurnool', te: 'కర్నూలు' }, region: 'rayalaseema',
    hq: 'Kurnool', x: 156, y: 360,
    institutions: [{ name: { en: 'Rayalaseema University', te: 'రాయలసీమ విశ్వవిద్యాలయం' }, type: 'University' }],
    activities: [{ en: 'Science exhibition for schools', te: 'పాఠశాలల విజ్ఞాన ప్రదర్శన' }],
  },
  {
    id: 'nandyal', name: { en: 'Nandyal', te: 'నంద్యాల' }, region: 'rayalaseema',
    hq: 'Nandyal', x: 176, y: 404,
    institutions: [{ name: { en: 'Solar Manufacturing & Research Park', te: 'సౌర తయారీ & పరిశోధన పార్క్' }, type: 'Tech Park' }],
    activities: [{ en: 'Clean energy technology conclave', te: 'స్వచ్ఛ ఇంధన సాంకేతిక సదస్సు' }],
  },
];

export const getDistrict = (id) => districts.find((d) => d.id === id);
export const getRegion = (id) => regions.find((r) => r.id === id);
