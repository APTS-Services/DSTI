import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function ScrollTopButton() {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!show) return null;
  return (
    <button type="button" className="btn btn-dark btn-icon rounded-circle to-top shadow" onClick={() => window.scrollTo({ top: 0 })} aria-label={t('backToTop')} title={t('backToTop')}>
      <ArrowUp size={18} aria-hidden="true" />
    </button>
  );
}
