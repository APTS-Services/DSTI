import React from 'react';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../i18n/LanguageContext';
import useSiteCounts from '../../hooks/useSiteCounts';
import Reveal from '../common/Reveal';

export default function StatsStrip() {
  const { t } = useLanguage();
  const { data } = useContent();
  const c = data.collections;
  const counts = useSiteCounts();

  // The API counts are authoritative; the bundle counts render instantly and
  // cover the moment before the request resolves (and an offline API).
  const value = (key, fallback) => (counts && Number.isFinite(Number(counts[key])) ? counts[key] : fallback);
  const stats = [
    { v: value('organisations', (c.organisations || []).length), l: t('organisations') },
    { v: value('policies', (c.policies || []).length), l: t('policies') },
    { v: value('districts', (c.districts || []).length), l: t('districtsCovered') },
    { v: value('orders', (c.documents || []).length + (c.tenders || []).length), l: t('documentsPublished') },
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
