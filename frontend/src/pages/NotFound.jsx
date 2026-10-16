import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import useSEO from '../hooks/useSEO';

export default function NotFound() {
  const { t } = useLanguage();
  useSEO({ title: t('pageNotFound') });
  return (
    <div className="container section text-center">
      <p className="display-1 fw-800 text-primary mb-0">404</p>
      <h1 className="h2 fw-bold">{t('pageNotFound')}</h1>
      <p className="text-muted-2">{t('pageNotFoundDesc')}</p>
      <div className="d-flex justify-content-center gap-2">
        <Link to="/" className="btn btn-primary">{t('backHome')}</Link>
        <Link to="/sitemap" className="btn btn-outline-dark">{t('sitemap')}</Link>
      </div>
    </div>
  );
}
