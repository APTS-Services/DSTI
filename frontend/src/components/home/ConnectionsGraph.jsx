// src/components/home/ConnectionsGraph.jsx
// Interactive view of how organisations, policies and sectors link together.
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Network } from 'lucide-react';
import { organisations } from '../../data/organisations';
import { policies } from '../../data/policies';
import { useLanguage } from '../../i18n/LanguageContext';
import SectionHeading from '../common/SectionHeading';

export default function ConnectionsGraph() {
  const { t, tc } = useLanguage();
  const [activeOrg, setActiveOrg] = useState(organisations[0].id);

  const linkedPolicies = useMemo(
    () => policies.filter((p) => p.relatedOrgs?.includes(activeOrg)),
    [activeOrg]
  );
  const sectors = useMemo(() => [...new Set(linkedPolicies.map((p) => p.sector))], [linkedPolicies]);
  const org = organisations.find((o) => o.id === activeOrg);

  return (
    <section className="bg-neutral-50 py-12 dark:bg-neutral-900">
      <div className="dst-container">
        <SectionHeading eyebrow={t('ourWork')} title={t('howItConnects')} action={t('readMore')} actionTo="/how-it-connects" />
        <p className="-mt-2 mb-6 max-w-3xl text-sm text-neutral-600 dark:text-neutral-300">{t('howItConnectsDesc')}</p>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          {/* Organisations column */}
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300">
              {t('organisations')}
            </p>
            <ul className="space-y-1.5">
              {organisations.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => setActiveOrg(o.id)}
                    aria-pressed={activeOrg === o.id}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      activeOrg === o.id
                        ? 'bg-gradient-to-r from-neutral-800 to-primary-700 text-white'
                        : 'text-neutral-800 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-900'
                    }`}
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-md text-[0.65rem] font-bold ${activeOrg === o.id ? 'bg-white/20' : 'bg-neutral-100 dark:bg-neutral-900'}`}>
                      {o.abbr.slice(0, 3)}
                    </span>
                    <span className="font-medium">{tc(o.name)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Connections column */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-800">
            <div className="flex items-center gap-2">
              <Network size={18} className="text-secondary-500" aria-hidden="true" />
              <h3 className="font-bold text-neutral-900 dark:text-white">{tc(org.name)}</h3>
            </div>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{tc(org.summary)}</p>

            <p className="mt-5 text-xs font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300">
              {t('policies')} ({linkedPolicies.length})
            </p>
            {linkedPolicies.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-300">{t('noRecords')}</p>
            ) : (
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {linkedPolicies.map((p) => (
                  <li key={p.id}>
                    <Link to={`/policies/${p.id}`} className="block rounded-lg border border-neutral-200 p-3 text-sm hover:border-primary-400 hover:bg-primary-50/50 dark:border-neutral-700 dark:hover:bg-neutral-900">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">{tc(p.name)}</span>
                      <span className="mt-1 block text-xs text-neutral-500 dark:text-neutral-300">{p.sector}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {sectors.length > 0 && (
              <>
                <p className="mt-5 text-xs font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300">
                  {t('description')} — sectors
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sectors.map((s) => (
                    <span key={s} className="rounded-full bg-secondary-100 px-3 py-1 text-xs font-semibold text-secondary-800 dark:bg-secondary-900/40 dark:text-secondary-200">
                      {s}
                    </span>
                  ))}
                </div>
              </>
            )}

            <Link to={`/organisations/${org.id}`} className="btn-primary mt-5">
              {t('view')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
