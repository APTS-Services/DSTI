// src/pages/SearchResultsPage.jsx — site-wide search across all pages, policies, orders and tenders.
import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FileText, Search } from 'lucide-react';
import useSEO from '../utils/useSEO';
import { useLanguage } from '../i18n/LanguageContext';
import PageHero from '../components/common/PageHero';
import { searchContent } from '../utils/searchIndex';

const TYPE_LABEL = {
  page: 'Page', organisation: 'Organisation', policy: 'Policy', ict: 'ICT',
  tender: 'Tender', document: 'Document', event: 'Event', video: 'Science Story',
  faq: 'FAQ', award: 'Award', district: 'District', news: 'Update',
};

export default function SearchResultsPage() {
  const { t } = useLanguage();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const submitted = params.get('q') || '';
  const [type, setType] = useState('all');

  useSEO({ title: t('search'), path: '/search' });

  const results = useMemo(() => (submitted ? searchContent(submitted, { limit: 60 }) : []), [submitted]);
  const filtered = type === 'all' ? results : results.filter((r) => r.type === type);
  const types = [...new Set(results.map((r) => r.type))];

  const onSubmit = (e) => {
    e.preventDefault();
    setParams(query.trim() ? { q: query.trim() } : {});
  };

  return (
    <>
      <PageHero title={t('search')} subtitle={t('searchAll')} breadcrumbs={[{ label: t('search') }]} />
      <div className="dst-container py-8">
        <form onSubmit={onSubmit} className="flex flex-wrap gap-3">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="input-style pl-9"
              aria-label={t('searchPlaceholder')}
            />
          </div>
          <button type="submit" className="btn-primary">{t('search')}</button>
        </form>

        {submitted && (
          <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-300">
            {filtered.length} {filtered.length === 1 ? 'result' : 'results'} for <strong className="text-neutral-900 dark:text-neutral-100">“{submitted}”</strong>
          </p>
        )}

        {types.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => setType('all')} className={`rounded-full px-3 py-1 text-xs font-semibold ${type === 'all' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'}`}>
              {t('all')}
            </button>
            {types.map((ty) => (
              <button key={ty} type="button" onClick={() => setType(ty)} className={`rounded-full px-3 py-1 text-xs font-semibold ${type === ty ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'}`}>
                {TYPE_LABEL[ty] || ty}
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 space-y-3">
          {submitted && filtered.length === 0 && (
            <p className="rounded-xl border border-neutral-200 p-8 text-center text-neutral-500 dark:text-neutral-300 dark:border-neutral-700">
              {t('noResults')}
            </p>
          )}
          {filtered.map((r) => (
            <Link key={r.id} to={r.path} className="dst-card dst-card-hover flex items-start gap-3 p-4">
              <FileText size={18} className="mt-0.5 flex-shrink-0 text-primary-600" aria-hidden="true" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">{r.title}</span>
                  <span className="rounded bg-primary-100 px-1.5 py-0.5 text-[0.65rem] font-bold uppercase text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                    {TYPE_LABEL[r.type] || r.type}
                  </span>
                </div>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-300">{r.snippet}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
