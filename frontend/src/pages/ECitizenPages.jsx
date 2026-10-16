import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { ArrowRight, BookOpen, ExternalLink, FileText, Gavel, HelpCircle, Link2, Mail, Phone, ScrollText, ShieldAlert, Users } from 'lucide-react';
import { useCollection, useSetting } from '../context/ContentContext';
import { useLanguage } from '../i18n/LanguageContext';
import useSEO from '../hooks/useSEO';
import PageHero from '../components/common/PageHero';
import PageSections from '../components/common/PageSections';
import DocumentTable from '../components/common/DocumentTable';
import Reveal from '../components/common/Reveal';
import { safeHref } from '../utils/format';
import NotFound from './NotFound';

const EC = (t) => ({ label: t('ecitizen'), to: '/ecitizen' });
const ITEMS = [
  [FileText, 'rti', '/ecitizen/rti'], [Gavel, 'actsRules', '/ecitizen/acts'], [ScrollText, 'governmentOrders', '/ecitizen/government-orders'],
  [BookOpen, 'notificationsCirculars', '/ecitizen/notifications'], [FileText, 'policiesEc', '/ecitizen/policies'], [FileText, 'guidelines', '/ecitizen/guidelines'],
  [HelpCircle, 'faqs', '/ecitizen/faqs'], [Link2, 'usefulLinks', '/ecitizen/useful-links'], [ShieldAlert, 'itAct2000', '/ecitizen/it-act-2000'], [Users, 'poshAct', '/ecitizen/posh-act'],
];

function usePage(id) {
  return useCollection('pages').find((p) => p.id === id);
}

