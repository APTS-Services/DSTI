// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../utils/useSEO';
import { useLanguage } from '../i18n/LanguageContext';
import HeroBanner from '../components/home/HeroBanner';
import NewsTicker from '../components/home/NewsTicker';
import WhatBringsYouHere from '../components/home/WhatBringsYouHere';
import QuickLinks from '../components/home/QuickLinks';
import StatsStrip from '../components/home/StatsStrip';
import AlmanacWidget from '../components/home/AlmanacWidget';
import IllustratedStory from '../components/home/IllustratedStory';
import ConnectionsGraph from '../components/home/ConnectionsGraph';
import FeaturedVideos from '../components/home/FeaturedVideos';
import UpcomingEvents from '../components/home/UpcomingEvents';
import DistrictExplorer from '../components/districts/DistrictExplorer';
import SectionHeading from '../components/common/SectionHeading';

export default function HomePage() {
  const { t } = useLanguage();
  useSEO({
    title: 'Home',
    description:
      'Official website of the Department of Science, Technology & Innovation (DSTI), Government of Andhra Pradesh.',
    path: '/',
  });

  return (
    <>
      <HeroBanner />
      <NewsTicker />
      <WhatBringsYouHere />
      <QuickLinks />
      <StatsStrip />

      {/* District Explorer preview */}
      <section className="bg-neutral-50 py-12 dark:bg-neutral-900">
        <div className="dst-container">
          <SectionHeading
            eyebrow={t('organisations')}
            title={t('districtExplorer')}
            action={t('viewAll')}
            actionTo="/districts"
          />
          <p className="-mt-2 mb-6 max-w-3xl text-sm text-neutral-600 dark:text-neutral-300">{t('districtExplorerDesc')}</p>
          <DistrictExplorer />
        </div>
      </section>

      <AlmanacWidget />
      <IllustratedStory />
      <ConnectionsGraph />
      <FeaturedVideos />
      <UpcomingEvents />

      {/* CTA band */}
      <section className="bg-gradient-to-r from-neutral-900 to-primary-700 py-10">
        <div className="dst-container flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div>
            <h2 className="text-xl font-bold text-white">{t('vigyanMitra')}</h2>
            <p className="mt-1 text-sm text-neutral-100">{t('vigyanMitraDesc')}</p>
          </div>
          <Link to="/contact" className="btn-secondary flex-shrink-0">
            {t('feedbackForm')}
          </Link>
        </div>
      </section>
    </>
  );
}
