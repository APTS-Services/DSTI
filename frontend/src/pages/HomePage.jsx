
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Building2,
  FlaskConical,
} from 'lucide-react';
import { byDateDesc } from '../utils/format';
import GalleryTile from '../components/common/GalleryGrid';
import Lightbox from '../components/common/Lightbox';

// ============================================
// SCIENCE STORIES
// ============================================

function StoriesRow() {
  const { t } = useLanguage();
  const stories = useCollection('scienceStories');
  const items = useMemo(
    () => [...stories].sort(byDateDesc()).slice(0, 8),
    [stories]
  );
  const sc = useScroller();

  if (!items.length) return null;

  return (
    <section className="section bg-soft" aria-labelledby="stories-title">
      <div className="container">
        <SectionHeading
          id="stories-title"
          eyebrow={t('media')}
          title={t('scienceStories')}
          subtitle={t('scienceStoriesShort')}
        >
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn-square"
              onClick={sc.prev}
              disabled={sc.start}
              aria-label={t('previous')}
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>

            <button
              type="button"
              className="btn-square"
              onClick={sc.next}
              disabled={sc.end}
              aria-label={t('next')}
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>
        </SectionHeading>

        <Reveal>
          <div
            ref={sc.ref}
            className="scroll-row"
            tabIndex={0}
            role="region"
            aria-label={t('scienceStories')}
          >
            {items.map((s) => (
              <VideoCard key={s.id} story={s} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================
// GALLERY
// ============================================

function GalleryRow() {
  const { t, tc } = useLanguage();
  const photos = useCollection('gallery');
  const home = useSetting('home');

  const items = useMemo(
    () => [...photos].sort(byDateDesc()).slice(0, 10),
    [photos]
  );

  const [open, setOpen] = useState(null);
  const sc = useScroller();

  if (!items.length) return null;

  return (
    <section className="section" aria-labelledby="gallery-title">
      <div className="container">
        <SectionHeading
          id="gallery-title"
          eyebrow={t('media')}
          title={tc(home.galleryTitle) || t('gallery')}
          subtitle={t('galleryDesc')}
        >
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn-square"
              onClick={sc.prev}
              disabled={sc.start}
              aria-label={t('previous')}
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>

            <button
              type="button"
              className="btn-square"
              onClick={sc.next}
              disabled={sc.end}
              aria-label={t('next')}
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>
        </SectionHeading>

        <Reveal>
          <div
            ref={sc.ref}
            className="scroll-row gallery-row"
            tabIndex={0}
            role="region"
            aria-label={t('gallery')}
          >
            {items.map((p, i) => (
              <GalleryTile
                key={p.id}
                photo={p}
                onOpen={() => setOpen(i)}
              />
            ))}
          </div>
        </Reveal>

        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-4">
          {tc(home.galleryTagline) ? (
            <p className="gallery-tagline small-tagline mb-0">
              {tc(home.galleryTagline)}
            </p>
          ) : (
            <span />
          )}

          <Link
            to="/media/gallery"
            className="btn btn-outline-dark d-inline-flex align-items-center gap-2"
          >
            {t('viewGallery')}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>

      {open !== null && (
        <Lightbox
          items={items}
          index={open}
          onChange={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}

// ============================================
// UPCOMING EVENTS
// ============================================

function EventsRow() {
  const { t } = useLanguage();
  const events = useCollection('events');

  const items = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    return events
      .filter(
        (e) =>
          e.status !== 'past' &&
          (e.endDate || e.date) >= today
      )
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);
  }, [events]);

  if (!items.length) return null;

  return (
    <section className="section" aria-labelledby="events-title">
      <div className="container">
        <SectionHeading
          id="events-title"
          eyebrow={t('media')}
          title={t('upcomingEvents')}
          action={t('viewAll')}
          actionTo="/media/events"
        />

        <div className="row g-4">
          {items.map((e, i) => (
            <Reveal
              key={e.id}
              className="col-md-6 col-lg-4"
              delay={i * 0.08}
            >
              <EventCard e={e} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// SELECTED DISTRICT DETAILS
// ============================================

function SelectedDistrictDetails({
  district,
  regions,
  onClearSelection,
}) {
  const { t, tc } = useLanguage();

  if (!district) return null;

  const region = regions.find(
    (item) => item.id === district.region
  );

  const institutions = district.institutions || [];
  const activities = district.activities || [];

  return (
    <div
      className="dst-card district-selected-details"
      aria-live="polite"
    >
      <p className="section-eyebrow d-flex align-items-center gap-2 mb-2">
        <MapPin size={15} aria-hidden="true" />
        {t('district')}
      </p>

      <h3 className="h4 fw-bold mb-2">
        {tc(district.name)}
      </h3>

      <p className="text-muted-2 small mb-3">
        {region ? tc(region.name) : ''}
        {district.hq
          ? ` · ${t('headquarters')}: ${district.hq}`
          : ''}
      </p>

      {/* INSTITUTIONS */}

      <div className="border-top pt-3">
        <h4 className="h6 fw-bold d-flex align-items-center gap-2 mb-3">
          <Building2 size={17} aria-hidden="true" />
          {t('institutions')}

          <span className="badge bg-light text-dark ms-auto">
            {institutions.length}
          </span>
        </h4>

        {institutions.length > 0 ? (
          <ul className="list-unstyled d-grid gap-2 mb-0">
            {institutions.map((inst, index) => (
              <li
                key={index}
                className="p-2 px-3 rounded-3 bg-soft"
              >
                <div className="small fw-semibold">
                  {tc(inst.name)}
                </div>

                {inst.type && (
                  <span className="small text-muted-2">
                    {inst.type}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="small text-muted-2">
            {t('noDistrictData')}
          </p>
        )}
      </div>

      {/* ACTIVITIES */}

      {activities.length > 0 && (
        <div className="border-top pt-3 mt-3">
          <h4 className="h6 fw-bold d-flex align-items-center gap-2 mb-3">
            <FlaskConical size={17} aria-hidden="true" />
            {t('activities')}
          </h4>

          <ul className="small mb-0 ps-3">
            {activities.map((activity, index) => (
              <li key={index} className="mb-2">
                {tc(activity)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* BACK TO SCIENCE ALMANAC */}

      <button
        type="button"
        className="btn btn-sm btn-outline-secondary mt-3"
        onClick={onClearSelection}
      >
        Show Science Almanac
      </button>
    </div>
  );
}

// ============================================
// HOME PAGE
// ============================================

export default function HomePage() {
  const { t, tc } = useLanguage();

  const home = useSetting('home');
  const site = useSetting('site');

  const districts = useCollection('districts');
  const regions = useCollection('regions');

  const counts = useSiteCounts();

  // Selected district state
  const [selectedDistrictId, setSelectedDistrictId] =
    useState(null);

  const districtTotal =
    counts?.districts ?? districts.length;

  const selectedDistrict = districts.find(
    (district) => district.id === selectedDistrictId
  );

  useSEO({
    description: tc(site.tagline),
    path: '/',
  });

  const show = (key) => home[key] !== false;

  return (
    <>
      <h1 className="visually-hidden">
        {tc(site.name)}
      </h1>

      <HeroBanner />

      {show('showTicker') && <NewsTicker />}
      {show('showServices') && <FeatureCards />}
      {show('showStats') && <StatsStrip />}
      {show('showArticles') && <ArticlesBand />}
      {show('showAudiences') && <WhatBringsYouHere />}
      {show('showGallery') && <GalleryRow />}

      {/* ========================================
          DISTRICT EXPLORER AND SCIENCE ALMANAC
         ======================================== */}

      {(show('showDistricts') || show('showAlmanac')) && (
        <section
          className="section district-home-section"
          aria-labelledby="dist-title"
        >
          <div className="container">

            <SectionHeading
              id="dist-title"
              eyebrow={t('districtExplorer')}
              title={t('districtExplorerTitle').replace(
                '{n}',
                String(districtTotal)
              )}
              subtitle={t('districtExplorerDesc').replace(
                '{n}',
                String(districtTotal)
              )}
              action={t('openExplorer')}
              actionTo="/districts"
            />

            {/* MAP AND RIGHT PANEL */}

            <div className="row g-4 align-items-start">

              {/* LEFT SIDE: DISTRICT MAP */}

              {show('showDistricts') && (
                <Reveal
                  className={
                    show('showAlmanac')
                      ? 'col-xl-8 district-map-column'
                      : 'col-12 district-map-column'
                  }
                >
                  <DistrictExplorer
                    compact
                    showSummary={false}
                    onDistrictSelect={setSelectedDistrictId}
                  />
                </Reveal>
              )}

              {/* RIGHT SIDE: ALMANAC OR SELECTED DISTRICT */}

              {show('showAlmanac') && (
                <Reveal
                  className={
                    show('showDistricts')
                      ? 'col-xl-4 district-side-column'
                      : 'col-lg-6'
                  }
                  delay={0.1}
                >
                  <div
                    style={{
                      marginTop: show('showDistricts')
                        ? '42px'
                        : '0',
                    }}
                  >
                    {selectedDistrict ? (
                      <SelectedDistrictDetails
                        district={selectedDistrict}
                        regions={regions}
                        onClearSelection={() =>
                          setSelectedDistrictId(null)
                        }
                      />
                    ) : (
                      <AlmanacWidget />
                    )}
                  </div>
                </Reveal>
              )}

            </div>
          </div>
        </section>
      )}

      {/* OTHER HOMEPAGE SECTIONS */}

      {show('showStory') && <IllustratedStory />}

      {show('showConnections') && (
        <section
          className="section bg-soft"
          aria-labelledby="conn-title"
        >
          <div className="container">
            <SectionHeading
              id="conn-title"
              eyebrow={t('ourWork')}
              title={t('howItConnects')}
              subtitle={t('howItConnectsDesc')}
              action={t('readMore')}
              actionTo="/how-it-connects"
            />

            <Reveal>
              <ConnectionsGraph />
            </Reveal>
          </div>
        </section>
      )}

      {show('showStories') && <StoriesRow />}
      {show('showEvents') && <EventsRow />}
    </>
  );
}
