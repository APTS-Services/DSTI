// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Search } from 'lucide-react';
import useSEO from '../utils/useSEO';
import { useLanguage } from '../i18n/LanguageContext';

export default function NotFoundPage() {
  const { t } = useLanguage();
  useSEO({ title: 'Page not found', path: '/404' });
  return (
    <div className="dst-container flex flex-col items-center justify-center py-24 text-center">
      <Compass size={64} className="text-primary-600" aria-hidden="true" />
      <p className="mt-6 text-5xl font-extrabold text-neutral-900 dark:text-white">404</p>
      <h1 className="mt-2 text-xl font-bold text-neutral-900 dark:text-neutral-100">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-neutral-500 dark:text-neutral-300">
        The page you are looking for may have been moved or no longer exists. Try the site search or return home.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary">
          <Home size={16} aria-hidden="true" /> {t('home')}
        </Link>
        <Link to="/search" className="btn-outline">
          <Search size={16} aria-hidden="true" /> {t('search')}
        </Link>
      </div>
    </div>
  );
}
