// src/components/home/StatsStrip.jsx
import React from 'react';
import { Building2, FileText, MapPinned, ScrollText } from 'lucide-react';
import { organisations } from '../../data/organisations';
import { policies } from '../../data/policies';
import { districts } from '../../data/districts';
import { documents } from '../../data/documents';
import { useLanguage } from '../../i18n/LanguageContext';

export default function StatsStrip() {
  const { t } = useLanguage();
  const stats = [
    { icon: Building2, value: organisations.length, label: { en: 'Organisations', te: 'సంస్థలు' } },
    { icon: ScrollText, value: policies.length, label: { en: 'Sector Policies', te: 'రంగ విధానాలు' } },
    { icon: MapPinned, value: districts.length, label: { en: 'Districts covered', te: 'జిల్లాలు' } },
    { icon: FileText, value: documents.length, label: { en: 'Documents published', te: 'పత్రాలు' } },
  ];
  const { tc } = useLanguage();
  return (
    <section className="border-y border-neutral-200 bg-neutral-50 py-8 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="dst-container">
        <p className="mb-5 text-center text-sm font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300">
          {t('keyNumbers')}
        </p>
        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label.en} className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700 dark:bg-neutral-900 dark:text-primary-300">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <div>
                  <dt className="order-2 text-xs text-neutral-500 dark:text-neutral-300">{tc(s.label)}</dt>
                  <dd className="text-2xl font-extrabold text-neutral-900 dark:text-white">{s.value}</dd>
                </div>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
