// src/i18n/LanguageContext.jsx
import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import { translations, pick } from './translations';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'dsti.lang';

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    if (typeof window === 'undefined') return 'en';
    return localStorage.getItem(STORAGE_KEY) || 'en';
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const setLang = useCallback((next) => {
    setLangState(next === 'te' ? 'te' : 'en');
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => (prev === 'en' ? 'te' : 'en'));
  }, []);

  /** Translate an interface key. */
  const t = useCallback(
    (key) => {
      const table = translations[lang] || translations.en;
      return table[key] ?? translations.en[key] ?? key;
    },
    [lang]
  );

  /** Resolve a bilingual content field ({en, te} or plain string). */
  const tc = useCallback((value) => pick(value, lang), [lang]);

  const value = useMemo(
    () => ({ lang, isTelugu: lang === 'te', setLang, toggleLang, t, tc }),
    [lang, setLang, toggleLang, t, tc]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
