// src/pages/organisations/OrganisationPages.jsx
import React, { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Building2, CheckCircle2, ExternalLink, MapPin, Network } from 'lucide-react';
import useSEO from '../../utils/useSEO';
import { useLanguage } from '../../i18n/LanguageContext';
import PageHero from '../../components/common/PageHero';
import Prose from '../../components/common/Prose';
import DistrictExplorer from '../../components/districts/DistrictExplorer';
import { getOrganisation, organisationCategories, organisations } from '../../data/organisations';
import { policies } from '../../data/policies';
import { districts, getRegion } from '../../data/districts';
import NotFoundPage from '../NotFoundPage';

export function OrganisationsPage() {
  const { t, tc } = useLanguage();
  useSEO({ title: t('organisations'), path: '/organisations' });
  const [cat, setCat] = useState('all');
  const list = cat === 'all' ? organisations : organisations.filter((o) => o.category === cat);

  return (
    <>
      <PageHero
        title={t('allOrganisations')}
        subtitle="The organisations and agencies working under the Department."
        breadcrumbs={[{ label: t('organisations') }]}
      />
      <div className="dst-container py-10">
        <div className="mb-6 flex flex-wrap gap-2">
          <button type="button" onClick={() => setCat('all')} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${cat === 'all' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'}`}>
            {t('all')}
          </button>
          {organisationCategories.map((c) => (
            <button key={c} type="button" onClick={() => setCat(c)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${cat === c ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((o) => {
            const d = districts.find((x) => x.id === o.district);
            return (
              <Link key={o.id} to={`/organisations/${o.id}`} className="dst-card dst-card-hover flex flex-col p-5">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-800 to-primary-700 text-xs font-extrabold text-white">
                    {o.abbr.slice(0, 4)}
                  </span>
                  <ArrowUpRight size={18} className="text-primary-600" aria-hidden="true" />
                </div>
                <h2 className="mt-3 font-bold text-neutral-900 dark:text-neutral-100">{tc(o.name)}</h2>
                <p className="mt-1.5 flex-1 text-sm text-neutral-500 dark:text-neutral-300">{tc(o.summary)}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-3 text-xs text-neutral-500 dark:text-neutral-300 dark:border-neutral-800">
                  <span className="rounded bg-neutral-100 px-2 py-0.5 font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">{o.category}</span>
                  {d && (
                    <span className="flex items-center gap-1"><MapPin size={11} aria-hidden="true" /> {tc(d.name)}</span>
                  )}
                  <span>Est. {o.established}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

export function OrganisationDetailPage() {
  const { id } = useParams();
  const { t, tc } = useLanguage();
  const org = getOrganisation(id);
  useSEO({ title: org ? tc(org.name) : t('organisations'), path: `/organisations/${id}` });
  if (!org) return <NotFoundPage />;

  const district = districts.find((d) => d.id === org.district);
  const relatedPolicies = policies.filter((p) => p.relatedOrgs?.includes(org.id));

  return (
    <>
      <PageHero
        title={tc(org.name)}
        subtitle={tc(org.summary)}
        breadcrumbs={[{ label: t('organisations'), to: '/organisations' }, { label: org.abbr }]}
      />
      <div className="dst-container grid gap-10 py-10 lg:grid-cols-[2fr_1fr]">
        <article>
          <h2 className="dst-section-title">{t('description')}</h2>
          <div className="mt-3 flex gap-3">
            <Building2 size={22} className="text-primary-600" aria-hidden="true" />
            <p className="text-neutral-600 dark:text-neutral-200">{tc(org.summary)}</p>
          </div>

          <h2 className="dst-section-title mt-8">{t('description')} — functions</h2>
          <ul className="mt-3 space-y-2">
            {org.functions.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-neutral-600 dark:text-neutral-200">
                <CheckCircle2 size={17} className="mt-0.5 flex-shrink-0 text-primary-600" aria-hidden="true" />
                {tc(f)}
              </li>
            ))}
          </ul>

          {relatedPolicies.length > 0 && (
            <>
              <h2 className="dst-section-title mt-8">{t('relatedLinks')}</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {relatedPolicies.map((p) => (
                  <li key={p.id}>
                    <Link to={`/policies/${p.id}`} className="block rounded-lg border border-neutral-200 p-3 text-sm font-semibold text-neutral-900 hover:border-primary-400 dark:border-neutral-700 dark:text-neutral-100">
                      {tc(p.name)}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </article>

        <aside className="dst-card h-fit p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300">Details</h2>
          <dl className="mt-3 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-neutral-500 dark:text-neutral-300">Abbreviation</dt>
              <dd className="font-semibold text-neutral-900 dark:text-neutral-100">{org.abbr}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-neutral-500 dark:text-neutral-300">Category</dt>
              <dd className="font-semibold text-neutral-900 dark:text-neutral-100">{org.category}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-neutral-500 dark:text-neutral-300">Established</dt>
              <dd className="font-semibold text-neutral-900 dark:text-neutral-100">{org.established}</dd>
            </div>
            {district && (
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500 dark:text-neutral-300">{t('district')}</dt>
                <dd className="font-semibold text-neutral-900 dark:text-neutral-100">{tc(district.name)}</dd>
              </div>
            )}
          </dl>
          {org.website && (
            <a href={org.website} target="_blank" rel="noopener noreferrer" className="btn-outline mt-4 w-full">
              <ExternalLink size={15} aria-hidden="true" /> Official website
            </a>
          )}
        </aside>
      </div>
    </>
  );
}

export function DistrictExplorerPage() {
  const { t } = useLanguage();
  const [params] = useSearchParams();
  useSEO({ title: t('districtExplorer'), path: '/districts' });
  return (
    <>
      <PageHero
        title={t('districtExplorer')}
        subtitle={t('districtExplorerDesc')}
        breadcrumbs={[{ label: t('organisations'), to: '/organisations' }, { label: t('districtExplorer') }]}
      />
      <div className="dst-container py-10">
        <DistrictExplorer initialDistrict={params.get('district')} />
      </div>
    </>
  );
}

export function HowItConnectsPage() {
  const { t, tc } = useLanguage();
  useSEO({ title: t('howItConnects'), path: '/how-it-connects' });
  const [activeOrg, setActiveOrg] = useState(organisations[0].id);
  const org = getOrganisation(activeOrg);
  const linked = policies.filter((p) => p.relatedOrgs?.includes(activeOrg));
  const allSectors = useMemo(() => [...new Set(policies.map((p) => p.sector))], []);

  return (
    <>
      <PageHero
        title={t('howItConnects')}
        subtitle={t('howItConnectsDesc')}
        breadcrumbs={[{ label: t('organisations'), to: '/organisations' }, { label: t('howItConnects') }]}
      />
      <div className="dst-container py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Organisations */}
          <div className="dst-card p-5">
            <h2 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
              <Building2 size={18} className="text-primary-600" aria-hidden="true" /> {t('organisations')}
            </h2>
            <ul className="mt-3 space-y-1.5">
              {organisations.map((o) => (
                <li key={o.id}>
                  <button type="button" onClick={() => setActiveOrg(o.id)} className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium ${activeOrg === o.id ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800'}`}>
                    {tc(o.name)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Connections */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border-l-4 border-secondary-500 bg-neutral-50 p-5 dark:bg-neutral-900">
              <h2 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
                <Network size={18} className="text-secondary-500" aria-hidden="true" /> {tc(org.name)}
              </h2>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{tc(org.summary)}</p>
            </div>

            <h3 className="mt-6 text-sm font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300">
              {t('policies')} ↔ {t('organisations')}
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {linked.length === 0 && <p className="text-sm text-neutral-500 dark:text-neutral-300">{t('noRecords')}</p>}
              {linked.map((p) => (
                <Link key={p.id} to={`/policies/${p.id}`} className="dst-card dst-card-hover p-4">
                  <span className="text-xs font-semibold uppercase text-secondary-600 dark:text-secondary-300">{p.sector}</span>
                  <p className="mt-1 font-semibold text-neutral-900 dark:text-neutral-100">{tc(p.name)}</p>
                </Link>
              ))}
            </div>

            <h3 className="mt-6 text-sm font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300">
              Sectors covered by the Department
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {allSectors.map((s) => (
                <span key={s} className={`rounded-full px-3 py-1 text-xs font-semibold ${linked.some((p) => p.sector === s) ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'}`}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
