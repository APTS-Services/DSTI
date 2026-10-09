// src/components/home/UpcomingEvents.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin } from 'lucide-react';
import { upcomingEvents } from '../../data/events';
import { useLanguage } from '../../i18n/LanguageContext';
import SectionHeading from '../common/SectionHeading';

export default function UpcomingEvents() {
  const { t, tc } = useLanguage();
  const events = upcomingEvents.slice(0, 4);

  return (
    <section className="bg-white py-12 dark:bg-neutral-950">
      <div className="dst-container">
        <SectionHeading eyebrow={t('events')} title={t('upcomingEvents')} action={t('viewAll')} actionTo="/media/events" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {events.map((e) => (
            <Link key={e.id} to="/media/events" className="dst-card dst-card-hover flex gap-4 p-4">
              <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-gradient-to-br from-neutral-800 to-primary-700 text-white">
                <span className="text-xl font-extrabold leading-none">{new Date(e.date).getDate()}</span>
                <span className="text-[0.65rem] uppercase leading-none">
                  {new Date(e.date).toLocaleString('en', { month: 'short' })}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-[0.7rem] font-bold uppercase tracking-wide text-secondary-600 dark:text-secondary-300">{e.category}</span>
                <h3 className="font-bold text-neutral-900 dark:text-neutral-100">{tc(e.title)}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-300">
                  <MapPin size={12} aria-hidden="true" /> {tc(e.location)}
                </p>
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-300">
          <CalendarDays size={13} aria-hidden="true" /> {t('upcomingEvents')}
        </p>
      </div>
    </section>
  );
}
