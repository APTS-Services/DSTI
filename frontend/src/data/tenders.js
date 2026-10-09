// src/data/tenders.js — tender notices with open / closed status.

export const tenders = [
  {
    id: 'T-2026-018',
    tenderNo: 'DSTI/APTS/2026/018',
    title: {
      en: 'Supply, installation and commissioning of network equipment for the Space-Tech Incubation Park',
      te: 'స్పేస్-టెక్ ఇన్‌క్యుబేషన్ పార్క్ కోసం నెట్‌వర్క్ పరికరాల సరఫరా, అమరిక మరియు ప్రారంభం',
    },
    department: 'APTS',
    district: 'tirupati',
    publishedDate: '2026-09-28',
    closingDate: '2026-10-20',
    status: 'open',
    emd: '₹ 1,50,000',
    documents: [{ name: 'Tender Document', file: '/pdfs/tenders/T-2026-018.pdf', size: '1.2 MB' }],
  },
  {
    id: 'T-2026-017',
    tenderNo: 'DSTI/APIS/2026/017',
    title: {
      en: 'Selection of an agency for operating the rural innovation centres in Rayalaseema',
      te: 'రాయలసీమలో గ్రామీణ ఆవిష్కరణ కేంద్రాల నిర్వహణకు సంస్థ ఎంపిక',
    },
    department: 'APIS',
    district: 'kurnool',
    publishedDate: '2026-09-22',
    closingDate: '2026-10-12',
    status: 'open',
    emd: '₹ 75,000',
    documents: [{ name: 'RFP Document', file: '/pdfs/tenders/T-2026-017.pdf', size: '860 KB' }],
  },
  {
    id: 'T-2026-016',
    tenderNo: 'DSTI/APSRAC/2026/016',
    title: {
      en: 'Procurement of high-resolution satellite imagery and GIS software licences',
      te: 'అధిక-రిజల్యూషన్ ఉపగ్రహ చిత్రాలు మరియు GIS సాఫ్ట్‌వేర్ లైసెన్సుల కొనుగోలు',
    },
    department: 'APSRAC',
    district: 'guntur',
    publishedDate: '2026-09-10',
    closingDate: '2026-09-30',
    status: 'closed',
    emd: '₹ 1,00,000',
    documents: [{ name: 'Tender Document', file: '/pdfs/tenders/T-2026-016.pdf', size: '1.1 MB' }],
  },
  {
    id: 'T-2026-015',
    tenderNo: 'DSTI/APEDC/2026/015',
    title: {
      en: 'Development of common facility centre at the Electronics Manufacturing Cluster, Chittoor',
      te: 'చిత్తూరు ఎలక్ట్రానిక్స్ తయారీ క్లస్టర్‌లో సాధారణ సౌకర్య కేంద్రం అభివృద్ధి',
    },
    department: 'APEDC',
    district: 'chittoor',
    publishedDate: '2026-08-28',
    closingDate: '2026-09-18',
    status: 'closed',
    emd: '₹ 2,50,000',
    documents: [{ name: 'Tender Document', file: '/pdfs/tenders/T-2026-015.pdf', size: '2.4 MB' }],
  },
  {
    id: 'T-2026-014',
    tenderNo: 'DSTI/APCOST/2026/014',
    title: {
      en: 'Event management services for the State Science Fair 2026',
      te: 'రాష్ట్ర విజ్ఞాన ప్రదర్శన 2026 కోసం ఈవెంట్ నిర్వహణ సేవలు',
    },
    department: 'APCOST',
    district: 'ntr',
    publishedDate: '2026-08-05',
    closingDate: '2026-08-26',
    status: 'closed',
    emd: '₹ 40,000',
    documents: [{ name: 'Tender Document', file: '/pdfs/tenders/T-2026-014.pdf', size: '640 KB' }],
  },
  {
    id: 'T-2026-019',
    tenderNo: 'DSTI/DSTI/2026/019',
    title: {
      en: 'Empanelment of CERT-In audited vendors for annual security audits of departmental websites',
      te: 'శాఖా వెబ్‌సైట్ల వార్షిక భద్రతా ఆడిట్‌ల కోసం CERT-In ఆడిట్ చేసిన విక్రేతల ఎంపిక',
    },
    department: 'DSTI',
    district: 'ntr',
    publishedDate: '2026-10-01',
    closingDate: '2026-10-25',
    status: 'open',
    emd: '₹ 25,000',
    documents: [{ name: 'EOI Document', file: '/pdfs/tenders/T-2026-019.pdf', size: '520 KB' }],
  },
];

export function tenderStatusLabel(status) {
  return status === 'open' ? 'open' : 'closed';
}
