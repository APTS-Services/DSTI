import React, { useMemo } from 'react';
import { CalendarDays, Sparkles } from 'lucide-react';
import { useCollection } from '../../context/ContentContext';
import { useLanguage } from '../../i18n/LanguageContext';

const pad = (n) => String(n).padStart(2, '0');

export default function AlmanacWidget() {
  const { t, tc, lang } = useLanguage();
  const days = useCollection('scienceDays');
  const facts = useCollection('thisDay');

  const { today, upcoming } = useMemo(() => {
    const now = new Date();
    const key = `${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const sorted = [...facts].sort((a, b) => a.date.localeCompare(b.date));
    const fact = sorted.find((f) => f.date === key) || sorted.find((f) => f.date > key) || sorted[0];
    const y = now.getFullYear();
    const start = new Date(y, now.getMonth(), now.getDate());
    const list = days.map((d) => {
      let date = new Date(y, d.month - 1, d.day);
      if (date < start) date = new Date(y + 1, d.month - 1, d.day);
      return { ...d, date };
    }).sort((a, b) => a.date - b.date).slice(0, 5);
    return { today: fact, upcoming: list };
  }, [days, facts]);

  return (
    <div className="dst-card p-4">
      <p className="section-eyebrow mb-1">{t('scienceAlmanac')}</p>
      {today && (
        <div className="p-3 rounded-3 bg-soft mb-4">
          <p className="d-flex align-items-center gap-2 fw-semibold mb-1"><Sparkles size={16} className="text-warning" aria-hidden="true" /> {t('thisDayInScience')}</p>
          <p className="mb-0">{tc(today.text)}</p>
        </div>
      )}
      <h3 className="h6 fw-bold d-flex align-items-center gap-2"><CalendarDays size={16} aria-hidden="true" /> {t('scienceDays')}</h3>
      <ul className="list-unstyled mb-0 d-grid gap-2">
        {upcoming.map((d) => (
          <li key={d.id} className="d-flex align-items-center gap-3">
            <span className="text-center rounded-3 border px-2 py-1 flex-shrink-0" style={{ minWidth: 56 }}>
              <span className="d-block fw-bold lh-1">{d.date.getDate()}</span>
              <small className="text-muted-2">{d.date.toLocaleDateString(lang === 'te' ? 'te-IN' : 'en-IN', { month: 'short' })}</small>
            </span>
            <span><span className="fw-medium">{tc(d.name)}</span>{d.theme && <small className="d-block text-muted-2">{d.theme}</small>}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
