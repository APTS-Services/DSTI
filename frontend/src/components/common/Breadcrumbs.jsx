// src/components/common/Breadcrumbs.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function Breadcrumbs({ items = [] }) {
  const { t } = useLanguage();
  return (
    <nav aria-label="Breadcrumb" className="text-xs">
      <ol className="flex flex-wrap items-center gap-1 text-neutral-100">
        <li>
          <Link to="/" className="flex items-center gap-1 hover:text-secondary-300">
            <Home size={12} aria-hidden="true" /> {t('breadcrumbHome')}
          </Link>
        </li>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1">
              <ChevronRight size={12} className="text-neutral-300" aria-hidden="true" />
              {last || !item.to ? (
                <span aria-current="page" className="font-semibold text-white">{item.label}</span>
              ) : (
                <Link to={item.to} className="hover:text-secondary-300">{item.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
