// src/components/common/TopBar.jsx
// Utility strip: skip link, accessibility controls, text resizing,
// high-contrast + dark mode toggles and the EN / తెలుగు language switch.
import React from 'react';
import { Link } from 'react-router-dom';
import { AArrowDown, AArrowUp, Contrast, Moon, RotateCcw, Sun, Volume2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

const IconBtn = ({ onClick, title, label, active, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-label={title}
    aria-pressed={active}
    className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
      active ? 'bg-secondary-500 text-neutral-950' : 'text-neutral-800 hover:bg-neutral-100'
    }`}
  >
    {children}
  </button>
);

export default function TopBar() {
  const { lang, setLang, t } = useLanguage();
  const { isDark, toggleTheme, contrast, toggleContrast, increaseFont, decreaseFont, resetFont, fontPercent } = useTheme();

  return (
    <div className="border-b border-neutral-200 bg-white text-neutral-800">
      <div className="dst-container flex flex-col gap-2 py-1.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Government identity */}
        <p className="text-center text-[0.7rem] font-medium tracking-wide sm:text-left sm:text-xs">
          <span className="text-secondary-600">●</span> {t('governmentOf')}
          <span className="hidden md:inline"> — {t('siteName')}</span>
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-end">
          {/* Accessibility label */}
          <span className="hidden items-center gap-1 text-[0.7rem] text-neutral-600 lg:flex">
            <Volume2 size={13} aria-hidden="true" /> {t('accessibility')}
          </span>

          {/* Text resizing */}
          <div className="flex items-center gap-1" role="group" aria-label={t('fontSize')}>
            <IconBtn onClick={decreaseFont} title={t('decreaseText')}>
              <AArrowDown size={14} aria-hidden="true" />
            </IconBtn>
            <button
              type="button"
              onClick={resetFont}
              title={t('resetText')}
              aria-label={`${t('resetText')} (${fontPercent}%)`}
              className="min-w-[2.9rem] rounded bg-neutral-100 px-1.5 py-0.5 text-[0.7rem] font-semibold tabular-nums hover:bg-neutral-200"
            >
              {fontPercent}%
            </button>
            <IconBtn onClick={increaseFont} title={t('increaseText')}>
              <AArrowUp size={14} aria-hidden="true" />
            </IconBtn>
          </div>

          {/* Contrast + dark mode */}
          <div className="flex items-center gap-1">
            <IconBtn onClick={toggleContrast} title={t('highContrast')} active={contrast}>
              <Contrast size={14} aria-hidden="true" />
            </IconBtn>
            <IconBtn onClick={toggleTheme} title={isDark ? t('lightMode') : t('darkMode')} active={isDark}>
              {isDark ? <Sun size={14} aria-hidden="true" /> : <Moon size={14} aria-hidden="true" />}
            </IconBtn>
          </div>

          {/* Language switch */}
          <div className="flex items-center gap-1" role="group" aria-label={t('language')}>
            <RotateCcw size={12} className="hidden text-neutral-500 sm:block" aria-hidden="true" />
            <button
              type="button"
              onClick={() => setLang('en')}
              aria-pressed={lang === 'en'}
              className={`rounded px-2 py-0.5 text-[0.7rem] font-semibold ${
                lang === 'en' ? 'bg-secondary-500 text-neutral-950' : 'text-neutral-800 hover:bg-neutral-100'
              }`}
            >
              {t('english')}
            </button>
            <button
              type="button"
              onClick={() => setLang('te')}
              aria-pressed={lang === 'te'}
              className={`rounded px-2 py-0.5 text-[0.7rem] font-semibold ${
                lang === 'te' ? 'bg-secondary-500 text-neutral-950' : 'text-neutral-800 hover:bg-neutral-100'
              }`}
            >
              {t('telugu')}
            </button>
          </div>

          <Link to="/screen-reader-access" className="hidden text-[0.7rem] underline-offset-2 hover:underline md:inline">
            {t('screenReaderAccess')}
          </Link>
        </div>
      </div>
    </div>
  );
}