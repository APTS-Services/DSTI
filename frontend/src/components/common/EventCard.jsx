import React from 'react';
import { CalendarDays, MapPin } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatDate } from '../../utils/format';
import { assetUrl } from '../../api/client';

export default function EventCard({ e }) {
  const { tc, lang } = useLanguage();
  const d = new Date(`${e.date}T00:00:00`);
  return (
    <article className="dst-card hoverable d-flex flex-column">
      {e.image && <img src={assetUrl(e.image)} alt="" className="rounded-3 mb-3 w-100" style={{ aspectRatio: '16/9', objectFit: 'cover' }} loading="lazy" />}
      <div className="d-flex gap-3 align-items-start">
        <span className="text-center rounded-3 bg-primary text-white px-3 py-2 flex-shrink-0">
          <span className="d-block fs-4 fw-bold lh-1">{Number.isNaN(d.getTime()) ? '' : d.getDate()}</span>
          <small>{Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(lang === 'te' ? 'te-IN' : 'en-IN', { month: 'short', year: '2-digit' })}</small>
        </span>
        <div>
          {e.category && <span className="pill mb-1">{e.category}</span>}
          <h3 className="h6 fw-bold mb-1">{tc(e.title)}</h3>
          <p className="small text-muted-2 mb-1 d-flex align-items-center gap-1"><CalendarDays size={13} aria-hidden="true" /> {formatDate(e.date, lang)}{e.endDate ? ` – ${formatDate(e.endDate, lang)}` : ''}</p>
          {tc(e.location) && <p className="small text-muted-2 mb-0 d-flex align-items-center gap-1"><MapPin size={13} aria-hidden="true" /> {tc(e.location)}</p>}
        </div>
      </div>
      {tc(e.summary) && <p className="small mt-3 mb-0">{tc(e.summary)}</p>}
    </article>
  );
}
