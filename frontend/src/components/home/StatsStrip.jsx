import React from 'react';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../i18n/LanguageContext';
import Reveal from '../common/Reveal';

export default function StatsStrip() {
  const { t } = useLanguage();
  const { data } = useContent();
  const c = data.collections;
  const stats = [
    { v: c.organisations?.length || 0, l: t('organisations') },
    { v: c.policies?.length || 0, l: t('policies') },
    { v: c.districts?.length || 0, l: t('districtsCovered') },
    { v: (c.documents?.length || 0) + (c.tenders?.length || 0), l: t('documentsPublished') },
  ];
  return (
    <section className="section-sm border-bottom" aria-label={t('keyNumbers')}>
      <div className="container">
        <div className="row g-4">
          {stats.map((s, i) => (
            <Reveal key={s.l} className="col-6 col-md-3 stat" delay={i * 0.08}>
              <div className="num">{s.v}</div>
              <div className="lbl">{s.l}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
