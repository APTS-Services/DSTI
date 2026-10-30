import React, { useMemo, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { ArrowRight, CalendarDays, Images, Video } from 'lucide-react';
import { useCollection, useSetting } from '../context/ContentContext';
import { useLanguage } from '../i18n/LanguageContext';
import useSEO from '../hooks/useSEO';
import PageHero from '../components/common/PageHero';
import Reveal from '../components/common/Reveal';
import VideoCard from '../components/common/VideoCard';
import EventCard from '../components/common/EventCard';
import Empty from '../components/common/Empty';
import { byDateDesc } from '../utils/format';
import NotFound from './NotFound';
import GalleryTile from '../components/common/GalleryGrid';
import Lightbox from '../components/common/Lightbox';

const isPast = (e) => e.status === 'past' || (e.endDate || e.date) < new Date().toISOString().slice(0, 10);

function Hub() {
  const { t } = useLanguage();
  useSEO({ title: t('media') });
  return (
    <>
      <PageHero title={t('media')} crumbs={[{ label: t('media') }]} />
      <div className="container section-sm">
        <div className="row g-4">
          {[[Images, 'gallery', 'galleryDesc', '/media/gallery', 'lavender'], [Video, 'scienceStories', 'scienceStoriesShort', '/media/science-stories', 'sky'], [CalendarDays, 'events', 'eventsDesc', '/media/events', 'blush']].map(([Icon, k, d, to, tone], i) => (
            <Reveal key={k} className="col-md-6 col-lg-4" delay={i * 0.08}>
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

function Gallery() {
  const { t, tc } = useLanguage();
  const photos = useCollection('gallery');
  const home = useSetting('home');
  const [album, setAlbum] = useState('');
  const [open, setOpen] = useState(null);
  const albums = useMemo(() => [...new Set(photos.map((p) => p.album).filter(Boolean))], [photos]);
  const list = useMemo(() => [...photos].sort(byDateDesc()).filter((p) => !album || p.album === album), [photos, album]);
  const title = tc(home.galleryTitle) || t('gallery');
  useSEO({ title, description: t('galleryDesc') });
  return (
    <>
      <PageHero title={title} subtitle={t('galleryDesc')} crumbs={[{ label: t('media'), to: '/media' }, { label: title }]} />
      <div className="container section-sm">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-4" role="group" aria-label={t('filterBy')}>
          <button type="button" className={`chip ${!album ? 'active' : ''}`} aria-pressed={!album} onClick={() => setAlbum('')}>{t('allAlbums')} <span>{photos.length}</span></button>
          {albums.map((a) => (
            <button key={a} type="button" className={`chip ${album === a ? 'active' : ''}`} aria-pressed={album === a} onClick={() => setAlbum(a)}>
              {a} <span>{photos.filter((p) => p.album === a).length}</span>
            </button>
          ))}
        </div>
        {!list.length ? <Empty /> : (
          <div className="gallery-grid">
            {list.map((p, i) => <GalleryTile key={p.id} photo={p} feature={i === 0 && list.length > 4} onOpen={() => setOpen(i)} />)}
          </div>
        )}
        {tc(home.galleryTagline) && <p className="gallery-tagline">{tc(home.galleryTagline)}</p>}
      </div>
      {open !== null && <Lightbox items={list} index={open} onChange={setOpen} onClose={() => setOpen(null)} />}
    </>
  );
}

export default function MediaPages() {
  return (
    <Routes>
      <Route index element={<Hub />} />
      <Route path="science-stories" element={<Stories />} />
      <Route path="events" element={<Events />} />
      <Route path="gallery" element={<Gallery />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
