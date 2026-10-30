import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useCollection, useSetting } from '../../context/ContentContext';
import { useLanguage } from '../../i18n/LanguageContext';
import SocialIcon from '../common/SocialIcon';
import { formatDate, safeHref } from '../../utils/format';
import { apiUrl, assetUrl } from '../../api/client';
import { DEFAULT_LOGO } from './Header';

const STATUTORY = [
  ['websitePolicy', '/policies/website-policy'], ['privacyPolicy', '/policies/privacy-policy'], ['termsOfUse', '/policies/terms-of-use'],
  ['copyright', '/policies/copyright'], ['disclaimer', '/policies/disclaimer'], ['hyperlinkPolicy', '/policies/hyperlink-policy'],
  ['accessibilityStatement', '/policies/accessibility-statement'], ['screenReaderAccess', '/screen-reader-access'], ['help', '/help'], ['sitemap', '/sitemap'],
];

export default function Footer() {
  const { t, tc, lang } = useLanguage();
  const site = useSetting('site');
  const contact = useSetting('contact');
  const nav = useCollection('navigation');
  const pages = useCollection('pages');
  const [stats, setStats] = useState(null);

  // The "Website Policies & Help" column is driven by the CMS: pages flagged
  // "Show in the website footer", in their display order. Until an editor flags
  // any, the previous fixed list is shown so the footer is never empty.
  const policyLinks = useMemo(() => {
    const flagged = pages
      .filter((page) => page.showInFooter)
      .sort((a, b) => Number(a._order || 0) - Number(b._order || 0))
      .map((page) => ({ key: page.id, label: tc(page.title), to: page.path || `/p/${page.id}` }));
    const links = flagged.length ? flagged : STATUTORY.map(([key, to]) => ({ key, label: t(key), to }));
    return links.some((link) => link.to === '/sitemap') ? links : [...links, { key: 'sitemap', label: t('sitemap'), to: '/sitemap' }];
  }, [pages, t, tc]);

  useEffect(() => {
    fetch(apiUrl('/api/public/stats')).then((r) => (r.ok ? r.json() : null)).then(setStats).catch(() => {});
  }, []);

  return (
    <footer className="site-footer pt-5 mt-auto">
      <div className="container">
        <div className="row g-4 pb-4">
          <div className="col-lg-4">
            <div className="d-flex align-items-center gap-3 mb-3">
              <img src={assetUrl(site.logo) || DEFAULT_LOGO} alt="" width="52" height="52" style={{ background: '#fff', borderRadius: '50%', padding: 3 }} />
              <div>
                <h2 className="mb-0">{tc(site.name) || t('siteName')}</h2>
                <small>{tc(site.gov) || t('gov')}</small>
              </div>
            </div>
            <p className="mb-3">{tc(site.footerAbout)}</p>
            {site.social?.length > 0 && (
              <>
                <h3 className="h6">{t('followUs')}</h3>
                <ul className="social list-unstyled d-flex gap-2 mb-0">
                  {site.social.map((s) => (
                    <li key={s.href}>
                      <a href={safeHref(s.href)} target="_blank" rel="noopener noreferrer" aria-label={`${s.label || s.id} (${t('opensNewWindow')})`} title={s.label}>
                        <SocialIcon id={s.id} />
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <div className="col-6 col-lg-2">
            <h3>{t('quickLinks')}</h3>
            <ul className="list-unstyled d-grid gap-2 mb-0">
              <li><Link to="/">{t('home')}</Link></li>
              {nav.slice(0, 8).map((n) => <li key={n.id}><Link to={n.to}>{tc(n.label)}</Link></li>)}
            </ul>
          </div>
          <div className="col-6 col-lg-3">
            <h3>{t('statutoryPages')}</h3>
            <ul className="list-unstyled d-grid gap-2 mb-0">
              {policyLinks.map((link) => <li key={link.key}><Link to={link.to}>{link.label}</Link></li>)}
            </ul>
          </div>
          <div className="col-lg-3">
            <h3>{t('contact')}</h3>
            <ul className="list-unstyled d-grid gap-2 mb-0">
              {contact.headOffice && <li className="d-flex gap-2"><MapPin size={16} className="flex-shrink-0 mt-1" aria-hidden="true" /> <span>{tc(contact.headOffice)}</span></li>}
              {contact.phone && <li className="d-flex gap-2"><Phone size={16} className="flex-shrink-0 mt-1" aria-hidden="true" /> <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a></li>}
              {contact.email && <li className="d-flex gap-2"><Mail size={16} className="flex-shrink-0 mt-1" aria-hidden="true" /> <a href={`mailto:${contact.email}`}>{contact.email}</a></li>}
            </ul>
            <Link to="/feedback" className="btn btn-sm btn-footer mt-3">{t('giveFeedback')}</Link>
          </div>
        </div>
        <div className="bottom d-flex flex-wrap justify-content-between gap-2 py-3">
          <span>© {new Date().getFullYear()} {tc(site.name) || t('siteName')}, {tc(site.gov) || t('gov')}. {t('allRights')}</span>
          <span className="d-flex flex-wrap gap-3">
            {stats && <span>{t('visitors')}: <strong>{stats.total.toLocaleString('en-IN')}</strong> · {t('todayVisits')}: <strong>{stats.today.toLocaleString('en-IN')}</strong></span>}
            {stats?.lastUpdated && <span>{t('lastUpdated')}: {formatDate(stats.lastUpdated, lang)}</span>}
          </span>
        </div>
      </div>
    </footer>
  );
}
