import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pause, Play } from 'lucide-react';
import { useCollection } from '../../context/ContentContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { byDateDesc, formatDate, isExternal, safeHref } from '../../utils/format';

export default function NewsTicker() {
  const { t, tc, lang } = useLanguage();
  const news = useCollection('news');
  const [paused, setPaused] = useState(false);
  const items = useMemo(() => [...news].sort(byDateDesc()).slice(0, 8), [news]);
  if (!items.length) return null;

  const Item = ({ n, hidden }) => {
    const body = <>{n.isNew && <span className="badge text-bg-danger me-2">{t('new')}</span>}<span className="text-muted-2 me-2">{formatDate(n.date, lang)}</span>{tc(n.title)}</>;
    const props = hidden ? { tabIndex: -1, 'aria-hidden': true } : {};
    if (!n.link) return <span {...props}>{body}</span>;
    return isExternal(n.link)
      ? <a href={safeHref(n.link)} target="_blank" rel="noopener noreferrer" {...props}>{body}</a>
      : <Link to={n.link} {...props}>{body}</Link>;
  };

  return (
    <section className={`ticker ${paused ? 'paused' : ''}`} aria-label={t('latestUpdates')}>
      <div className="container d-flex align-items-stretch px-0 px-sm-3">
        <h2 className="label h6 mb-0 d-flex align-items-center">{t('latestUpdates')}</h2>
        <div className="track d-flex align-items-center px-3">
          <div className="move">
            {items.map((n) => <Item key={n.id} n={n} />)}
            {items.map((n) => <Item key={`dup-${n.id}`} n={n} hidden />)}
          </div>
        </div>
        <button type="button" className="btn btn-link text-body px-3" onClick={() => setPaused((p) => !p)} aria-label={paused ? t('play') : t('pause')}>
          {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
        </button>
      </div>
    </section>
  );
}
