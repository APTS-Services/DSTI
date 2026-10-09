// src/data/almanac.js — Science Almanac: science days, observances, "this day in science".

// Recurring observances (month is 1-12).
export const scienceDays = [
  { month: 1, day: 12, name: { en: 'National Youth Day', te: 'జాతీయ యువజన దినోత్సవం' }, theme: 'Science & Youth' },
  { month: 2, day: 11, name: { en: 'International Day of Women and Girls in Science', te: 'విజ్ఞానంలో మహిళలు & బాలికల అంతర్జాతీయ దినం' }, theme: 'Inclusion' },
  { month: 2, day: 28, name: { en: 'National Science Day', te: 'జాతీయ విజ్ఞాన దినోత్సవం' }, theme: 'Raman Effect' },
  { month: 3, day: 23, name: { en: 'World Meteorological Day', te: 'ప్రపంచ పవన దినోత్సవం' }, theme: 'Weather & Climate' },
  { month: 4, day: 22, name: { en: 'Earth Day', te: 'భూమి దినోత్సవం' }, theme: 'Environment' },
  { month: 5, day: 17, name: { en: 'World Telecommunication Day', te: 'ప్రపంచ టెలికమ్యూనికేషన్ దినోత్సవం' }, theme: 'Connectivity' },
  { month: 6, day: 5, name: { en: 'World Environment Day', te: 'ప్రపంచ పర్యావరణ దినోత్సవం' }, theme: 'Sustainability' },
  { month: 7, day: 11, name: { en: 'World Population Day', te: 'ప్రపంచ జనాభా దినోత్సవం' }, theme: 'Data & Demography' },
  { month: 8, day: 12, name: { en: 'International Youth Day', te: 'అంతర్జాతీయ యువజన దినం' }, theme: 'Innovation' },
  { month: 9, day: 5, name: { en: 'Teachers\u2019 Day', te: 'ఉపాధ్యాయ దినోత్సవం' }, theme: 'Science Education' },
  { month: 10, day: 4, name: { en: 'World Space Week begins', te: 'ప్రపంచ అంతరిక్ష వారం ప్రారంభం' }, theme: 'Space' },
  { month: 11, day: 10, name: { en: 'World Science Day for Peace & Development', te: 'శాంతి & అభివృద్ధి కోసం ప్రపంచ విజ్ఞాన దినం' }, theme: 'Science for Society' },
  { month: 12, day: 2, name: { en: 'National Pollution Control Day', te: 'జాతీయ కాలుష్య నియంత్రణ దినం' }, theme: 'Clean Technology' },
];

// "This day in science" — keyed by MM-DD. Used on the home page and almanac page.
export const thisDayInScience = {
  '01-04': { en: 'In 1643, Isaac Newton was born — his laws of motion and gravitation shaped modern physics.', te: '1643లో ఐజాక్ న్యూటన్ జన్మించారు — ఆయన చలన, గురుత్వాకర్షణ నియమాలు ఆధునిక భౌతిక శాస్త్రాన్ని రూపొందించాయి.' },
  '02-28': { en: 'In 1928, C.V. Raman announced the Raman Effect, which won India its first science Nobel Prize.', te: '1928లో సి.వి. రామన్ రామన్ ఎఫెక్ట్‌ను ప్రకటించారు — ఇది భారతదేశానికి మొదటి విజ్ఞాన నోబెల్ బహుమతిని అందించింది.' },
  '04-12': { en: 'In 1961, Yuri Gagarin became the first human in space aboard Vostok 1.', te: '1961లో యూరీ గగారిన్ వోస్టాక్ 1లో అంతరిక్షంలోకి వెళ్లిన మొదటి మనిషి అయ్యారు.' },
  '05-23': { en: 'In 1983, India launched its first satellite programme milestone with INSAT-1B.', te: '1983లో భారతదేశం INSAT-1Bతో తన మొదటి ఉపగ్రహ కార్యక్రమ మైలురాయిని సాధించింది.' },
  '07-20': { en: 'In 1969, Apollo 11 landed on the Moon — humanity\u2019s first steps on another world.', te: '1969లో అపోలో 11 చంద్రుడిపై దిగింది — మరో ప్రపంచంపై మానవుని మొదటి అడుగులు.' },
  '08-15': { en: 'In 1969, ISRO was founded to harness space technology for national development.', te: '1969లో జాతీయ అభివృద్ధి కోసం అంతరిక్ష సాంకేతికతను వినియోగించడానికి ఇస్రో స్థాపించబడింది.' },
  '09-05': { en: 'In 1972, India\u2019s first space-based experiment programme expanded with Aryabhata\u2019s design.', te: '1972లో ఆర్యభట్ట రూపకల్పనతో భారతదేశ మొదటి అంతరిక్ష ప్రయోగ కార్యక్రమం విస్తరించింది.' },
  '10-04': { en: 'In 1957, Sputnik 1 became the first artificial satellite to orbit the Earth.', te: '1957లో స్పుత్నిక్ 1 భూమిని చుట్టిన మొదటి కృత్రిమ ఉపగ్రహం అయింది.' },
  '11-07': { en: 'In 1867, Marie Curie was born — the first person to win two Nobel Prizes in science.', te: '1867లో మేరీ క్యూరీ జన్మించారు — విజ్ఞానంలో రెండు నోబెల్ బహుమతులు గెలిచిన మొదటి వ్యక్తి.' },
  '12-10': { en: 'In 1815, Ada Lovelace was born — widely regarded as the first computer programmer.', te: '1815లో అడా లవ్‌లేస్ జన్మించారు — మొదటి కంప్యూటర్ ప్రోగ్రామర్‌గా పరిగణించబడుతుంది.' },
};

export function upcomingScienceDays(limit = 5, from = new Date()) {
  const y = from.getFullYear();
  const list = scienceDays
    .map((d) => {
      let date = new Date(y, d.month - 1, d.day);
      if (date < from) date = new Date(y + 1, d.month - 1, d.day);
      return { ...d, date };
    })
    .sort((a, b) => a.date - b.date);
  return list.slice(0, limit);
}

export function todayInScience(from = new Date()) {
  const key = `${String(from.getMonth() + 1).padStart(2, '0')}-${String(from.getDate()).padStart(2, '0')}`;
  if (thisDayInScience[key]) return { key, text: thisDayInScience[key] };
  // Fall back to the nearest entry so the widget always shows something.
  const keys = Object.keys(thisDayInScience);
  const nearest = keys.reduce((best, k) => (Math.abs(k.localeCompare(key)) < Math.abs(best.localeCompare(key)) ? k : best), keys[0]);
  return { key: nearest, text: thisDayInScience[nearest] };
}
