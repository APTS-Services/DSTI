// src/pages/StatutoryExtraPages.jsx — Screen Reader Access, Help and Sitemap.
import React from 'react';
import { Link } from 'react-router-dom';
import { Accessibility, ExternalLink, HelpCircle, LifeBuoy } from 'lucide-react';
import useSEO from '../utils/useSEO';
import { useLanguage } from '../i18n/LanguageContext';
import PageHero from '../components/common/PageHero';
import { navItems, site, statutoryLinks } from '../data/site';

export function ScreenReaderAccessPage() {
  const { t } = useLanguage();
  useSEO({ title: t('screenReaderAccess'), path: '/screen-reader-access' });
  const readers = [
    { name: 'NVDA (Windows)', url: 'https://www.nvaccess.org/download/' },
    { name: 'JAWS (Windows)', url: 'https://www.freedomscientific.com/products/software/jaws/' },
    { name: 'Orca (Linux)', url: 'https://wiki.gnome.org/Projects/Orca' },
    { name: 'TalkBack (Android)', url: 'https://support.google.com/accessibility/android/answer/6283677' },
    { name: 'VoiceOver (macOS / iOS)', url: 'https://www.apple.com/accessibility/vision/' },
  ];
  return (
    <>
      <PageHero title={t('screenReaderAccess')} breadcrumbs={[{ label: t('statutoryPages') }, { label: t('screenReaderAccess') }]} />
      <div className="dst-container max-w-3xl py-10">
        <div className="flex items-start gap-3 rounded-xl bg-primary-50 p-5 dark:bg-neutral-800">
          <Accessibility size={28} className="flex-shrink-0 text-primary-600" aria-hidden="true" />
          <p className="text-sm text-neutral-600 dark:text-neutral-200">
            This website has been designed to be compatible with screen readers. You can also use the Accessibility
            controls in the top bar to increase text size, switch to high contrast or enable dark mode.
          </p>
        </div>
        <h2 className="dst-section-title mt-8">Screen readers and their websites</h2>
        <ul className="mt-4 space-y-2">
          {readers.map((r) => (
            <li key={r.url}>
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="dst-card dst-card-hover flex items-center gap-3 p-4">
                <ExternalLink size={16} className="text-primary-600" aria-hidden="true" />
                <span className="font-medium text-neutral-900 dark:text-neutral-100">{r.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export function HelpPage() {
  const { t } = useLanguage();
  useSEO({ title: t('help'), path: '/help' });
  const items = [
    { q: 'How do I use the site search?', a: 'Click the Search button in the header, type keywords, and pick a result. The search looks across pages, policies, orders, tenders and documents.' },
    { q: 'How do I change the language to Telugu?', a: 'Use the English / తెలుగు switch in the top utility bar. The switch is available on every page.' },
    { q: 'How do I make the text bigger?', a: 'Use the A- and A+ buttons in the top bar, or the reset button to return to 100%. Text is resizable up to 140%.' },
    { q: 'How do I download a Government Order or tender?', a: 'Open the relevant page under e-Citizen or Tenders and click the PDF link on the record.' },
    { q: 'How do I give feedback?', a: 'Use the Feedback form on the Contact Us page. Your message is stored securely and notified to the Department.' },
  ];
  return (
    <>
      <PageHero title={t('help')} breadcrumbs={[{ label: t('statutoryPages') }, { label: t('help') }]} />
      <div className="dst-container max-w-3xl py-10">
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-neutral-50 p-5 dark:bg-neutral-900">
          <LifeBuoy size={26} className="text-primary-600" aria-hidden="true" />
          <p className="text-sm text-neutral-600 dark:text-neutral-200">
            New here? Ask Vigyan Mitra from any page, or read the quick answers below.
          </p>
        </div>
        <div className="space-y-3">
          {items.map((it, i) => (
            <details key={i} className="dst-card group p-0">
              <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4 font-semibold text-neutral-900 dark:text-neutral-100">
                <span className="flex items-center gap-2"><HelpCircle size={16} className="text-primary-600" aria-hidden="true" /> {it.q}</span>
                <span className="text-primary-600 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="border-t border-neutral-100 px-5 py-4 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-200">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}

export function SitemapPage() {
  const { t } = useLanguage();
  useSEO({ title: t('sitemap'), path: '/sitemap' });
  return (
    <>
      <PageHero title={t('sitemap')} breadcrumbs={[{ label: t('statutoryPages') }, { label: t('sitemap') }]} />
      <div className="dst-container py-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {navItems.map((item) => (
            <nav key={item.key} aria-label={t(item.key)}>
              <Link to={item.to} className="dst-section-title text-lg hover:text-primary-700">{t(item.key)}</Link>
              {item.children?.length > 0 && (
                <ul className="mt-3 space-y-1.5 text-sm">
                  {item.children.map((c) => (
                    <li key={c.key + c.to}>
                      <Link to={c.to} className="dst-link">{t(c.key)}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </nav>
          ))}
          <nav aria-label={t('statutoryPages')}>
            <h2 className="dst-section-title text-lg">{t('statutoryPages')}</h2>
            <ul className="mt-3 space-y-1.5 text-sm">
              {statutoryLinks.map((l) => (
                <li key={l.key}><Link to={l.to} className="dst-link">{t(l.key)}</Link></li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-8 text-xs text-neutral-500 dark:text-neutral-300">
          {site.domain}
        </p>
      </div>
    </>
  );
}
