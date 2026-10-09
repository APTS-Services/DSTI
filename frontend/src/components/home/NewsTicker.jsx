// src/components/home/NewsTicker.jsx — latest updates / news ticker.
import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, ChevronRight } from 'lucide-react';
import { useCollection } from '../../data/store';
import { useLanguage } from '../../i18n/LanguageContext';

export default function NewsTicker() {
  const { t, tc } = useLanguage();
  const items = useCollection('news');
  if (!items?.length) return null;
  // Duplicate the list so the marquee loop is seamless.
  const loop = [...items, ...items];

  return (
    <div className="border-b border-neutral-200 bg-secondary-50 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="dst-container flex items-center gap-3 py-2">
        <span className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-secondary-500 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-neutral-950">
          <Bell size={13} aria-hidden="true" /> {t('latestUpdates')}
        </span>
        <div className="group relative flex-1 overflow-hidden" aria-label={t('latestUpdates')}>
          <div className="animate-ticker flex w-max gap-8 group-hover:[animation-play-state:paused]">
            {loop.map((n, i) => (
              <Link
                key={`${n.id}-${i}`}
                to={n.link || '/'}
                className="flex flex-shrink-0 items-center gap-2 text-sm font-medium text-neutral-800 hover:text-primary-700 dark:text-neutral-100"
              >
                {n.isNew && <span className="rounded bg-danger-600 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase text-white">New</span>}
                <span>{tc(n.title)}</span>
                <ChevronRight size={13} className="text-primary-600" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
        <Link to="/search?q=updates" className="hidden flex-shrink-0 text-xs font-semibold text-primary-700 hover:underline dark:text-primary-300 sm:block">
          {t('viewAllUpdates')}
        </Link>
      </div>
    </div>
  );
}
