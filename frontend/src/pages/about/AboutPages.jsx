// src/pages/about/AboutPages.jsx
import React, { useState } from 'react';
import { Award, Building2, Compass, Target } from 'lucide-react';
import useSEO from '../../utils/useSEO';
import { useLanguage } from '../../i18n/LanguageContext';
import PageHero from '../../components/common/PageHero';
import Prose from '../../components/common/Prose';
import { aboutIntro, awardYears, mission, objectives, orgStructure } from '../../data/about';
import { organisations } from '../../data/organisations';

export function AboutPage() {
  const { t, tc } = useLanguage();
  useSEO({ title: t('about'), description: 'Introduction to the Department of Science, Technology & Innovation.', path: '/about' });
  return (
    <>
      <PageHero title={t('about')} subtitle={tc(mission)} breadcrumbs={[{ label: t('about') }]} />
      <div className="dst-container grid gap-10 py-10 lg:grid-cols-[2fr_1fr]">
        <article>
          <p className="dst-eyebrow">{t('intro')}</p>
          <Prose content={aboutIntro} />
        </article>
        <aside className="dst-card h-fit p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-white">
            <Building2 size={18} className="text-primary-600" aria-hidden="true" /> {t('organisationStructure')}
          </h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{tc(orgStructure)}</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {organisations.map((o) => (
              <li key={o.id} className="flex items-center gap-2 text-neutral-600 dark:text-neutral-200">
                <span className="text-secondary-500">›</span> {tc(o.name)}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}

export function MissionPage() {
  const { t, tc } = useLanguage();
  useSEO({ title: t('mission'), path: '/about/mission' });
  return (
    <>
      <PageHero title={t('mission')} breadcrumbs={[{ label: t('about'), to: '/about' }, { label: t('mission') }]} />
      <div className="dst-container py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border-l-4 border-secondary-500 bg-neutral-50 p-6 text-lg leading-relaxed text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
          <Compass size={28} className="mb-3 text-primary-600" aria-hidden="true" />
          {tc(mission)}
        </div>
      </div>
    </>
  );
}

export function ObjectivesPage() {
  const { t, tc } = useLanguage();
  useSEO({ title: t('objectives'), path: '/about/objectives' });
  return (
    <>
      <PageHero title={t('objectives')} breadcrumbs={[{ label: t('about'), to: '/about' }, { label: t('objectives') }]} />
      <div className="dst-container py-10">
        <ol className="grid gap-4 md:grid-cols-2">
          {objectives.map((o, i) => (
            <li key={i} className="dst-card flex gap-4 p-5">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-800 to-primary-700 text-sm font-extrabold text-white">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="flex items-start gap-2 text-neutral-600 dark:text-neutral-200">
                <Target size={16} className="mt-0.5 flex-shrink-0 text-secondary-500" aria-hidden="true" />
                {tc(o)}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}

export function OrganisationStructurePage() {
  const { t, tc } = useLanguage();
  useSEO({ title: t('organisationStructure'), path: '/about/organisation' });
  return (
    <>
      <PageHero
        title={t('organisationStructure')}
        breadcrumbs={[{ label: t('about'), to: '/about' }, { label: t('organisationStructure') }]}
      />
      <div className="dst-container py-10">
        <Prose content={orgStructure} />
        {/* Simple organisation chart */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
          <div className="mx-auto flex min-w-[640px] flex-col items-center">
            <div className="rounded-lg bg-neutral-900 px-6 py-3 text-center text-sm font-bold text-white">
              Special Chief Secretary<br />
              <span className="text-xs font-normal text-neutral-200">{t('department')}: DSTI</span>
            </div>
            <div className="h-6 w-px bg-neutral-300" />
            <div className="grid grid-cols-4 gap-4">
              {organisations.map((o) => (
                <div key={o.id} className="rounded-lg border border-primary-200 bg-primary-50 px-3 py-3 text-center text-xs font-semibold text-neutral-800 dark:border-primary-800 dark:bg-neutral-800 dark:text-neutral-100">
                  <span className="block text-sm font-extrabold text-primary-700 dark:text-primary-300">{o.abbr}</span>
                  {tc(o.name)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function AwardsPage() {
  const { t, tc } = useLanguage();
  useSEO({ title: t('awards'), path: '/about/awards' });
  const [year, setYear] = useState(awardYears[0].year);
  const active = awardYears.find((y) => y.year === year);
  return (
    <>
      <PageHero title={t('awards')} subtitle="Year-wise recognition of excellence in science & technology" breadcrumbs={[{ label: t('about'), to: '/about' }, { label: t('awards') }]} />
      <div className="dst-container py-10">
        <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Award years">
          {awardYears.map((y) => (
            <button
              key={y.year}
              type="button"
              role="tab"
              aria-selected={y.year === year}
              onClick={() => setYear(y.year)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${y.year === year ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200'}`}
            >
              {y.year}
            </button>
          ))}
        </div>
        <h2 className="mb-4 text-xl font-bold text-neutral-900 dark:text-white">{tc(active.title)}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {active.awards.map((a, i) => (
            <div key={i} className="dst-card p-5">
              <Award size={26} className="text-secondary-500" aria-hidden="true" />
              <h3 className="mt-3 font-bold text-neutral-900 dark:text-neutral-100">{tc(a.name)}</h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-200">{a.recipient}</p>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">{a.field}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
