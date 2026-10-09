// src/components/common/ScrollToTopButton.jsx
import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function ScrollToTopButton() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label={t('backHome')}
      title={t('backHome')}
      className="fixed bottom-24 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg transition-colors hover:bg-primary-600"
    >
      <ArrowUp size={18} aria-hidden="true" />
    </button>
  );
}
