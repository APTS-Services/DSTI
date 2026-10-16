import React, { useMemo, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { ArrowRight, CalendarDays, Video } from 'lucide-react';
import { useCollection } from '../context/ContentContext';
import { useLanguage } from '../i18n/LanguageContext';
import useSEO from '../hooks/useSEO';
import PageHero from '../components/common/PageHero';
import Reveal from '../components/common/Reveal';
import VideoCard from '../components/common/VideoCard';
import EventCard from '../components/common/EventCard';
import Empty from '../components/common/Empty';
import { byDateDesc } from '../utils/format';
import NotFound from './NotFound';

const isPast = (e) => e.status === 'past' || (e.endDate || e.date) < new Date().toISOString().slice(0, 10);

function Hub() {
  const { t } = useLanguage();
  useSEO({ title: t('media') });
  return (
    <>
      <PageHero title={t('media')} crumbs={[{ label: t('media') }]} />
      <div className="container section-sm">
        <div className="row g-4">
          {[[Video, 'scienceStories', 'scienceStoriesShort', '/media/science-stories', 'sky'], [CalendarDays, 'events', 'eventsDesc', '/media/events', 'blush']].map(([Icon, k, d, to, tone], i) => (
            <Reveal key={k} className="col-md-6" delay={i * 0.08}>
              <Link to={to} className={`feature-card tone-${tone}`}>
                <Icon size={38} className="icon" aria-hidden="true" />
                <div className="d-flex justify-content-between gap-3"><h2 className="h3">{t(k)}</h2><span className="arrow" aria-hidden="true"><ArrowRight size={22} /></span></div>
                <p>{t(d)}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}

function Stories() {
  const { t } = useLanguage();
  const stories = useCollection('scienceStories');
  const [cat, setCat] = useState('');
  const cats = [...new Set(stories.map((s) => s.category).filter(Boolean))];
  const list = useMemo(() => [...stories].sort(byDateDesc()).filter((s) => !cat || s.category === cat), [stories, cat]);
  useSEO({ title: t('scienceStories'), description: t('scienceStoriesShort') });
  return (
    <>
      <PageHero title={t('scienceStories')} subtitle={t('scienceStoriesShort')} crumbs={[{ label: t('media'), to: '/media' }, { label: t('scienceStories') }]} />
      <div className="container section-sm">
        <div className="d-flex flex-wrap gap-2 mb-4" role="group" aria-label={t('filterBy')}>
          <button type="button" className={`btn btn-sm ${!cat ? 'btn-dark' : 'btn-outline-dark'}`} aria-pressed={!cat} onClick={() => setCat('')}>{t('all')}</button>
          {cats.map((c) => <button key={c} type="button" className={`btn btn-sm ${cat === c ? 'btn-dark' : 'btn-outline-dark'}`} aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}
        </div>
        {!list.length ? <Empty /> : <div className="row g-4">{list.map((s, i) => <Reveal key={s.id} className="col-md-6 col-lg-4" delay={(i % 3) * 0.07}><VideoCard story={s} /></Reveal>)}</div>}
      </div>
    </>
  );
}

function Events() {
  const { t } = useLanguage();
  const events = useCollection('events');
  const [tab, setTab] = useState('upcoming');
  const list = useMemo(() => {
    const past = events.filter(isPast).sort(byDateDesc());
    const up = events.filter((e) => !isPast(e)).sort((a, b) => a.date.localeCompare(b.date));
    return tab === 'past' ? past : up;
  }, [events, tab]);
  useSEO({ title: t('events') });
  return (
    <>
      <PageHero title={t('events')} subtitle={t('eventsDesc')} crumbs={[{ label: t('media'), to: '/media' }, { label: t('events') }]} />
      <div className="container section-sm">
        <div className="btn-group mb-4" role="group">
          <button type="button" className={`btn ${tab === 'upcoming' ? 'btn-dark' : 'btn-outline-dark'}`} aria-pressed={tab === 'upcoming'} onClick={() => setTab('upcoming')}>{t('upcomingEvents')}</button>
          <button type="button" className={`btn ${tab === 'past' ? 'btn-dark' : 'btn-outline-dark'}`} aria-pressed={tab === 'past'} onClick={() => setTab('past')}>{t('pastEvents')}</button>
        </div>
        {!list.length ? <Empty /> : <div className="row g-4">{list.map((e, i) => <Reveal key={e.id} className="col-md-6 col-lg-4" delay={(i % 3) * 0.07}><EventCard e={e} /></Reveal>)}</div>}
      </div>
    </>
  );
}

export default function MediaPages() {
  return (
    <Routes>
      <Route index element={<Hub />} />
      <Route path="science-stories" element={<Stories />} />
      <Route path="events" element={<Events />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
