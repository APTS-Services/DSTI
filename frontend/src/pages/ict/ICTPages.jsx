// src/pages/ict/ICTPages.jsx
import React from 'react';
import { Cpu, Layers, ShieldCheck, TrendingUp } from 'lucide-react';
import useSEO from '../../utils/useSEO';
import { useLanguage } from '../../i18n/LanguageContext';
import PageHero from '../../components/common/PageHero';
import Prose from '../../components/common/Prose';
import { eGovernance, projects } from '../../data/ict';

export function ICTPage() {
  const { t, tc } = useLanguage();
  useSEO({ title: t('eGovernance'), path: '/ict' });
  return (
    <>
      <PageHero
        title={t('eGovernance')}
        subtitle="Digital services, paperless governance and secure technology platforms for the State."
        breadcrumbs={[{ label: t('ict') }]}
      />
      <div className="dst-container py-10">
        <div className="grid gap-5 md:grid-cols-2">
          {eGovernance.map((e) => (
            <div key={e.id} className="dst-card p-5">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-800 to-primary-700 text-white">
                  <Cpu size={22} aria-hidden="true" />
                </span>
                <span className="rounded-full bg-primary-50 px-3 py-0.5 text-xs font-bold text-primary-700 dark:bg-neutral-800 dark:text-primary-300">
                  {e.status}
                </span>
              </div>
              <h2 className="mt-3 font-bold text-neutral-900 dark:text-neutral-100">{tc(e.name)}</h2>
              <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-300">{tc(e.summary)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {e.tags.map((tag) => (
                  <span key={tag} className="rounded bg-neutral-100 px-2 py-0.5 text-[0.7rem] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex items-center gap-3 rounded-xl bg-neutral-50 p-5 dark:bg-neutral-900">
          <ShieldCheck size={28} className="flex-shrink-0 text-primary-600" aria-hidden="true" />
          <p className="text-sm text-neutral-600 dark:text-neutral-200">
            ICT services are delivered on Government-approved infrastructure with SSL, a strict Content Security Policy
            and protection aligned to the OWASP Top 10.
          </p>
        </div>
      </div>
    </>
  );
}

export function ProjectsPage() {
  const { t, tc } = useLanguage();
  useSEO({ title: t('projects'), path: '/ict/projects' });
  return (
    <>
      <PageHero
        title={t('projects')}
        subtitle="Flagship projects and initiatives driving science, technology and innovation in Andhra Pradesh."
        breadcrumbs={[{ label: t('ict'), to: '/ict' }, { label: t('projects') }]}
      />
      <div className="dst-container py-10">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div key={p.id} className="dst-card flex flex-col p-5">
              <div className="flex items-center justify-between">
                <Layers size={20} className="text-primary-600" aria-hidden="true" />
                <span className="rounded-full bg-secondary-100 px-3 py-0.5 text-xs font-bold text-secondary-800 dark:bg-secondary-900/40 dark:text-secondary-200">
                  {p.status}
                </span>
              </div>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">{p.sector}</p>
              <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">{tc(p.name)}</h2>
              <p className="mt-1.5 flex-1 text-sm text-neutral-600 dark:text-neutral-300">{tc(p.summary)}</p>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-300">
                  <span className="flex items-center gap-1"><TrendingUp size={12} aria-hidden="true" /> Progress</span>
                  <span className="font-semibold">{p.progress}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary-600 to-secondary-500" style={{ width: `${p.progress}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
