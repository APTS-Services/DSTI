// Slim utility bar: skip link target, accessibility tools and language switch (GIGW).
import React from 'react';
import { Link } from 'react-router-dom';
import { Contrast, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useSetting } from '../../context/ContentContext';

export default function TopBar() {
  const { t, tc, lang, setLang } = useLanguage();
  const th = useTheme();
  const site = useSetting('site');
  return (
    <div className="topbar">
      <div className="container d-flex flex-wrap align-items-center justify-content-between gap-2 py-1">
        <span className="d-none d-md-inline">{tc(site.gov) || t('gov')}</span>
        <div className="d-flex flex-wrap align-items-center gap-2 ms-auto" role="toolbar" aria-label={t('accessibility')}>
          <a href="#main-content" className="d-none d-sm-inline">{t('skipToContent')}</a>
          <span className="opacity-25 d-none d-sm-inline" aria-hidden="true">|</span>
          <Link to="/screen-reader-access">{t('screenReaderAccess')}</Link>
          <span className="opacity-25" aria-hidden="true">|</span>
          <div className="btn-group" role="group" aria-label={t('fontSize')}>
            <button type="button" className="btn-tool" onClick={th.decreaseFont} aria-label={t('decreaseText')} title={t('decreaseText')}>A-</button>
            <button type="button" className="btn-tool" onClick={th.resetFont} aria-label={t('resetText')} title={`${t('resetText')} (${th.fontPercent}%)`}>A</button>
            <button type="button" className="btn-tool" onClick={th.increaseFont} aria-label={t('increaseText')} title={t('increaseText')}>A+</button>
          </div>
          <button type="button" className={`btn-tool ${th.contrast ? 'active' : ''}`} onClick={th.toggleContrast} aria-pressed={th.contrast} aria-label={t('highContrast')} title={t('highContrast')}>
            <Contrast size={13} aria-hidden="true" />
          </button>
          <button type="button" className={`btn-tool ${th.isDark ? 'active' : ''}`} onClick={th.toggleTheme} aria-pressed={th.isDark} aria-label={th.isDark ? t('lightMode') : t('darkMode')} title={th.isDark ? t('lightMode') : t('darkMode')}>
            {th.isDark ? <Sun size={13} aria-hidden="true" /> : <Moon size={13} aria-hidden="true" />}
          </button>
          <span className="opacity-25" aria-hidden="true">|</span>
          <div className="btn-group" role="group" aria-label={t('language')}>
            <button type="button" className={`btn-tool ${lang === 'en' ? 'active' : ''}`} lang="en" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>English</button>
            <button type="button" className={`btn-tool ${lang === 'te' ? 'active' : ''}`} lang="te" aria-pressed={lang === 'te'} onClick={() => setLang('te')}>తెలుగు</button>
          </div>
        </div>
      </div>
    </div>
  );
}
