// src/components/home/FeaturedVideos.jsx — Science Stories short-video section.
import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { scienceStories } from '../../data/scienceStories';
import { useLanguage } from '../../i18n/LanguageContext';
import SectionHeading from '../common/SectionHeading';

export default function FeaturedVideos() {
  const { t, tc } = useLanguage();
  const videos = scienceStories.slice(0, 3);

  return (
    <section className="bg-neutral-50 py-12 dark:bg-neutral-900">
      <div className="dst-container">
        <SectionHeading
          eyebrow={t('scienceStoriesShort')}
          title={t('scienceStories')}
          action={t('viewAll')}
          actionTo="/media/science-stories"
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {videos.map((v) => (
            <Link
              key={v.id}
              to="/media/science-stories"
              className="dst-card dst-card-hover group overflow-hidden"
            >
              <div className="relative aspect-video overflow-hidden bg-neutral-900">
                <img
                  src={`https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover opacity-90 transition-transform group-hover:scale-105"
                />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary-500/90 text-neutral-950">
                    <Play size={22} aria-hidden="true" />
                  </span>
                </span>
                <span className="absolute bottom-2 right-2 rounded bg-neutral-950/80 px-1.5 py-0.5 text-[0.7rem] font-semibold text-white">
                  {v.duration}
                </span>
              </div>
              <div className="p-4">
                <span className="text-[0.7rem] font-bold uppercase tracking-wide text-primary-600 dark:text-primary-300">{v.category}</span>
                <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">{tc(v.title)}</h3>
                <p className="mt-1.5 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-300">{tc(v.summary)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
