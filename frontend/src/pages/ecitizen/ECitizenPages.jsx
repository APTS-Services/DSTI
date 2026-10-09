// src/pages/ecitizen/ECitizenPages.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, ExternalLink, FileText, Gavel, HelpCircle, Link2, ScrollText, ShieldAlert, Users,
} from 'lucide-react';
import useSEO from '../../utils/useSEO';
import { useLanguage } from '../../i18n/LanguageContext';
import PageHero from '../../components/common/PageHero';
import DocumentTable from '../../components/common/DocumentTable';
import SectionHeading from '../../components/common/SectionHeading';
import { documents, documentsByType } from '../../data/documents';
import { faqs } from '../../data/faqs';
import { policies } from '../../data/policies';
import { officers } from '../../data/officers';

const CRUMB_EC = { label: 'e-Citizen', to: '/ecitizen' };

export function ECitizenPage() {
  const { t } = useLanguage();
  useSEO({ title: t('ecitizen'), path: '/ecitizen' });
  const items = [
    { icon: FileText, key: 'rti', to: '/ecitizen/rti' },
    { icon: Gavel, key: 'actsRules', to: '/ecitizen/acts' },
    { icon: ScrollText, key: 'governmentOrders', to: '/ecitizen/government-orders' },
    { icon: BookOpen, key: 'notificationsCirculars', to: '/ecitizen/notifications' },
    { icon: FileText, key: 'policiesEc', to: '/ecitizen/policies' },
    { icon: FileText, key: 'guidelines', to: '/ecitizen/guidelines' },
    { icon: HelpCircle, key: 'faqs', to: '/ecitizen/faqs' },
    { icon: Link2, key: 'usefulLinks', to: '/ecitizen/useful-links' },
    { icon: ShieldAlert, key: 'itAct2000', to: '/ecitizen/it-act-2000' },
    { icon: Users, key: 'poshAct', to: '/ecitizen/posh-act' },
  ];
  return (
    <>
      <PageHero title={t('ecitizen')} subtitle="Information and services for citizens — RTI, acts, orders, policies, guidelines and more." breadcrumbs={[{ label: t('ecitizen') }]} />
      <div className="dst-container py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <Link key={it.key} to={it.to} className="dst-card dst-card-hover flex items-center gap-4 p-5">
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-800 to-primary-700 text-white">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{t(it.key)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

export function RTIPage() {
  const { t } = useLanguage();
  useSEO({ title: t('rti'), path: '/ecitizen/rti' });
  const rtiDocs = documentsByType('act').filter((d) => d.id === 'act-rti').concat(documentsByType('rule').filter((d) => d.id === 'rule-rti'));
  const pio = officers.find((o) => o.designation.includes('RTI'));
  return (
    <>
      <PageHero title={t('rti')} breadcrumbs={[CRUMB_EC, { label: t('rti') }]} />
      <div className="dst-container py-10">
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div>
            <p className="prose-dst text-neutral-600 dark:text-neutral-200">
              Under the Right to Information Act, 2005, any citizen may request information held by the Department.
              Requests should be addressed to the Public Information Officer (PIO). The PIO responds within the
              time prescribed by the Act.
            </p>
            <h2 className="dst-section-title mt-8">{t('actsRules')}</h2>
            <div className="mt-4"><DocumentTable documents={rtiDocs} /></div>
          </div>
          <aside className="dst-card h-fit p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300">{t('publicInformationOfficers') || 'Public Information Officers'}</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="font-semibold text-neutral-900 dark:text-neutral-100">{pio?.name}</dt>
                <dd className="text-neutral-500 dark:text-neutral-300">{pio?.designation}</dd>
                <dd className="text-neutral-500 dark:text-neutral-300">{pio?.phone} · {pio?.email}</dd>
              </div>
              <div className="border-t border-neutral-100 pt-3 dark:border-neutral-800">
                <dt className="font-semibold text-neutral-900 dark:text-neutral-100">{t('address')}</dt>
                <dd className="text-neutral-500 dark:text-neutral-300">DSTI, AP Secretariat, Velagapudi, Amaravati – 522238</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </>
  );
}

export function ActsRulesPage() {
  const { t } = useLanguage();
  useSEO({ title: t('actsRules'), path: '/ecitizen/acts' });
  return (
    <>
      <PageHero title={t('actsRules')} breadcrumbs={[CRUMB_EC, { label: t('actsRules') }]} />
      <div className="dst-container py-10">
        <SectionHeading title={t('acts')} />
        <DocumentTable documents={filterDocs(['act'])} />
        <div className="mt-10"><SectionHeading title={t('rules')} /></div>
        <DocumentTable documents={filterDocs(['rule'])} />
      </div>
    </>
  );
}

export function GovernmentOrdersPage() {
  const { t } = useLanguage();
  useSEO({ title: t('governmentOrders'), path: '/ecitizen/government-orders' });
  return (
    <>
      <PageHero title={t('governmentOrders')} breadcrumbs={[CRUMB_EC, { label: t('governmentOrders') }]} />
      <div className="dst-container py-10"><DocumentTable documents={filterDocs(['go'])} /></div>
    </>
  );
}

export function NotificationsPage() {
  const { t } = useLanguage();
  useSEO({ title: t('notificationsCirculars'), path: '/ecitizen/notifications' });
  return (
    <>
      <PageHero title={t('notificationsCirculars')} breadcrumbs={[CRUMB_EC, { label: t('notificationsCirculars') }]} />
      <div className="dst-container py-10"><DocumentTable documents={filterDocs(['notification', 'circular'])} showTypeFilter /></div>
    </>
  );
}

export function GuidelinesPage() {
  const { t } = useLanguage();
  useSEO({ title: t('guidelines'), path: '/ecitizen/guidelines' });
  return (
    <>
      <PageHero title={t('guidelines')} breadcrumbs={[CRUMB_EC, { label: t('guidelines') }]} />
      <div className="dst-container py-10"><DocumentTable documents={filterDocs(['guideline'])} /></div>
    </>
  );
}

export function PoliciesEcPage() {
  const { t, tc } = useLanguage();
  useSEO({ title: t('policiesEc'), path: '/ecitizen/policies' });
  return (
    <>
      <PageHero title={t('policiesEc')} breadcrumbs={[CRUMB_EC, { label: t('policiesEc') }]} />
      <div className="dst-container py-10">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {policies.map((p) => (
            <Link key={p.id} to={`/policies/${p.id}`} className="dst-card dst-card-hover p-5">
              <span className="text-xs font-bold uppercase text-primary-600 dark:text-primary-300">{p.sector}</span>
              <h2 className="mt-1 font-semibold text-neutral-900 dark:text-neutral-100">{tc(p.name)}</h2>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export function FAQsPage() {
  const { t, tc } = useLanguage();
  useSEO({ title: t('faqs'), path: '/ecitizen/faqs' });
  return (
    <>
      <PageHero title={t('faqs')} breadcrumbs={[CRUMB_EC, { label: t('faqs') }]} />
      <div className="dst-container max-w-3xl py-10">
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <details key={i} className="dst-card group p-0">
              <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4 font-semibold text-neutral-900 dark:text-neutral-100">
                {tc(f.q)}
                <span className="text-primary-600 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="border-t border-neutral-100 px-5 py-4 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-200">{tc(f.a)}</p>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}

export function UsefulLinksPage() {
  const { t } = useLanguage();
  useSEO({ title: t('usefulLinks'), path: '/ecitizen/useful-links' });
  const links = [
    { name: 'Government of Andhra Pradesh', url: 'https://www.ap.gov.in' },
    { name: 'Ministry of Electronics & Information Technology (MeitY)', url: 'https://www.meity.gov.in' },
    { name: 'Department of Science & Technology, Government of India', url: 'https://dst.gov.in' },
    { name: 'ISRO — Indian Space Research Organisation', url: 'https://www.isro.gov.in' },
    { name: 'National Informatics Centre (NIC)', url: 'https://www.nic.in' },
    { name: 'CERT-In', url: 'https://www.cert-in.org.in' },
    { name: 'W3C — Web Content Accessibility Guidelines', url: 'https://www.w3.org/WAI/standards-guidelines/wcag/' },
    { name: 'Guidelines for Indian Government Websites (GIGW)', url: 'https://guidelines.india.gov.in' },
  ];
  return (
    <>
      <PageHero title={t('usefulLinks')} breadcrumbs={[CRUMB_EC, { label: t('usefulLinks') }]} />
      <div className="dst-container max-w-3xl py-10">
        <ul className="grid gap-3 sm:grid-cols-2">
          {links.map((l) => (
            <li key={l.url}>
              <a href={l.url} target="_blank" rel="noopener noreferrer" className="dst-card dst-card-hover flex items-center gap-3 p-4">
                <ExternalLink size={17} className="flex-shrink-0 text-primary-600" aria-hidden="true" />
                <span className="font-medium text-neutral-900 dark:text-neutral-100">{l.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export function ITActPage() {
  const { t } = useLanguage();
  useSEO({ title: t('itAct2000'), path: '/ecitizen/it-act-2000' });
  const itDocs = documents.filter((d) => d.id.startsWith('it-') || d.id === 'act-it' || d.id === 'rule-it');
  return (
    <>
      <PageHero title={t('itAct2000')} subtitle="The Information Technology Act, 2000 — rules, procedure and judgements." breadcrumbs={[CRUMB_EC, { label: t('itAct2000') }]} />
      <div className="dst-container py-10">
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="dst-card p-5">
            <h2 className="font-bold text-neutral-900 dark:text-neutral-100">{t('procedure')}</h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">Rules of procedure and adjudication under the IT Act 2000.</p>
          </div>
          <div className="dst-card p-5">
            <h2 className="font-bold text-neutral-900 dark:text-neutral-100">{t('judgements')}</h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">Compilation of landmark judgements under the IT Act 2000.</p>
          </div>
        </div>
        <DocumentTable documents={itDocs} />
      </div>
    </>
  );
}

export function PoSHPage() {
  const { t } = useLanguage();
  useSEO({ title: t('poshAct'), path: '/ecitizen/posh-act' });
  const poshDocs = documents.filter((d) => d.id === 'act-posh' || d.id === 'posh-guide');
  const nodal = officers.find((o) => o.designation.includes('PoSH'));
  return (
    <>
      <PageHero title={t('poshAct')} subtitle="Prevention, prohibition and redressal of sexual harassment at the workplace." breadcrumbs={[CRUMB_EC, { label: t('poshAct') }]} />
      <div className="dst-container grid gap-8 py-10 lg:grid-cols-[2fr_1fr]">
        <div>
          <p className="prose-dst text-neutral-600 dark:text-neutral-200">
            The Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013, is
            implemented across the Department and its organisations. An Internal Committee (IC) handles complaints
            in a confidential and time-bound manner.
          </p>
          <div className="mt-6"><DocumentTable documents={poshDocs} /></div>
        </div>
        <aside className="dst-card h-fit p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300">Nodal Officer</h2>
          <p className="mt-2 font-semibold text-neutral-900 dark:text-neutral-100">{nodal?.name}</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-300">{nodal?.designation}</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-300">{nodal?.phone} · {nodal?.email}</p>
        </aside>
      </div>
    </>
  );
}

// Helper: gather documents by type list.
function filterDocs(types) {
  return documents.filter((d) => types.includes(d.type));
}
