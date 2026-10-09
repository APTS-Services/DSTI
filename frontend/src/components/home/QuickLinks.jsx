// src/components/home/QuickLinks.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, CalendarDays, MapPinned, ScrollText } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import SectionHeading from '../common/SectionHeading';

export default function QuickLinks() {
  const { t } = useLanguage();
  const cards = [
    { icon: Building2, to: '/organisations', key: 'organisations', accent: 'from-neutral-800 to-primary-700' },
    { icon: ScrollText, to: '/policies', key: 'policies', accent: 'from-primary-700 to-neutral-800' },
    { icon: CalendarDays, to: '/media/events', key: 'events', accent: 'from-neutral-900 to-neutral-700' },
    { icon: MapPinned, to: '/districts', key: 'districtExplorer', accent: 'from-secondary-500 to-secondary-700' },
  ];
  return (
    <section className="bg-white py-12 dark:bg-neutral-950">
      <div className="dst-container">
        <SectionHeading eyebrow={t('quickAccess')} title={t('quickLinks')} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.key}
                to={c.to}
                className={`group flex items-center gap-4 rounded-xl bg-gradient-to-br ${c.accent} p-5 text-white shadow-card transition-transform hover:-translate-y-0.5`}
              >
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Icon size={24} aria-hidden="true" />
                </span>
                <span className="flex-1 font-bold">{t(c.key)}</span>
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
