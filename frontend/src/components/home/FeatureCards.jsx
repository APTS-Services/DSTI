import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCollection } from '../../context/ContentContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { iconFor } from '../../utils/icons';
import Reveal from '../common/Reveal';
import SectionHeading from '../common/SectionHeading';

export default function FeatureCards() {
  const { t, tc } = useLanguage();
  const cards = useCollection('services');
  if (!cards.length) return null;
  return (
    <section className="section" aria-labelledby="feat-title">
      <div className="container">
        <SectionHeading id="feat-title" eyebrow={t('ourWork')} title={t('quickAccessTitle')} subtitle={t('quickAccess')} />
        <div className="row g-4">
          {cards.map((c, i) => {
            const Icon = iconFor(c.icon);
            return (
              <Reveal key={c.id} className="col-sm-6 col-lg-3" delay={i * 0.08}>
                <Link to={c.to || '/'} className={`feature-card tone-${c.tone || 'lavender'}`}>
                  <Icon size={38} strokeWidth={1.6} className="icon" aria-hidden="true" />
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <h3>{tc(c.title)}</h3>
                    <span className="arrow" aria-hidden="true"><ArrowRight size={22} /></span>
                  </div>
                  <p>{tc(c.text)}</p>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
