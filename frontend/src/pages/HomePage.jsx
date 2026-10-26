import React, { useMemo } from 'react';
import { useCollection, useSetting } from '../context/ContentContext';
import { useLanguage } from '../i18n/LanguageContext';
import useSEO from '../hooks/useSEO';
import HeroBanner from '../components/home/HeroBanner';
import NewsTicker from '../components/home/NewsTicker';
import FeatureCards from '../components/home/FeatureCards';
import WhatBringsYouHere from '../components/home/WhatBringsYouHere';
import StatsStrip from '../components/home/StatsStrip';
import ArticlesBand from '../components/home/ArticlesBand';
import AlmanacWidget from '../components/home/AlmanacWidget';
import IllustratedStory from '../components/home/IllustratedStory';
import ConnectionsGraph from '../components/home/ConnectionsGraph';
import DistrictExplorer from '../components/common/DistrictExplorer';
import SectionHeading from '../components/common/SectionHeading';
import Reveal from '../components/common/Reveal';
import VideoCard from '../components/common/VideoCard';
import EventCard from '../components/common/EventCard';
import useScroller from '../components/common/useScroller';
import useSiteCounts from '../hooks/useSiteCounts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { byDateDesc } from '../utils/format';

function StoriesRow() {
  const { t } = useLanguage();
  const stories = useCollection('scienceStories');
  const items = useMemo(() => [...stories].sort(byDateDesc()).slice(0, 8), [stories]);
  const sc = useScroller();
  if (!items.length) return null;
  return (
    <section className="section bg-soft" aria-labelledby="stories-title">
      <div className="container">
        <SectionHeading id="stories-title" eyebrow={t('media')} title={t('scienceStories')} subtitle={t('scienceStoriesShort')}>
          <div className="d-flex gap-2">
            <button type="button" className="btn-square" onClick={sc.prev} disabled={sc.start} aria-label={t('previous')}><ChevronLeft size={20} aria-hidden="true" /></button>
            <button type="button" className="btn-square" onClick={sc.next} disabled={sc.end} aria-label={t('next')}><ChevronRight size={20} aria-hidden="true" /></button>
          </div>
        </SectionHeading>
        <Reveal>
          <div ref={sc.ref} className="scroll-row" tabIndex={0} role="region" aria-label={t('scienceStories')}>
            {items.map((s) => <VideoCard key={s.id} story={s} />)}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function EventsRow() {
  const { t } = useLanguage();
  const events = useCollection('events');
  const items = useMemo(() => events.filter((e) => e.status !== 'past').sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3), [events]);
  if (!items.length) return null;
  return (
    <section className="section" aria-labelledby="events-title">
      <div className="container">
        <SectionHeading id="events-title" eyebrow={t('media')} title={t('upcomingEvents')} action={t('viewAll')} actionTo="/media/events" />
        <div className="row g-4">
          {items.map((e, i) => <Reveal key={e.id} className="col-md-6 col-lg-4" delay={i * 0.08}><EventCard e={e} /></Reveal>)}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { t, tc } = useLanguage();
  const home = useSetting('home');
  const site = useSetting('site');
  const districts = useCollection('districts');
  const counts = useSiteCounts();
  const districtTotal = counts?.districts ?? districts.length;
  useSEO({ description: tc(site.tagline), path: '/' });
  const show = (k) => home[k] !== false;

  return (
    <>
      <h1 className="visually-hidden">{tc(site.name)}</h1>
      <HeroBanner />
      {show('showTicker') && <NewsTicker />}
      {show('showServices') && <FeatureCards />}
      {show('showStats') && <StatsStrip />}
      {show('showAudiences') && <WhatBringsYouHere />}
      {show('showArticles') && <ArticlesBand />}
      {(show('showDistricts') || show('showAlmanac')) && (
        <section className="section" aria-labelledby="dist-title">
          <div className="container">
            <SectionHeading id="dist-title" eyebrow={t('districtExplorer')} title={t('districtExplorerTitle').replace('{n}', String(districtTotal))} subtitle={t('districtExplorerDesc').replace('{n}', String(districtTotal))} action={t('openExplorer')} actionTo="/districts" />
            <div className="row g-4">
              {show('showDistricts') && <Reveal className={show('showAlmanac') ? 'col-xl-8' : 'col-12'}><DistrictExplorer compact /></Reveal>}
              {show('showAlmanac') && <Reveal className={show('showDistricts') ? 'col-xl-4' : 'col-lg-6'} delay={0.1}><AlmanacWidget /></Reveal>}
            </div>
          </div>
        </section>
      )}
      {show('showStory') && <IllustratedStory />}
      {show('showConnections') && (
        <section className="section bg-soft" aria-labelledby="conn-title">
          <div className="container">
            <SectionHeading id="conn-title" eyebrow={t('ourWork')} title={t('howItConnects')} subtitle={t('howItConnectsDesc')} action={t('readMore')} actionTo="/how-it-connects" />
            <Reveal><ConnectionsGraph /></Reveal>
          </div>
        </section>
      )}
      {show('showStories') && <StoriesRow />}
      {show('showEvents') && <EventsRow />}
    </>
  );
}
