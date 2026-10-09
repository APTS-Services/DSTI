// src/components/home/WhatBringsYouHere.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FlaskConical, GraduationCap, Users } from 'lucide-react';
import { audiences } from '../../data/services';
import { useLanguage } from '../../i18n/LanguageContext';
import SectionHeading from '../common/SectionHeading';

const ICONS = { Users, GraduationCap, FlaskConical, Briefcase };

export default function WhatBringsYouHere() {
  const { t, tc } = useLanguage();
  return (
    <section className="bg-white py-12 dark:bg-neutral-950">
      <div className="dst-container">
        <SectionHeading eyebrow={t('quickAccess')} title={t('whatBringsYouHere')} />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map((a) => {
            const Icon = ICONS[a.icon] || Users;
            return (
              <div key={a.id} className="dst-card dst-card-hover flex flex-col p-5">
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-800 to-primary-700 text-white">
                  <Icon size={24} aria-hidden="true" />
                </span>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{tc(a.title)}</h3>
                <p className="mt-1.5 flex-1 text-sm text-neutral-500 dark:text-neutral-300">{tc(a.blurb)}</p>
                <ul className="mt-4 space-y-1.5 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                  {a.links.map((l) => (
                    <li key={l.key}>
                      <Link to={l.to} className="flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:underline dark:text-primary-300">
                        <span className="text-secondary-500">›</span> {t(l.key)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
