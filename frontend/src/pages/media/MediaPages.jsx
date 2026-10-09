// src/pages/media/MediaPages.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ExternalLink, MapPin, Play, Video } from 'lucide-react';
import useSEO from '../../utils/useSEO';
import { useLanguage } from '../../i18n/LanguageContext';
import PageHero from '../../components/common/PageHero';
import { scienceStories } from '../../data/scienceStories';
import { events } from '../../data/events';

const CRUMB_MEDIA = { label: 'Media', to: '/media' };

export function MediaPage() {
  const { t } = useLanguage();
  useSEO({ title: t('media'), path: '/media' });
  const cards = [
    { icon: Video, key: 'scienceStories', sub: t('scienceStoriesShort'), to: '/media/science-stories' },
    { icon: CalendarDays, key: 'events', sub: 'Workshops, conclaves and science fairs', to: '/media/events' },
  ];
  return (
    <>
      <PageHero title={t('media')} subtitle="Science stories and events from the Department." breadcrumbs={[{ label: t('media') }]} />
      <div className="dst-container py-10">
        <div className="grid gap-5 md:grid-cols-3">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <Link key={c.key} to={c.to} className="dst-card dst-card-hover p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-800 to-primary-700 text-white">
                  <Icon size={24} aria-hidden="true" />
                </span>
                <h2 className="mt-4 font-bold text-neutral-900 dark:text-neutral-100">{t(c.key)}</h2>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-300">{c.sub}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

export function ScienceStoriesPage() {
  const { t, tc } = useLanguage();
  useSEO({ title: t('scienceStories'), path: '/media/science-stories' });
  return (
    <>
      <PageHero title={t('scienceStories')} subtitle={t('scienceStoriesShort')} breadcrumbs={[CRUMB_MEDIA, { label: t('scienceStories') }]} />
      <div className="dst-container py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {scienceStories.map((v) => (
            <a
              key={v.id}
              href={`https://www.youtube.com/watch?v=${v.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="dst-card dst-card-hover group overflow-hidden"
            >
              <div className="relative aspect-video overflow-hidden bg-neutral-900">
                <img src={`https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-500/90 text-neutral-950">
                    <Play size={20} aria-hidden="true" />
                  </span>
                </span>
                <span className="absolute bottom-2 right-2 rounded bg-neutral-950/80 px-1.5 py-0.5 text-[0.7rem] font-semibold text-white">{v.duration}</span>
              </div>
              <div className="p-4">
                <span className="text-[0.7rem] font-bold uppercase tracking-wide text-primary-600 dark:text-primary-300">{v.category}</span>
                <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">{tc(v.title)}</h2>
                <p className="mt-1.5 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-300">{tc(v.summary)}</p>
                <span className="mt-2 flex items-center gap-1 text-xs font-semibold text-primary-700 dark:text-primary-300">
                  {t('watchVideo')} <ExternalLink size={12} aria-hidden="true" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}

export function EventsPage() {
  const { t, tc } = useLanguage();
  const [tab, setTab] = useState('upcoming');
  useSEO({ title: t('events'), path: '/media/events' });
  const list = events.filter((e) => e.status === tab);
  return (
    <>
      <PageHero title={t('events')} subtitle="Science fairs, conclaves, workshops and observances." breadcrumbs={[CRUMB_MEDIA, { label: t('events') }]} />
      <div className="dst-container py-10">
        <div className="mb-6 inline-flex rounded-lg border border-neutral-200 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-800" role="tablist">
          {['upcoming', 'past'].map((s) => (
            <button key={s} type="button" role="tab" aria-selected={tab === s} onClick={() => setTab(s)} className={`rounded-md px-4 py-2 text-sm font-semibold ${tab === s ? 'bg-neutral-900 text-white' : 'text-neutral-700 dark:text-neutral-200'}`}>
              {s === 'upcoming' ? t('upcomingEvents') : t('pastEvents')}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {list.map((e) => (
            <article key={e.id} className="dst-card flex flex-col gap-4 p-5 sm:flex-row">
              <div className="flex h-20 w-20 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-neutral-800 to-primary-700 text-white">
                <span className="text-2xl font-extrabold leading-none">{new Date(e.date).getDate()}</span>
                <span className="text-[0.7rem] uppercase leading-none">{new Date(e.date).toLocaleString('en', { month: 'short' })}</span>
                <span className="text-[0.65rem] leading-none">{new Date(e.date).getFullYear()}</span>
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold uppercase tracking-wide text-secondary-600 dark:text-secondary-300">{e.category}</span>
                <h2 className="mt-0.5 font-bold text-neutral-900 dark:text-neutral-100">{tc(e.title)}</h2>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{tc(e.summary)}</p>
                <p className="mt-2 flex flex-wrap items-center gap-4 text-xs text-neutral-500 dark:text-neutral-300">
                  <span className="flex items-center gap-1"><CalendarDays size={12} aria-hidden="true" /> {new Date(e.date).toLocaleDateString('en-IN')}{e.endDate ? ` – ${new Date(e.endDate).toLocaleDateString('en-IN')}` : ''}</span>
                  <span className="flex items-center gap-1"><MapPin size={12} aria-hidden="true" /> {tc(e.location)}</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}

