// src/data/documents.js — document repository records.
// type: go | notification | circular | act | rule | guideline
// These feed the searchable, filterable, date-sortable repository with PDF download.

export const documents = [
  // ---- Government Orders ----
  {
    id: 'go-42', type: 'go', number: 'G.O.Ms.No.42', date: '2026-09-12',
    title: { en: 'Establishment of the Space-Tech Incubation Park at Tirupati', te: 'తిరుపతిలో స్పేస్-టెక్ ఇన్‌క్యుబేషన్ పార్క్ ఏర్పాటు' },
    department: 'Science, Technology & Innovation', file: '/pdfs/go/GO-42-2026.pdf', size: '420 KB',
  },
  {
    id: 'go-38', type: 'go', number: 'G.O.Ms.No.38', date: '2026-08-24',
    title: { en: 'Sanction of funds for the State Science Fair 2026', te: 'రాష్ట్ర విజ్ఞాన ప్రదర్శన 2026 కోసం నిధుల మంజూరు' },
    department: 'Science, Technology & Innovation', file: '/pdfs/go/GO-38-2026.pdf', size: '310 KB',
  },
  {
    id: 'go-27', type: 'go', number: 'G.O.Ms.No.27', date: '2026-06-05',
    title: { en: 'Notifying the Drone Policy implementation guidelines', te: 'డ్రోన్ విధాన అమలు మార్గదర్శకాల నోటిఫికేషన్' },
    department: 'Science, Technology & Innovation', file: '/pdfs/go/GO-27-2026.pdf', size: '1.1 MB',
  },
  {
    id: 'go-15', type: 'go', number: 'G.O.Ms.No.15', date: '2026-03-18',
    title: { en: 'Constitution of the AP Council for Science, Technology & Innovation', te: 'ఏపీ విజ్ఞాన, సాంకేతిక & ఆవిష్కరణ మండలి ఏర్పాటు' },
    department: 'Science, Technology & Innovation', file: '/pdfs/go/GO-15-2026.pdf', size: '280 KB',
  },
  {
    id: 'go-09', type: 'go', number: 'G.O.Ms.No.09', date: '2026-01-22',
    title: { en: 'Incentives for semiconductor and display manufacturing units', te: 'సెమీకండక్టర్ మరియు డిస్ప్లే తయారీ యూనిట్లకు ప్రోత్సాహకాలు' },
    department: 'Science, Technology & Innovation', file: '/pdfs/go/GO-09-2026.pdf', size: '760 KB',
  },

  // ---- Notifications ----
  {
    id: 'notif-64', type: 'notification', number: 'Notification No.64', date: '2026-09-30',
    title: { en: 'Empanelment of CERT-In audited vendors for security audits', te: 'భద్రతా ఆడిట్‌ల కోసం CERT-In ఆడిట్ చేసిన విక్రేతల ఎంపిక' },
    department: 'Science, Technology & Innovation', file: '/pdfs/notifications/N-64-2026.pdf', size: '190 KB',
  },
  {
    id: 'notif-61', type: 'notification', number: 'Notification No.61', date: '2026-09-04',
    title: { en: 'Applications invited for the AP Science Talent Search 2026', te: 'ఏపీ విజ్ఞాన ప్రతిభా అన్వేషణ 2026 కోసం దరఖాస్తులు ఆహ్వానం' },
    department: 'APCOST', file: '/pdfs/notifications/N-61-2026.pdf', size: '150 KB',
  },
  {
    id: 'notif-55', type: 'notification', number: 'Notification No.55', date: '2026-07-19',
    title: { en: 'Start-up grant applications under the Technology & Innovation Policy', te: 'సాంకేతిక & ఆవిష్కరణ విధానం కింద స్టార్టప్ గ్రాంట్ దరఖాస్తులు' },
    department: 'APIS', file: '/pdfs/notifications/N-55-2026.pdf', size: '240 KB',
  },

  // ---- Circulars ----
  {
    id: 'circ-31', type: 'circular', number: 'Circular No.31', date: '2026-09-20',
    title: { en: 'Adoption of the GIGW 3.0 guidelines for all departmental websites', te: 'అన్ని శాఖా వెబ్‌సైట్లకు GIGW 3.0 మార్గదర్శకాల స్వీకరణ' },
    department: 'APTS', file: '/pdfs/circulars/C-31-2026.pdf', size: '320 KB',
  },
  {
    id: 'circ-28', type: 'circular', number: 'Circular No.28', date: '2026-08-11',
    title: { en: 'Half-yearly security audit compliance for e-Governance applications', te: 'ఇ-గవర్నెన్స్ అప్లికేషన్లకు అర్ధ-వార్షిక భద్రతా ఆడిట్ నిబంధన' },
    department: 'APTS', file: '/pdfs/circulars/C-28-2026.pdf', size: '280 KB',
  },

  // ---- Acts ----
  {
    id: 'act-it', type: 'act', number: 'Act No.21 of 2000', date: '2000-06-09',
    title: { en: 'The Information Technology Act, 2000', te: 'సమాచార సాంకేతిక చట్టం, 2000' },
    department: 'Ministry of Electronics & IT, GoI', file: '/pdfs/acts/IT-Act-2000.pdf', size: '1.6 MB',
  },
  {
    id: 'act-rti', type: 'act', number: 'Act No.22 of 2005', date: '2005-06-15',
    title: { en: 'The Right to Information Act, 2005', te: 'సమాచార హక్కు చట్టం, 2005' },
    department: 'Government of India', file: '/pdfs/acts/RTI-Act-2005.pdf', size: '980 KB',
  },
  {
    id: 'act-posh', type: 'act', number: 'Act No.14 of 2013', date: '2013-04-22',
    title: { en: 'The Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013', te: 'కార్యాలయంలో మహిళల లైంగిక వేధింపుల నిరోధ చట్టం, 2013' },
    department: 'Government of India', file: '/pdfs/acts/PoSH-Act-2013.pdf', size: '1.2 MB',
  },

  // ---- Rules ----
  {
    id: 'rule-it', type: 'rule', number: 'G.S.R. 313(E)', date: '2011-04-11',
    title: { en: 'Information Technology (Intermediary Guidelines) Rules, 2011', te: 'సమాచార సాంకేతిక (మధ్యవర్తి మార్గదర్శకాలు) నియమాలు, 2011' },
    department: 'Ministry of Electronics & IT, GoI', file: '/pdfs/rules/IT-Rules-2011.pdf', size: '540 KB',
  },
  {
    id: 'rule-rti', type: 'rule', number: 'Notification', date: '2006-10-12',
    title: { en: 'AP Right to Information Rules, 2006', te: 'ఏపీ సమాచార హక్కు నియమాలు, 2006' },
    department: 'Government of Andhra Pradesh', file: '/pdfs/rules/AP-RTI-Rules-2006.pdf', size: '460 KB',
  },

  // ---- Guidelines ----
  {
    id: 'guide-gigw', type: 'guideline', number: 'GIGW 3.0', date: '2024-02-01',
    title: { en: 'Guidelines for Indian Government Websites (GIGW) 3.0', te: 'భారత ప్రభుత్వ వెబ్‌సైట్ల మార్గదర్శకాలు (GIGW) 3.0' },
    department: 'NIC / MeitY', file: '/pdfs/guidelines/GIGW-3.0.pdf', size: '2.1 MB',
  },
  {
    id: 'guide-wcag', type: 'guideline', number: 'WCAG 2.1 AA', date: '2018-06-05',
    title: { en: 'Web Content Accessibility Guidelines (WCAG) 2.1 — Level AA', te: 'వెబ్ విషయ ప్రాప్యత మార్గదర్శకాలు (WCAG) 2.1 — స్థాయి AA' },
    department: 'W3C', file: '/pdfs/guidelines/WCAG-2.1.pdf', size: '1.4 MB',
  },

  // ---- IT Act 2000 — procedure & judgements ----
  {
    id: 'it-proc', type: 'guideline', number: 'Procedure', date: '2000-10-17',
    title: { en: 'IT Act 2000 — Rules of procedure and adjudication', te: 'IT చట్టం 2000 — ప్రక్రియ మరియు న్యాయనిర్ణయ నియమాలు' },
    department: 'Department of Science, Technology & Innovation', file: '/pdfs/it-act/IT-Act-Procedure.pdf', size: '620 KB',
  },
  {
    id: 'it-judg', type: 'guideline', number: 'Judgements', date: '2021-05-30',
    title: { en: 'IT Act 2000 — Landmark judgements compilation', te: 'IT చట్టం 2000 — ప్రముఖ తీర్పుల సంకలనం' },
    department: 'Department of Science, Technology & Innovation', file: '/pdfs/it-act/IT-Act-Judgements.pdf', size: '880 KB',
  },

  // ---- PoSH ----
  {
    id: 'posh-guide', type: 'guideline', number: 'PoSH', date: '2013-12-09',
    title: { en: 'PoSH Act — Internal Committee constitution and process', te: 'PoSH చట్టం — అంతర్గత కమిటీ ఏర్పాటు మరియు ప్రక్రియ' },
    department: 'Department of Science, Technology & Innovation', file: '/pdfs/posh/PoSH-Process.pdf', size: '400 KB',
  },
];

export const documentTypes = [
  { id: 'go', key: 'governmentOrders' },
  { id: 'notification', key: 'notificationsCirculars' },
  { id: 'circular', key: 'notificationsCirculars' },
  { id: 'act', key: 'acts' },
  { id: 'rule', key: 'rules' },
  { id: 'guideline', key: 'guidelines' },
];

export const documentsByType = (type) => documents.filter((d) => d.type === type);
