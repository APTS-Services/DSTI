// src/components/common/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaFacebookF, FaInstagram, FaYoutube, FaXTwitter,
} from 'react-icons/fa6';
import { Mail, MapPin, MousePointerClick, Phone } from 'lucide-react';
import { contact, site, statutoryLinks } from '../../data/site';
import { useLanguage } from '../../i18n/LanguageContext';
import useVisitorStats from '../../hooks/useVisitorStats';
import { Emblem } from './Header';

const socialIcon = {
  facebook: FaFacebookF,
  x: FaXTwitter,
  youtube: FaYoutube,
  instagram: FaInstagram,
};

export default function Footer() {
  const { t, tc } = useLanguage();
  const stats = useVisitorStats();

  const directoryLinks = [
    { key: 'organisations', to: '/organisations' },
    { key: 'districtExplorer', to: '/districts' },
    { key: 'policies', to: '/policies' },
    { key: 'tenders', to: '/tenders' },
    { key: 'governmentOrders', to: '/ecitizen/government-orders' },
    { key: 'media', to: '/media' },
  ];

  return (
    <footer className="border-t-4 border-secondary-500 bg-neutral-900 text-neutral-100" role="contentinfo">
      <div className="dst-container grid grid-cols-1 gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
        {/* About */}
        <div className="lg:col-span-1">
          <div className="mb-4 flex items-center gap-3">
            <Emblem className="h-12 w-12" />
            <div>
              <p className="font-extrabold text-white">{site.shortName}</p>
              <p className="text-xs text-neutral-300">{tc(site.gov)}</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-neutral-200">{tc(site.tagline)}</p>
          <p className="mt-4 text-xs text-neutral-400">
            {t('lastUpdated')}: {new Date(site.lastUpdated).toLocaleDateString()}
          </p>
        </div>

        {/* Directory */}
        <nav aria-label="Directory">
          <h2 className="mb-4 border-b border-neutral-700 pb-2 text-sm font-bold uppercase tracking-wider text-secondary-300">
            {t('quickLinks')}
          </h2>
          <ul className="space-y-2 text-sm">
            {directoryLinks.map((l) => (
              <li key={l.key}>
                <Link to={l.to} className="dst-footer-link">{t(l.key)}</Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <h2 className="mb-4 border-b border-neutral-700 pb-2 text-sm font-bold uppercase tracking-wider text-secondary-300">
            {t('headOffice')}
          </h2>
          <ul className="space-y-3 text-sm text-neutral-200">
            <li className="flex gap-2">
              <MapPin size={16} className="mt-0.5 flex-shrink-0 text-primary-300" aria-hidden="true" />
              <span>{tc(contact.headOffice)}</span>
            </li>
            <li className="flex gap-2">
              <Phone size={16} className="flex-shrink-0 text-primary-300" aria-hidden="true" />
              <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="dst-footer-link">{contact.phone}</a>
            </li>
            <li className="flex gap-2">
              <Mail size={16} className="flex-shrink-0 text-primary-300" aria-hidden="true" />
              <a href={`mailto:${contact.email}`} className="dst-footer-link">{contact.email}</a>
            </li>
          </ul>
        </div>

        {/* Social + stats */}
        <div>
          <h2 className="mb-4 border-b border-neutral-700 pb-2 text-sm font-bold uppercase tracking-wider text-secondary-300">
            {t('followUs')}
          </h2>
          <div className="flex gap-3">
            {site.social.map((s) => {
              const Icon = socialIcon[s.id];
              return (
                <a
                  key={s.id}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800 text-neutral-100 transition-colors hover:bg-primary-600 hover:text-white"
                >
                  {Icon ? <Icon size={16} aria-hidden="true" /> : null}
                </a>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl bg-neutral-800 p-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-300">
              <MousePointerClick size={14} aria-hidden="true" /> {t('visitors')}
            </p>
            <div className="mt-2 flex items-baseline gap-4">
              <div>
                <span className="block text-2xl font-extrabold text-white tabular-nums">
                  {stats.total.toLocaleString('en-IN')}
                </span>
                <span className="text-[0.7rem] text-neutral-300">{t('totalVisits')}</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-primary-300 tabular-nums">
                  {stats.today.toLocaleString('en-IN')}
                </span>
                <span className="text-[0.7rem] text-neutral-300">{t('todayVisits')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statutory bar */}
      <div className="border-t border-neutral-800">
        <div className="dst-container flex flex-wrap items-center gap-x-5 gap-y-2 py-4 text-xs">
          <span className="font-semibold text-secondary-300">{t('statutoryPages')}:</span>
          {statutoryLinks.map((l) => (
            <Link key={l.key} to={l.to} className="dst-footer-link">{t(l.key)}</Link>
          ))}
        </div>
      </div>

      <div className="bg-neutral-950 py-4">
        <div className="dst-container flex flex-col items-center justify-between gap-2 text-center text-xs text-neutral-400 sm:flex-row sm:text-left">
          <p>
            © {new Date().getFullYear()} {tc(site.name)}, {tc(site.gov)}. {t('copyright')} — All rights reserved.
          </p>
          <p>
            {t('gov')} · {site.domain.replace('https://', '')}
          </p>
        </div>
      </div>
    </footer>
  );
}
