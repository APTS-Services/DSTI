// src/data/statutory.js — statutory / footer policy pages content.
// Each entry: slug, title, and an array of sections { heading, body[] }.

const P = (en, te) => ({ en, te });

export const statutoryPages = [
  {
    slug: 'website-policy',
    title: P('Website Policy', 'వెబ్‌సైట్ విధానం'),
    sections: [
      {
        heading: P('Purpose', 'ఉద్దేశ్యం'),
        body: [
          P('This website is the official website of the Department of Science, Technology & Innovation (DSTI), Government of Andhra Pradesh, and is developed and maintained in accordance with the Guidelines for Indian Government Websites (GIGW).',
            'ఈ వెబ్‌సైట్ ఆంధ్రప్రదేశ్ ప్రభుత్వ ఖగోళ, సాంకేతిక & ఆవిష్కరణ శాఖ (DSTI) అధికారిక వెబ్‌సైట్; భారత ప్రభుత్వ వెబ్‌సైట్ల మార్గదర్శకాల (GIGW) ప్రకారం రూపొందించి నిర్వహించబడుతుంది.'),
        ],
      },
      {
        heading: P('Content Management', 'విషయ నిర్వహణ'),
        body: [
          P('All content is published and updated by authorised officers of the Department through the Content Management System. The Department is responsible for the accuracy and currency of the information published.',
            'అన్ని విషయాలు శాఖ అధికారులచే విషయ నిర్వహణ వ్యవస్థ (CMS) ద్వారా ప్రచురించబడతాయి మరియు నవీకరించబడతాయి. ప్రచురిత సమాచారం ఖచ్చితత్వానికి శాఖ బాధ్యత వహిస్తుంది.'),
        ],
      },
      {
        heading: P('External Links', 'బాహ్య లింకులు'),
        body: [
          P('Links to external websites are provided for convenience. DSTI is not responsible for the content, accuracy or availability of external websites.',
            'బాహ్య వెబ్‌సైట్ల లింకులు సౌలభ్యం కోసం అందించబడతాయి. బాహ్య వెబ్‌సైట్ల విషయం, ఖచ్చితత్వం లేదా లభ్యతకు DSTI బాధ్యత వహించదు.'),
        ],
      },
    ],
  },
  {
    slug: 'privacy-policy',
    title: P('Privacy Policy', 'గోప్యతా విధానం'),
    sections: [
      {
        heading: P('Information We Collect', 'మేము సేకరించే సమాచారం'),
        body: [
          P('This website does not automatically capture any specific personal information that allows us to identify you, except when you voluntarily provide it through the Feedback form, RTI requests or subscription forms.',
            'మీరు అభిప్రాయ ఫారం, RTI అభ్యర్థనలు లేదా సభ్యత్వ ఫారాల ద్వారా స్వచ్ఛందంగా అందించిన సమాచారం మినహా, ఈ వెబ్‌సైట్ మీను గుర్తించగల వ్యక్తిగత సమాచారాన్ని స్వయంచాలకంగా సేకరించదు.'),
          P('When you do provide personal information, we collect only what is necessary to respond to your request, and store it securely on servers within Government-approved infrastructure.',
            'మీరు వ్యక్తిగత సమాచారం అందించినప్పుడు, మీ అభ్యర్థనకు ప్రతిస్పందించడానికి అవసరమైనది మాత్రమే సేకరిస్తాము మరియు ప్రభుత్వ ఆమోదిత మౌలిక సదుపాయాల్లోని సర్వర్లపై సురక్షితంగా నిల్వ చేస్తాము.'),
        ],
      },
      {
        heading: P('Cookies and Analytics', 'కుకీలు మరియు విశ్లేషణలు'),
        body: [
          P('The website uses only first-party, privacy-respecting analytics to count visitors and understand which pages are useful. No third-party trackers or advertising scripts are used.',
            'సందర్శకులను లెక్కించడానికి మరియు ఏ పేజీలు ఉపయోగకరమో అర్థం చేసుకోవడానికి ఈ వెబ్‌సైట్ ప్రథమ-పక్ష, గోప్యతను గౌరవించే విశ్లేషణలను మాత్రమే ఉపయోగిస్తుంది. థర్డ్-పార్టీ ట్రాకర్లు లేదా ప్రకటన స్క్రిప్ట్‌లు ఉపయోగించబడవు.'),
        ],
      },
      {
        heading: P('Disclosure', 'వెల్లడి'),
        body: [
          P('We do not sell, rent or share your personal information with third parties, except where required by law.',
            'చట్టం ద్వారా అవసరమైన సందర్భాల్లో తప్ప, మేము మీ వ్యక్తిగత సమాచారాన్ని థర్డ్-పార్టీలకు విక్రయించము, అద్దెకు ఇవ్వము లేదా పంచుకోము.'),
        ],
      },
    ],
  },
  {
    slug: 'terms-of-use',
    title: P('Terms of Use', 'ఉపయోగ నిబంధనలు'),
    sections: [
      {
        heading: P('Acceptance', 'ఆమోదం'),
        body: [
          P('By accessing this website you agree to these terms of use. The content is provided for general information and should not be treated as a substitute for official records or legal advice.',
            'ఈ వెబ్‌సైట్‌ను యాక్సెస్ చేయడం ద్వారా మీరు ఈ ఉపయోగ నిబంధనలను అంగీకరిస్తారు. విషయం సాధారణ సమాచారం కోసం; అధికారిక రికార్డులకు లేదా న్యాయ సలహాకు ప్రత్యామ్నాయంగా పరిగణించకూడదు.'),
        ],
      },
      {
        heading: P('Intellectual Property', 'మేధో సంపత్తి'),
        body: [
          P('All content, design files and source code belong to the Department and may not be reproduced for commercial purposes without written permission.',
            'అన్ని విషయాలు, డిజైన్ ఫైళ్లు మరియు సోర్స్ కోడ్ శాఖకు చెందుతాయి; లిఖిత అనుమతి లేకుండా వాణిజ్య ప్రయోజనాల కోసం పునరుత్పత్తి చేయకూడదు.'),
        ],
      },
    ],
  },
  {
    slug: 'copyright',
    title: P('Copyright', 'కాపీరైట్'),
    sections: [
      {
        heading: P('Ownership', 'యాజమాన్యం'),
        body: [
          P('© Government of Andhra Pradesh, Department of Science, Technology & Innovation. All rights reserved. The source code, design files, content and all rights in them belong to the Department and shall be handed over at the end of the support period or earlier if asked.',
            '© ఆంధ్రప్రదేశ్ ప్రభుత్వం, ఖగోళ, సాంకేతిక & ఆవిష్కరణ శాఖ. సర్వ హక్కులు కలవు. సోర్స్ కోడ్, డిజైన్ ఫైళ్లు, విషయం మరియు వాటిపై ఉన్న అన్ని హక్కులు శాఖకు చెందుతాయి.'),
        ],
      },
    ],
  },
  {
    slug: 'disclaimer',
    title: P('Disclaimer', 'నిరాకరణ'),
    sections: [
      {
        heading: P('Information Accuracy', 'సమాచార ఖచ్చితత్వం'),
        body: [
          P('While every effort is made to keep the information on this website correct and up to date, the Department does not guarantee its completeness or accuracy. Official records held in the Department prevail in case of any discrepancy.',
            'ఈ వెబ్‌సైట్‌లోని సమాచారాన్ని సరైనదిగా, తాజాగా ఉంచడానికి ప్రయత్నించినప్పటికీ, శాఖ దాని సంపూర్ణత లేదా ఖచ్చితత్వానికి హామీ ఇవ్వదు. ఏదైనా వ్యత్యాసం ఉన్నప్పుడు శాఖ వద్ద ఉన్న అధికారిక రికార్డులే ప్రామాణికం.'),
        ],
      },
    ],
  },
  {
    slug: 'hyperlink-policy',
    title: P('Hyperlink Policy', 'హైపర్‌లింక్ విధానం'),
    sections: [
      {
        heading: P('Links to Our Website', 'మా వెబ్‌సైట్‌కు లింకులు'),
        body: [
          P('Other websites may link to this website provided the link clearly identifies DSTI and its official status. The Department reserves the right to request removal of any link.',
            'ఇతర వెబ్‌సైట్లు ఈ వెబ్‌సైట్‌కు లింక్ చేయవచ్చు, అయితే ఆ లింక్ DSTI మరియు దాని అధికారిక స్థితిని స్పష్టంగా గుర్తించాలి. ఏదైనా లింక్ తొలగించమని కోరే హక్కు శాఖకు ఉంది.'),
        ],
      },
      {
        heading: P('Links from Our Website', 'మా వెబ్‌సైట్ నుండి లింకులు'),
        body: [
          P('Links to external websites are provided for convenience and do not imply endorsement. Please read the privacy and security policies of external websites before using them.',
            'బాహ్య వెబ్‌సైట్ల లింకులు సౌలభ్యం కోసం అందించబడతాయి; అవి ఆమోదాన్ని సూచించవు. వాటిని ఉపయోగించే ముందు బాహ్య వెబ్‌సైట్ల గోప్యత, భద్రతా విధానాలను చదవండి.'),
        ],
      },
    ],
  },
  {
    slug: 'accessibility-statement',
    title: P('Accessibility Statement', 'ప్రాప్యత ప్రకటన'),
    sections: [
      {
        heading: P('Our Commitment', 'మా నిబద్ధత'),
        body: [
          P('DSTI is committed to making this website accessible to all users, including persons with disabilities, and aims to conform to the Guidelines for Indian Government Websites (GIGW 3.0) and the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.',
            'DSTI ఈ వెబ్‌సైట్‌ను వికలాంగులతో సహా అందరు వినియోగదారులకు ప్రాప్యత కలిగించడానికి కట్టుబడి ఉంది; GIGW 3.0 మరియు WCAG 2.1 స్థాయి AA కి అనుగుణంగా ఉండే లక్ష్యం.'),
        ],
      },
      {
        heading: P('Accessibility Features', 'ప్రాప్యత లక్షణాలు'),
        body: [
          P('The website provides a skip-to-main-content link, full keyboard navigation, visible focus outlines, screen-reader support with ARIA labels, resizable text (up to 140%), a high-contrast mode and a dark mode. An interactive District Explorer also offers an equivalent table view.',
            'ఈ వెబ్‌సైట్ స్కిప్-టు-మెయిన్ లింక్, పూర్తి కీబోర్డ్ నావిగేషన్, కనిపించే ఫోకస్, ARIA లేబుల్స్‌తో స్క్రీన్ రీడర్ మద్దతు, పెంచగల అక్షరాలు (140% వరకు), అధిక-కాంట్రాస్ట్ మరియు చీకటి రూపాన్ని అందిస్తుంది.'),
        ],
      },
      {
        heading: P('Feedback', 'అభిప్రాయం'),
        body: [
          P('If you face any difficulty in accessing any part of this website, please write to dsti@ap.gov.in. We will try to resolve the issue and provide the information in an alternative format.',
            'ఈ వెబ్‌సైట్‌లో ఏదైనా భాగాన్ని యాక్సెస్ చేయడంలో ఇబ్బంది ఎదురైతే dsti@ap.gov.in కు రాయండి. సమస్యను పరిష్కరించి ప్రత్యామ్నాయ ఆకృతిలో సమాచారాన్ని అందించడానికి ప్రయత్నిస్తాము.'),
        ],
      },
    ],
  },
];

export const getStatutoryPage = (slug) => statutoryPages.find((p) => p.slug === slug);