function Hub() {
  const { t, tc } = useLanguage();
  const page = usePage('ecitizen');
  useSEO({ title: t('ecitizen') });
  return (
    <>
      <PageHero title={tc(page?.title) || t('ecitizen')} subtitle={tc(page?.subtitle)} crumbs={[{ label: t('ecitizen') }]} />
      <div className="container section-sm">
        <div className="row g-3">
          {ITEMS.map(([Icon, k, to], i) => (
            <Reveal key={k} className="col-sm-6 col-lg-4" delay={(i % 3) * 0.06}>
              <Link to={to} className="dst-card hoverable d-flex align-items-center gap-3 p-3">
                <span className="icon-chip"><Icon size={22} aria-hidden="true" /></span>
                <span className="fw-semibold flex-grow-1">{t(k)}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}

function OfficerCard({ title, officer }) {
  const { t } = useLanguage();
  const contact = useSetting('contact');
  return (
    <aside className="dst-card">
      <h2 className="h6 fw-bold text-uppercase text-muted-2">{title}</h2>
      {officer ? (
        <>
          <p className="fw-semibold mb-0">{officer.name}</p>
          <p className="small text-muted-2 mb-2">{officer.designation}</p>
          {officer.phone && <p className="small mb-1 d-flex gap-2"><Phone size={14} aria-hidden="true" /> {officer.phone}</p>}
          {officer.email && <p className="small mb-0 d-flex gap-2"><Mail size={14} aria-hidden="true" /> <a href={`mailto:${officer.email}`}>{officer.email}</a></p>}
        </>
      ) : <p className="small mb-0">{t('contact')}: <a href={`mailto:${contact.email}`}>{contact.email}</a></p>}
    </aside>
  );
}

function TopicPage({ pageId, titleKey, topic, officerTag, officerTitleKey }) {
  const { t, tc } = useLanguage();
  const page = usePage(pageId);
  const docs = useCollection('documents').filter((d) => d.topic === topic);
  const officer = useCollection('officers').find((o) => o.roleTag === officerTag);
  useSEO({ title: t(titleKey) });
  return (
    <>
      <PageHero title={tc(page?.title) || t(titleKey)} subtitle={tc(page?.subtitle)} crumbs={[EC(t), { label: t(titleKey) }]} />
      <div className="container section-sm">
        <div className="row g-5">
          <div className="col-lg-8">
            <PageSections page={page} />
            {docs.length > 0 && <><h2 className="h4 fw-bold mt-4 mb-3">{t('documents')}</h2><DocumentTable documents={docs} caption={t(titleKey)} /></>}
          </div>
          <div className="col-lg-4">{officerTag && <OfficerCard title={t(officerTitleKey)} officer={officer} />}</div>
        </div>
      </div>
    </>
  );
}

function DocsPage({ titleKey, types, filter }) {
  const { t } = useLanguage();
  const docs = useCollection('documents').filter((d) => types.includes(d.type));
  useSEO({ title: t(titleKey) });
  return (
    <>
      <PageHero title={t(titleKey)} crumbs={[EC(t), { label: t(titleKey) }]} />
      <div className="container section-sm"><DocumentTable documents={docs} showTypeFilter={filter} caption={t(titleKey)} /></div>
    </>
  );
}

function PoliciesEc() {
  const { t, tc } = useLanguage();
  const policies = useCollection('policies');
  useSEO({ title: t('policiesEc') });
  return (
    <>
      <PageHero title={t('policiesEc')} crumbs={[EC(t), { label: t('policiesEc') }]} />
      <div className="container section-sm">
        <div className="table-wrap">
          <table className="table dst-table table-hover">
            <caption className="visually-hidden">{t('policiesEc')}</caption>
            <thead><tr><th scope="col">{t('title')}</th><th scope="col">{t('sector')}</th><th scope="col">{t('year')}</th><th scope="col" className="text-end">{t('details')}</th></tr></thead>
            <tbody>{policies.map((p) => (
              <tr key={p.id}><td className="fw-semibold">{tc(p.name)}</td><td>{p.sector}</td><td>{p.year}</td><td className="text-end"><Link to={`/policies/${p.id}`} className="btn btn-sm btn-outline-primary">{t('view')}</Link></td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function FAQs() {
  const { t, tc } = useLanguage();
  const faqs = useCollection('faqs');
  useSEO({ title: t('faqs') });
  return (
    <>
      <PageHero title={t('faqs')} crumbs={[EC(t), { label: t('faqs') }]} />
      <div className="container section-sm" style={{ maxWidth: 900 }}>
        {faqs.map((f) => <details key={f.id} className="faq"><summary>{tc(f.q)}</summary><div className="body">{tc(f.a)}</div></details>)}
      </div>
    </>
  );
}

function UsefulLinks() {
  const { t, tc } = useLanguage();
  const links = useCollection('usefulLinks');
  useSEO({ title: t('usefulLinks') });
  return (
    <>
      <PageHero title={t('usefulLinks')} subtitle={t('externalLinksNote')} crumbs={[EC(t), { label: t('usefulLinks') }]} />
      <div className="container section-sm">
        <div className="row g-3">
          {links.map((l) => (
            <div className="col-md-6" key={l.id}>
              <a href={safeHref(l.url)} target="_blank" rel="noopener noreferrer" className="dst-card hoverable d-flex align-items-center gap-3 p-3">
                <ExternalLink size={18} className="text-primary flex-shrink-0" aria-hidden="true" />
                <span><span className="fw-semibold d-block">{tc(l.name)}</span><small className="text-muted-2">{l.url.replace(/^https?:\/\//, '')}</small></span>
                <span className="visually-hidden">({t('opensNewWindow')})</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function ECitizenPages() {
  return (
    <Routes>
      <Route index element={<Hub />} />
      <Route path="rti" element={<TopicPage pageId="rti" titleKey="rti" topic="rti" officerTag="pio" officerTitleKey="publicInformationOfficers" />} />
      <Route path="acts" element={<DocsPage titleKey="actsRules" types={['act', 'rule']} filter />} />
      <Route path="government-orders" element={<DocsPage titleKey="governmentOrders" types={['go']} />} />
      <Route path="notifications" element={<DocsPage titleKey="notificationsCirculars" types={['notification', 'circular']} filter />} />
      <Route path="guidelines" element={<DocsPage titleKey="guidelines" types={['guideline']} />} />
      <Route path="policies" element={<PoliciesEc />} />
      <Route path="faqs" element={<FAQs />} />
      <Route path="useful-links" element={<UsefulLinks />} />
      <Route path="it-act-2000" element={<TopicPage pageId="it-act-2000" titleKey="itAct2000" topic="it-act" />} />
      <Route path="posh-act" element={<TopicPage pageId="posh-act" titleKey="poshAct" topic="posh" officerTag="posh" officerTitleKey="nodalOfficer" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
