// Navy gradient band with overlapping news cards (as in the reference design).
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Newspaper } from 'lucide-react';
import { useCollection, useSetting } from '../../context/ContentContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { byDateDesc, formatDate, isExternal, safeHref } from '../../utils/format';
import Reveal from '../common/Reveal';
import useScroller from '../common/useScroller';

function Card({ n }) {
  const { tc, lang } = useLanguage();
  const inner = (
    <>
      <div className="thumb">
        {n.image ? <img src={n.image} alt="" loading="lazy" /> : <span className="ph"><Newspaper size={44} strokeWidth={1.3} aria-hidden="true" /></span>}
        <span className="tag">{n.category}</span>
      </div>
      <p className="small text-muted-2 mt-3 mb-0">{formatDate(n.date, lang)}</p>
      <h3 className="mt-1">{tc(n.title)}</h3>
    </>
  );
  if (n.link && isExternal(n.link)) return <a className="article-card" href={safeHref(n.link)} target="_blank" rel="noopener noreferrer">{inner}</a>;
  return <Link className="article-card" to={n.link || '/'}>{inner}</Link>;
}

export default function ArticlesBand() {
  const { t, tc } = useLanguage();
  const home = useSetting('home');
  const news = useCollection('news');
  const items = useMemo(() => [...news].sort(byDateDesc()).slice(0, 9), [news]);
  const sc = useScroller();
  if (!items.length) return null;
  return (
    <section aria-labelledby="articles-title">
      <div className="band-navy">
        <div className="container">
          <Reveal className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h2 id="articles-title" className="section-title mb-2">{tc(home.articlesTitle) || t('latestUpdates')}</h2>
              <p className="mb-0 fs-5">{tc(home.articlesSubtitle)}</p>
            </div>
            <Link to="/ecitizen/notifications" className="btn btn-light-outline">{t('viewAll')}</Link>
          </Reveal>
        </div>
      </div>
      <div className="container band-overlap position-relative">
        <Reveal>
          <div ref={sc.ref} className="scroll-row" tabIndex={0} role="region" aria-label={t('latestUpdates')}>
            {items.map((n) => <Card key={n.id} n={n} />)}
          </div>
        </Reveal>
        <div className="d-flex justify-content-end gap-2 mt-3">
          <button type="button" className="btn-square" onClick={sc.prev} disabled={sc.start} aria-label={t('previous')}><ChevronLeft size={20} aria-hidden="true" /></button>
          <button type="button" className="btn-square" onClick={sc.next} disabled={sc.end} aria-label={t('next')}><ChevronRight size={20} aria-hidden="true" /></button>
        </div>
      </div>
    </section>
  );
}
