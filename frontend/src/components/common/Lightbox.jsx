// Full-screen photo viewer: previous / next arrows, keyboard (← → Esc),
// swipe on touch screens, counter, caption and a thumbnail strip.
import React, { useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, MapPin, X } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { assetUrl } from '../../api/client';
import { formatDate } from '../../utils/format';

export default function Lightbox({ items, index, onChange, onClose }) {
  const { t, tc, lang } = useLanguage();
  const n = items.length;
  const item = items[index];
  const touch = useRef(null);
  const closeRef = useRef(null);
  const thumbs = useRef(null);
  const go = useCallback((step) => onChange((index + step + n) % n), [index, n, onChange]);

  useEffect(() => {
    const previous = document.activeElement;
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [go, onClose]);

  useEffect(() => {
    thumbs.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [index]);

  if (!item) return null;
  const title = tc(item.title);
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={title}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touch.current == null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touch.current = null;
      }}>
      <div className="lb-top">
        <span className="lb-count" aria-live="polite">{index + 1} / {n}</span>
        <button ref={closeRef} type="button" className="lb-btn" onClick={onClose} aria-label={t('close')}><X size={22} aria-hidden="true" /></button>
      </div>
      <div className="lb-stage">
        {n > 1 && <button type="button" className="lb-btn lb-arrow prev" onClick={() => go(-1)} aria-label={t('previous')}><ChevronLeft size={28} aria-hidden="true" /></button>}
        <figure key={item.id} className="lb-figure">
          <img src={assetUrl(item.image)} alt={title} />
          <figcaption>
            <strong>{title}</strong>
            {tc(item.caption) && <span>{tc(item.caption)}</span>}
            <small>
              {item.album && <span className="lb-tag">{item.album}</span>}
              {tc(item.location) && <span className="d-inline-flex align-items-center gap-1"><MapPin size={13} aria-hidden="true" /> {tc(item.location)}</span>}
              {item.date && <span>{formatDate(item.date, lang)}</span>}
            </small>
          </figcaption>
        </figure>
        {n > 1 && <button type="button" className="lb-btn lb-arrow next" onClick={() => go(1)} aria-label={t('next')}><ChevronRight size={28} aria-hidden="true" /></button>}
      </div>
      {n > 1 && (
        <div className="lb-thumbs" ref={thumbs}>
          {items.map((p, k) => (
            <button key={p.id} type="button" aria-current={k === index} aria-label={`${k + 1}. ${tc(p.title)}`} onClick={() => onChange(k)}>
              <img src={assetUrl(p.image)} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
