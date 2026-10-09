// src/components/common/SearchOverlay.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Search, X } from 'lucide-react';
import { searchContent } from '../../utils/searchIndex';
import { useLanguage } from '../../i18n/LanguageContext';

const TYPE_LABEL = {
  page: 'Page',
  organisation: 'Organisation',
  policy: 'Policy',
  ict: 'ICT',
  tender: 'Tender',
  document: 'Document',
  event: 'Event',
  video: 'Science Story',
  faq: 'FAQ',
  award: 'Award',
  district: 'District',
  news: 'Update',
};

export default function SearchOverlay({ open, onClose }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const results = useMemo(() => (query.trim().length > 1 ? searchContent(query, { limit: 8 }) : []), [query]);

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-neutral-950/70 p-4 pt-20 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={t('search')}>
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-900">
        <form onSubmit={submit} className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
          <Search size={20} className="text-primary-600" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchPlaceholder')}
            className="w-full bg-transparent py-1 text-base text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100"
          />
          <button type="button" onClick={onClose} aria-label={t('closeMenu')} className="rounded p-1 text-neutral-500 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <X size={20} aria-hidden="true" />
          </button>
        </form>

        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim().length > 1 && results.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-300">{t('noResults')}</p>
          )}
          {results.length > 0 && (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {results.map((r) => (
                <li key={r.id}>
                  <Link
                    to={r.path}
                    onClick={onClose}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-primary-50 dark:hover:bg-neutral-800"
                  >
                    <FileText size={18} className="mt-0.5 flex-shrink-0 text-neutral-500 dark:text-neutral-300" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">{r.title}</span>
                        <span className="rounded bg-primary-100 px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                          {TYPE_LABEL[r.type] || r.type}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-sm text-neutral-500 dark:text-neutral-300">{r.snippet}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {query.trim().length > 1 && results.length > 0 && (
            <button
              type="button"
              onClick={submit}
              className="block w-full bg-neutral-50 px-4 py-3 text-center text-sm font-semibold text-primary-700 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-primary-300"
            >
              {t('searchAll')} →
            </button>
          )}
          {query.trim().length <= 1 && (
            <p className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-300">{t('searchPlaceholder')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
