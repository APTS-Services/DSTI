// src/pages/TendersPage.jsx
import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarClock, Download, FileText, Search } from 'lucide-react';
import useSEO from '../utils/useSEO';
import { useLanguage } from '../i18n/LanguageContext';
import PageHero from '../components/common/PageHero';
import { useCollection } from '../data/store';

export default function TendersPage() {
  const { t, tc } = useLanguage();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || 'all';
  const [query, setQuery] = useState('');
  const tenders = useCollection('tenders');

  useSEO({
    title: status === 'open' ? t('openTenders') : status === 'closed' ? t('closedTenders') : t('tenderNotices'),
    path: '/tenders',
  });

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tenders
      .filter((x) => (status === 'all' ? true : x.status === status))
      .filter((x) => (!q ? true : `${x.tenderNo} ${tc(x.title)} ${x.department}`.toLowerCase().includes(q)))
      .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
  }, [tenders, status, query, tc]);

  const setStatus = (s) => {
    if (s === 'all') setParams({});
    else setParams({ status: s });
  };

  const counts = {
    all: tenders.length,
    open: tenders.filter((x) => x.status === 'open').length,
    closed: tenders.filter((x) => x.status === 'closed').length,
  };

  return (
    <>
      <PageHero
        title={t('tenderNotices')}
        subtitle="Tender notices with document download and open / closed status."
        breadcrumbs={[{ label: t('tenders') }]}
      />

      <div className="dst-container py-8">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg border border-neutral-200 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-800" role="tablist" aria-label={t('tenderStatus')}>
            {[
              { id: 'all', label: t('all') },
              { id: 'open', label: t('openTenders') },
              { id: 'closed', label: t('closedTenders') },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={status === s.id}
                onClick={() => setStatus(s.id)}
                className={`rounded-md px-4 py-2 text-sm font-semibold ${status === s.id ? 'bg-neutral-900 text-white' : 'text-neutral-700 dark:text-neutral-200'}`}
              >
                {s.label} <span className="opacity-70">({counts[s.id]})</span>
              </button>
            ))}
          </div>

          <label className="relative flex-1 sm:max-w-xs">
            <span className="sr-only">{t('search')}</span>
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('search')} className="input-style pl-9" />
          </label>
        </div>

        <div className="space-y-4">
          {rows.length === 0 && <p className="rounded-xl border border-neutral-200 p-8 text-center text-neutral-500 dark:text-neutral-300 dark:border-neutral-700">{t('noRecords')}</p>}
          {rows.map((tn) => (
            <article key={tn.id} className="dst-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs font-bold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                      {tn.tenderNo}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${tn.status === 'open' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-200' : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'}`}>
                      {tn.status === 'open' ? t('open') : t('closed')}
                    </span>
                  </div>
                  <h2 className="mt-2 font-bold text-neutral-900 dark:text-neutral-100">{tc(tn.title)}</h2>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-300">
                    {tn.department} · {t('amount')}: {tn.emd}
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2 text-xs dark:bg-neutral-800">
                  <CalendarClock size={14} className="text-primary-600" aria-hidden="true" />
                  <span className="text-neutral-500 dark:text-neutral-300">{t('closingDate')}:</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">{new Date(tn.closingDate).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                {tn.documents.map((doc) => (
                  <a key={doc.name} href={doc.file} download className="btn-outline text-xs">
                    <Download size={14} aria-hidden="true" /> {doc.name} ({doc.size})
                  </a>
                ))}
                <span className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-300">
                  <FileText size={13} aria-hidden="true" /> {t('publishedOn')} {new Date(tn.publishedDate).toLocaleDateString('en-IN')}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
