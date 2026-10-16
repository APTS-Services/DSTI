import React from 'react';
import { useCollection } from '../../context/ContentContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { iconFor } from '../../utils/icons';
import Reveal from '../common/Reveal';
import SectionHeading from '../common/SectionHeading';

const TONES = ['lavender', 'sky', 'blush', 'mint'];

export default function IllustratedStory() {
  const { t, tc } = useLanguage();
  const chapters = useCollection('storyChapters');
  if (!chapters.length) return null;
  return (
    <section className="section" aria-labelledby="story-title">
      <div className="container">
        <SectionHeading id="story-title" eyebrow={t('ourWork')} title={t('illustratedStory')} />
        <ol className="row g-4 list-unstyled mb-0">
          {chapters.map((c, i) => {
            const Icon = iconFor(c.icon);
            return (
              <Reveal as="li" key={c.id} className="col-md-6 col-lg-3" delay={i * 0.1}>
                <div className={`feature-card tone-${TONES[i % 4]}`}>
                  <div className="d-flex align-items-center justify-content-between">
                    <Icon size={36} strokeWidth={1.6} className="icon" aria-hidden="true" />
                    <span className="fw-800 fs-1 opacity-25" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3>{tc(c.title)}</h3>
                  <p>{tc(c.text)}</p>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
