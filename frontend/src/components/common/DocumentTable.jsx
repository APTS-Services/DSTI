// src/components/common/DocumentTable.jsx
// Document repository table with search, type filter, date sorting and PDF download.
import React, { useMemo, useState } from 'react';
import { ArrowDownUp, Download, FileText, Search } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

const TYPE_LABELS = {
  go: 'Government Order',
  notification: 'Notification',
  circular: 'Circular',
  act: 'Act',
  rule: 'Rule',
  guideline: 'Guideline',
};

export default function DocumentTable({ documents, showTypeFilter = false }) {
  const { t, tc } = useLanguage();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [sortDesc, setSortDesc] = useState(true);

  const types = useMemo(() => [...new Set(documents.map((d) => d.type))], [documents]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return documents
      .filter((d) => (type === 'all' ? true : d.type === type))
      .filter((d) => {
        if (!q) return true;
        return `${d.number} ${tc(d.title)} ${d.department}`.toLowerCase().includes(q);
      })
      .sort((a, b) => (sortDesc ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)));
  }, [documents, query, type, sortDesc, tc]);

  return (
    <div>
      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="relative flex-1 sm:max-w-xs">
          <span className="sr-only">{t('search')}</span>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search')}
            className="input-style pl-9"
          />
        </label>

        {showTypeFilter && (
          <select value={type} onChange={(e) => setType(e.target.value)} className="input-style max-w-[12rem]" aria-label={t('filterBy')}>
            <option value="all">{t('all')}</option>
            {types.map((ty) => (
              <option key={ty} value={ty}>{TYPE_LABELS[ty] || ty}</option>
            ))}
          </select>
        )}

        <button type="button" onClick={() => setSortDesc((v) => !v)} className="btn-outline">
          <ArrowDownUp size={15} aria-hidden="true" />
          {sortDesc ? t('newestFirst') : t('oldestFirst')}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-700">
        <table className="dst-table">
          <caption className="sr-only">{t('documentRepository')}</caption>
          <thead>
            <tr>
              <th scope="col" className="w-16">{t('number')}</th>
              <th scope="col">{t('subject')}</th>
              <th scope="col" className="hidden sm:table-cell w-32">{t('department')}</th>
              <th scope="col" className="w-32">{t('date')}</th>
              <th scope="col" className="w-28">{t('download')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-neutral-500 dark:text-neutral-300">{t('noRecords')}</td>
              </tr>
            )}
            {rows.map((d) => (
              <tr key={d.id}>
                <td className="font-semibold text-neutral-700 dark:text-neutral-200">{d.number}</td>
                <td>
                  <span className="flex items-start gap-2">
                    <FileText size={15} className="mt-0.5 flex-shrink-0 text-primary-600" aria-hidden="true" />
                    <span>
                      <span className="block font-medium text-neutral-900 dark:text-neutral-100">{tc(d.title)}</span>
                      {showTypeFilter && (
                        <span className="mt-0.5 inline-block rounded bg-neutral-100 px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                          {TYPE_LABELS[d.type] || d.type}
                        </span>
                      )}
                    </span>
                  </span>
                </td>
                <td className="hidden sm:table-cell">{d.department}</td>
                <td className="whitespace-nowrap">{new Date(d.date).toLocaleDateString('en-IN')}</td>
                <td>
                  <a
                    href={d.file}
                    download
                    className="inline-flex items-center gap-1 text-primary-700 hover:underline dark:text-primary-300"
                    aria-label={`${t('downloadPdf')}: ${tc(d.title)}`}
                  >
                    <Download size={14} aria-hidden="true" /> PDF
                    <span className="hidden text-[0.7rem] text-neutral-500 dark:text-neutral-300 lg:inline">({d.size})</span>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-300">
        {rows.length} {rows.length === 1 ? 'record' : 'records'}
      </p>
    </div>
  );
}
