import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';

/** Inner-page title band with breadcrumbs. `crumbs` = [{ label, to? }]. */
export default function PageHero({ title, subtitle, crumbs = [], children }) {
  const { t } = useLanguage();
  return (
    <section className="page-hero">
      <div className="container">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/">{t('home')}</Link></li>
            {crumbs.map((c, i) => (
              <li key={i} className={`breadcrumb-item ${i === crumbs.length - 1 ? 'active' : ''}`} aria-current={i === crumbs.length - 1 ? 'page' : undefined}>
                {c.to && i !== crumbs.length - 1 ? <Link to={c.to}>{c.label}</Link> : c.label}
              </li>
            ))}
          </ol>
        </nav>
        <h1>{title}</h1>
        {subtitle && <p className="text-muted-2 mb-0" style={{ maxWidth: '60rem' }}>{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
