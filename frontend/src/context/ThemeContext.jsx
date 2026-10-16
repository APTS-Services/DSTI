// Display preferences: dark mode, high contrast and text size (GIGW / WCAG 2.1).
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
export const FONT_STEPS = [90, 100, 110, 125, 140];

const read = (key, fallback) => {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable */
  }
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => read('dsti.theme', 'light'));
  const [contrast, setContrast] = useState(() => read('dsti.contrast', 'false') === 'true');
  const [fontStep, setFontStep] = useState(() => {
    const n = parseInt(read('dsti.font', '1'), 10);
    return Number.isNaN(n) ? 1 : Math.min(Math.max(n, 0), FONT_STEPS.length - 1);
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme === 'dark' ? 'dark' : 'light');
    write('dsti.theme', theme);
  }, [theme]);
  useEffect(() => {
    document.documentElement.classList.toggle('hc', contrast);
    write('dsti.contrast', String(contrast));
  }, [contrast]);
  useEffect(() => {
    document.documentElement.style.setProperty('--dst-root-font', `${FONT_STEPS[fontStep]}%`);
    write('dsti.font', String(fontStep));
  }, [fontStep]);

  const value = useMemo(() => ({
    theme,
    isDark: theme === 'dark',
    toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    contrast,
    toggleContrast: () => setContrast((c) => !c),
    fontStep,
    fontPercent: FONT_STEPS[fontStep],
    increaseFont: () => setFontStep((s) => Math.min(s + 1, FONT_STEPS.length - 1)),
    decreaseFont: () => setFontStep((s) => Math.max(s - 1, 0)),
    resetFont: () => setFontStep(1),
  }), [theme, contrast, fontStep]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
