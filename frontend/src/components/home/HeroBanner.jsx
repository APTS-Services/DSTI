import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useCollection, useSetting } from '../../context/ContentContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { isExternal, safeHref } from '../../utils/format';
import { assetUrl } from '../../api/client';

export default function HeroBanner() {
  const { t, tc } = useLanguage();
  const slides = useCollection('heroSlides');
  const site = useSetting('site');
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  const n = slides.length;

  useEffect(() => {
    if (paused || n < 2) return undefined;
    const id = setInterval(() => setI((x) => (x + 1) % n), 7000);
    return () => clearInterval(id);
  }, [paused, n]);

  if (!n) return null;
  const s = slides[i % n];
  const cta = s.ctaLink && tc(s.ctaLabel);

  return (
    <section className="hero" aria-roledescription="carousel" aria-label={t('keyMessages')}>
      {s.image && <div className="hero-bg" style={{ backgroundImage: `url("${encodeURI(assetUrl(s.image))}")` }} aria-hidden="true" />}
      <div className="container hero-inner d-flex flex-column justify-content-center">
        <div key={i} className="slide" aria-live={paused ? 'polite' : 'off'}>
          <p className="eyebrow mb-3">{tc(site.gov)}</p>
          <h2 className="hero-title mb-3">{tc(s.title)}</h2>
          {tc(s.subtitle) && <p className="lead mb-4">{tc(s.subtitle)}</p>}
          <div className="d-flex flex-wrap gap-2">
            {cta && (isExternal(s.ctaLink) ? (
              <a className="btn btn-light d-inline-flex align-items-center gap-2" href={safeHref(s.ctaLink)} target="_blank" rel="noopener noreferrer">{cta} <ArrowRight size={16} aria-hidden="true" /></a>
            ) : (
              <Link className="btn btn-light d-inline-flex align-items-center gap-2" to={s.ctaLink}>{cta} <ArrowRight size={16} aria-hidden="true" /></Link>
            ))}
            <Link className="btn btn-light-outline" to="/about">{t('learnAboutUs')}</Link>
          </div>
        </div>
        {n > 1 && (
          <div className="d-flex align-items-center gap-3 mt-5">
            <div className="dots d-flex gap-2">
              {slides.map((sl, k) => (
                <button key={sl.id} type="button" className={k === i ? 'active' : ''} aria-label={`${t('slide')} ${k + 1}`} aria-current={k === i} onClick={() => setI(k)} />
              ))}
            </div>
            <div className="ms-auto d-flex gap-2">
              <button type="button" className="btn btn-sm btn-light-outline btn-icon" onClick={() => setI((i - 1 + n) % n)} aria-label={t('previous')}><ChevronLeft size={18} aria-hidden="true" /></button>
              <button type="button" className="btn btn-sm btn-light-outline btn-icon" onClick={() => setPaused((p) => !p)} aria-label={paused ? t('play') : t('pause')}>{paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}</button>
              <button type="button" className="btn btn-sm btn-light-outline btn-icon" onClick={() => setI((i + 1) % n)} aria-label={t('next')}><ChevronRight size={18} aria-hidden="true" /></button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
