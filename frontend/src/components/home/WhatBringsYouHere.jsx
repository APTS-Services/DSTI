import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCollection } from '../../context/ContentContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { iconFor } from '../../utils/icons';
import Reveal from '../common/Reveal';
import SectionHeading from '../common/SectionHeading';

export default function WhatBringsYouHere() {
  const { t, tc } = useLanguage();
  const audiences = useCollection('audiences');
  const [active, setActive] = useState(0);
  if (!audiences.length) return null;
  const a = audiences[Math.min(active, audiences.length - 1)];
  const ActiveIcon = iconFor(a.icon);

  const onKey = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setActive((x) => (x + 1) % audiences.length); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setActive((x) => (x - 1 + audiences.length) % audiences.length); }
  };

  return (
    <section className="section bg-soft" aria-labelledby="wbyh-title">
      <div className="container">
        <SectionHeading id="wbyh-title" eyebrow={t('informationFor')} title={t('whatBringsYouHere')} />
        <Reveal className="row g-4">
          <div className="col-lg-4">
            <div className="d-grid gap-2" role="tablist" aria-label={t('whatBringsYouHere')} onKeyDown={onKey}>
              {audiences.map((x, i) => {
                const Icon = iconFor(x.icon);
                const sel = i === active;
                return (
                  <button key={x.id} id={`aud-tab-${x.id}`} type="button" role="tab" aria-selected={sel} aria-controls={`aud-panel-${x.id}`} tabIndex={sel ? 0 : -1}
                    className={`btn text-start d-flex align-items-center gap-3 p-3 rounded-4 ${sel ? 'btn-primary' : 'bg-surface border'}`} onClick={() => setActive(i)}>
                    <Icon size={22} aria-hidden="true" /> <span className="fw-semibold">{tc(x.title)}</span>
                    <ArrowRight size={16} className="ms-auto" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="col-lg-8">
            <div id={`aud-panel-${a.id}`} role="tabpanel" aria-labelledby={`aud-tab-${a.id}`} className="dst-card p-4 p-lg-5">
              <div className="d-flex align-items-center gap-3 mb-3">
                <span className="icon-chip"><ActiveIcon size={24} aria-hidden="true" /></span>
                <h3 className="h3 mb-0 fw-bold">{tc(a.title)}</h3>
              </div>
              <p className="text-muted-2 fs-5">{tc(a.blurb)}</p>
              <div className="row g-3 mt-1">
                {(a.links || []).map((l) => (
                  <div className="col-sm-6" key={l.to + tc(l.label)}>
                    <Link to={l.to} className="d-flex align-items-center justify-content-between p-3 rounded-3 border text-decoration-none text-body bg-soft h-100">
                      <span className="fw-medium">{tc(l.label)}</span> <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
