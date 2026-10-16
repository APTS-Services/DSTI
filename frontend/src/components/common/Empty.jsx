import React from 'react';
import { Inbox } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function Empty({ text }) {
  const { t } = useLanguage();
  return (
    <div className="text-center text-muted-2 py-5">
      <Inbox size={32} aria-hidden="true" className="mb-2" />
      <p className="mb-0">{text || t('noRecords')}</p>
    </div>
  );
}
