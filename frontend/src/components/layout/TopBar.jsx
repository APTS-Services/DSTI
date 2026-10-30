// Slim utility bar (GIGW): skip link, screen reader access, one accessibility
// menu (text size, contrast, dark mode) and the language switch.
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Accessibility, Check, ChevronDown, Contrast, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useSetting } from '../../context/ContentContext';
import { LanguageToggle } from './Header';

function AccessibilityMenu() {
  const { t } = useLanguage();
  const th = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="position-relative" ref={ref}>
      <button type="button" className="tb-btn" aria-expanded={open} aria-controls="a11y-menu" onClick={() => setOpen((o) => !o)}>
        <Accessibility size={14} aria-hidden="true" /> <span className="d-none d-sm-inline">{t('accessibility')}</span> <ChevronDown size={13} aria-hidden="true" />
      </button>
      {open && (
        <div id="a11y-menu" className="a11y-menu" role="group" aria-label={t('accessibility')}>
          <div className="a11y-row">
            <span>{t('fontSize')}</span>
            <div className="btn-group" role="group" aria-label={t('fontSize')}>
              <button type="button" className="a11y-size" onClick={th.decreaseFont} aria-label={t('decreaseText')} title={t('decreaseText')}>A-</button>
              <button type="button" className="a11y-size" onClick={th.resetFont} aria-label={t('resetText')} title={`${t('resetText')} (${th.fontPercent}%)`}>A</button>
              <button type="button" className="a11y-size" onClick={th.increaseFont} aria-label={t('increaseText')} title={t('increaseText')}>A+</button>
            </div>
          </div>
          <button type="button" className="a11y-toggle" aria-pressed={th.contrast} onClick={th.toggleContrast}>
            <Contrast size={15} aria-hidden="true" /> {t('highContrast')} {th.contrast && <Check size={15} className="ms-auto" aria-hidden="true" />}
          </button>
          <button type="button" className="a11y-toggle" aria-pressed={th.isDark} onClick={th.toggleTheme}>
            <Moon size={15} aria-hidden="true" /> {t('darkMode')} {th.isDark && <Check size={15} className="ms-auto" aria-hidden="true" />}
          </button>
          <Link to="/screen-reader-access" className="a11y-toggle" onClick={() => setOpen(false)}>{t('screenReaderAccess')}</Link>
        </div>
      )}
    </div>
  );
}

export default function TopBar() {
  const { t, tc } = useLanguage();
  const site = useSetting('site');
  return (
    <div className="topbar">
      <div className="container d-flex align-items-center justify-content-between gap-2">
        <span className="text-truncate">{tc(site.gov) || t('gov')}</span>
        <div className="d-flex align-items-center gap-1 gap-sm-2 flex-shrink-0" role="toolbar" aria-label={t('accessibility')}>
          <a href="#main-content" className="tb-link d-none d-md-inline">{t('skipToContent')}</a>
          <Link to="/screen-reader-access" className="tb-link d-none d-lg-inline">{t('screenReaderAccess')}</Link>
          <AccessibilityMenu />
          <LanguageToggle className="tb-btn" />
        </div>
      </div>
    </div>
  );
}
