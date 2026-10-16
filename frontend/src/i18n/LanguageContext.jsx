// Bilingual (English / Telugu) interface with a switch on every page.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { pick, translations } from './translations';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'dsti.lang';

function initialLang() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'te' ? 'te' : 'en';
  } catch {
    return 'en';
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* storage unavailable */
    }
  }, [lang]);

  const setLang = useCallback((next) => setLangState(next === 'te' ? 'te' : 'en'), []);
  const t = useCallback((key) => translations[lang][key] ?? translations.en[key] ?? key, [lang]);
  /** Resolve a bilingual content field ({ en, te } or plain string). */
  const tc = useCallback((value) => pick(value, lang), [lang]);

  const value = useMemo(() => ({ lang, isTelugu: lang === 'te', setLang, t, tc }), [lang, setLang, t, tc]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
