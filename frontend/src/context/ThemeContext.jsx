// src/context/ThemeContext.jsx
// Light/dark theme + GIGW/WCAG accessibility preferences
// (high-contrast mode and text resizing).
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
const THEME_KEY = 'dsti.theme';
const CONTRAST_KEY = 'dsti.contrast';
const FONT_KEY = 'dsti.fontScale';

export const FONT_STEPS = [90, 100, 110, 125, 140];
const DEFAULT_STEP = 1; // 100%

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem(THEME_KEY) || 'light';
  });
  const [contrast, setContrast] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(CONTRAST_KEY) === 'true';
  });
  const [fontStep, setFontStep] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_STEP;
    const saved = parseInt(localStorage.getItem(FONT_KEY) || '', 10);
    return Number.isNaN(saved) ? DEFAULT_STEP : Math.min(Math.max(saved, 0), FONT_STEPS.length - 1);
  });

  // Apply dark mode
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Apply high contrast
  useEffect(() => {
    document.documentElement.classList.toggle('dst-contrast', contrast);
    localStorage.setItem(CONTRAST_KEY, String(contrast));
  }, [contrast]);

  // Apply text resizing
  useEffect(() => {
    document.documentElement.style.setProperty('--dst-root-font', `${FONT_STEPS[fontStep]}%`);
    localStorage.setItem(FONT_KEY, String(fontStep));
  }, [fontStep]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
      contrast,
      toggleContrast: () => setContrast((c) => !c),
      fontStep,
      fontPercent: FONT_STEPS[fontStep],
      increaseFont: () => setFontStep((s) => Math.min(s + 1, FONT_STEPS.length - 1)),
      decreaseFont: () => setFontStep((s) => Math.max(s - 1, 0)),
      resetFont: () => setFontStep(DEFAULT_STEP),
    }),
    [theme, contrast, fontStep]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
