// src/components/home/AlmanacWidget.jsx
import React from 'react';
import { CalendarDays, Sparkles } from 'lucide-react';
import { todayInScience, upcomingScienceDays } from '../../data/almanac';
import { useLanguage } from '../../i18n/LanguageContext';

export default function AlmanacWidget() {
  const { t, tc } = useLanguage();
  const today = todayInScience();
  const upcoming = upcomingScienceDays(4);

  return (
    <section className="bg-gradient-to-br from-primary-50 to-neutral-50 py-12 dark:from-neutral-900 dark:to-neutral-950">
      <div className="dst-container grid gap-6 lg:grid-cols-2">
        {/* This day in science */}
        <div className="dst-card p-6">
          <p className="dst-eyebrow flex items-center gap-2">
            <Sparkles size={14} aria-hidden="true" /> {t('scienceAlmanac')}
          </p>
          <h3 className="mt-2 text-xl font-bold text-neutral-900 dark:text-white">{t('thisDayInScience')}</h3>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-200">{tc(today.text)}</p>
          <p className="mt-3 text-xs font-semibold text-primary-700 dark:text-primary-300">{today.key}</p>
        </div>

        {/* Upcoming science days */}
        <div className="dst-card p-6">
          <p className="dst-eyebrow flex items-center gap-2">
            <CalendarDays size={14} aria-hidden="true" /> {t('scienceDays')}
          </p>
          <h3 className="mt-2 text-xl font-bold text-neutral-900 dark:text-white">Upcoming observances</h3>
          <ul className="mt-4 space-y-3">
            {upcoming.map((d, i) => (
              <li key={i} className="flex items-center gap-3 border-b border-neutral-100 pb-2 last:border-0 dark:border-neutral-800">
                <span className="flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-neutral-900 text-white">
                  <span className="text-sm font-extrabold leading-none">{d.date.getDate()}</span>
                  <span className="text-[0.6rem] uppercase leading-none">
                    {d.date.toLocaleString('en', { month: 'short' })}
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100">{tc(d.name)}</span>
                  <span className="block text-xs text-neutral-500 dark:text-neutral-300">{d.theme}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
