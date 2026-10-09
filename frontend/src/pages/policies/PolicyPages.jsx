// src/pages/policies/PolicyPages.jsx
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowUpRight, BadgeCheck, Building2, Download, FileText, Target } from 'lucide-react';
import useSEO from '../../utils/useSEO';
import { useLanguage } from '../../i18n/LanguageContext';
import PageHero from '../../components/common/PageHero';
import Prose from '../../components/common/Prose';
import { policies } from '../../data/policies';
import { getOrganisation } from '../../data/organisations';
import { getStatutoryPage } from '../../data/statutory';
import NotFoundPage from '../NotFoundPage';

export function PoliciesPage() {
  const { t, tc } = useLanguage();
  useSEO({ title: t('policies'), path: '/policies' });
  const [sector, setSector] = useState('all');
  const sectors = [...new Set(policies.map((p) => p.sector))];
  const list = sector === 'all' ? policies : policies.filter((p) => p.sector === sector);

  return (
    <>
      <PageHero
        title={t('policies')}
        subtitle="Sector policies shaping technology, investment and innovation in Andhra Pradesh."
        breadcrumbs={[{ label: t('policies') }]}
      />
      <div className="dst-container py-10">
        <div className="mb-6 flex flex-wrap gap-2">
          <button type="button" onClick={() => setSector('all')} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${sector === 'all' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'}`}>
            {t('all')}
          </button>
          {sectors.map((s) => (
            <button key={s} type="button" onClick={() => setSector(s)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${sector === s ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <Link key={p.id} to={`/policies/${p.id}`} className="dst-card dst-card-hover flex flex-col p-5">
              <div className="flex items-center justify-between">
                <span className="rounded bg-primary-50 px-2.5 py-1 text-xs font-bold uppercase text-primary-700 dark:bg-neutral-800 dark:text-primary-300">{p.sector}</span>
                <ArrowUpRight size={18} className="text-neutral-500 dark:text-neutral-300" aria-hidden="true" />
              </div>
              <h2 className="mt-3 flex-1 font-bold text-neutral-900 dark:text-neutral-100">{tc(p.name)}</h2>
              <p className="mt-1.5 line-clamp-3 text-sm text-neutral-500 dark:text-neutral-300">{tc(p.summary)}</p>
              <div className="mt-3 flex items-center gap-3 border-t border-neutral-100 pt-3 text-xs text-neutral-500 dark:text-neutral-300 dark:border-neutral-800">
                <span className="flex items-center gap-1"><BadgeCheck size={12} className="text-primary-600" aria-hidden="true" /> {p.status}</span>
                <span>{p.year}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

/** Handles both /policies/:id (sector policies) and /policies/:slug (statutory pages). */
export function PolicyDetailPage() {
  const { id } = useParams();
  const policy = policies.find((p) => p.id === id);
  const statutory = getStatutoryPage(id);
  const { t, tc } = useLanguage();
  useSEO({
    title: policy ? tc(policy.name) : statutory ? tc(statutory.title) : t('policies'),
    path: `/policies/${id}`,
  });

  if (!policy && !statutory) return <NotFoundPage />;

  // ---- Statutory / website policy page ----
  if (statutory) {
    return (
      <>
        <PageHero title={tc(statutory.title)} breadcrumbs={[{ label: t('statutoryPages') }, { label: tc(statutory.title) }]} />
        <div className="dst-container grid gap-8 py-10 lg:grid-cols-[1fr_240px]">
          <article className="max-w-3xl">
            {statutory.sections.map((s, i) => (
              <section key={i} className="mb-8">
                <h2 className="mb-3 text-lg font-bold text-neutral-900 dark:text-white">{tc(s.heading)}</h2>
                <Prose content={s.body} />
              </section>
            ))}
          </article>
          <aside className="dst-card h-fit p-5 lg:sticky lg:top-24">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300">{t('onThisPage')}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {statutory.sections.map((s, i) => (
                <li key={i} className="text-neutral-600 dark:text-neutral-200">• {tc(s.heading)}</li>
              ))}
            </ul>
          </aside>
        </div>
      </>
    );
  }

  // ---- Sector policy page ----
  const related = (policy.relatedOrgs || []).map(getOrganisation).filter(Boolean);
  return (
    <>
      <PageHero
        title={tc(policy.name)}
        subtitle={tc(policy.summary)}
        breadcrumbs={[{ label: t('policies'), to: '/policies' }, { label: policy.sector }]}
      >
        <a href={`/pdfs/policies/${policy.id}.pdf`} download className="btn-secondary">
          <Download size={16} aria-hidden="true" /> {t('downloadPdf')}
        </a>
      </PageHero>

      <div className="dst-container grid gap-10 py-10 lg:grid-cols-[2fr_1fr]">
        <article>
          <section>
            <h2 className="dst-section-title flex items-center gap-2">
              <Target size={20} className="text-primary-600" aria-hidden="true" /> {t('objectives')}
            </h2>
            <ul className="mt-3 space-y-2">
              {policy.objectives.map((o, i) => (
                <li key={i} className="flex items-start gap-2 text-neutral-600 dark:text-neutral-200">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-secondary-500" /> {tc(o)}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="dst-section-title">{t('incentives')}</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {policy.incentives.map((inc, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-700">
                  <BadgeCheck size={17} className="mt-0.5 flex-shrink-0 text-primary-600" aria-hidden="true" />
                  <span className="text-neutral-600 dark:text-neutral-200">{tc(inc)}</span>
                </div>
              ))}
            </div>
          </section>
        </article>

        <aside className="dst-card h-fit p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300">{t('informationFor')}</h2>
          <dl className="mt-3 space-y-3 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-neutral-500 dark:text-neutral-300">Sector</dt><dd className="font-semibold text-neutral-900 dark:text-neutral-100">{policy.sector}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-neutral-500 dark:text-neutral-300">Year</dt><dd className="font-semibold text-neutral-900 dark:text-neutral-100">{policy.year}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-neutral-500 dark:text-neutral-300">Status</dt><dd className="font-semibold text-primary-700 dark:text-primary-300">{policy.status}</dd></div>
          </dl>

          {related.length > 0 && (
            <>
              <h3 className="mt-5 flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                <Building2 size={15} className="text-primary-600" aria-hidden="true" /> {t('organisations')}
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm">
                {related.map((o) => (
                  <li key={o.id}>
                    <Link to={`/organisations/${o.id}`} className="dst-link">{tc(o.name)}</Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          <Link to="/policies" className="btn-outline mt-5 w-full">
            <FileText size={15} aria-hidden="true" /> {t('backTo')} {t('policies')}
          </Link>
        </aside>
      </div>
    </>
  );
}
