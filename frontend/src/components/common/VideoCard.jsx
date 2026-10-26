// Click-to-load video: nothing third-party loads until the visitor presses play.
import React, { useState } from 'react';
import { Play, Video } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { assetUrl } from '../../api/client';

export default function VideoCard({ story }) {
  const { t, tc } = useLanguage();
  const [playing, setPlaying] = useState(false);
  const title = tc(story.title);
  const hasVideo = story.videoId || story.video;
  return (
    <article className="dst-card p-0 overflow-hidden">
      <div className="video-frame rounded-0">
        {playing && story.videoId && (
          <iframe src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(story.videoId)}?autoplay=1&rel=0`} title={title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
        )}
        {playing && !story.videoId && story.video && <video src={assetUrl(story.video)} controls autoPlay poster={assetUrl(story.thumbnail) || undefined}><track kind="captions" /></video>}}
        {!playing && (
          <>
            {story.thumbnail && <img src={assetUrl(story.thumbnail)} alt="" loading="lazy" />}
            {hasVideo ? (
              <button type="button" className="play" onClick={() => setPlaying(true)} aria-label={`${t('watchVideo')}: ${title}`}>
                <span><Play size={26} aria-hidden="true" /></span>
              </button>
            ) : (
              <span className="play" aria-hidden="true"><Video size={40} strokeWidth={1.3} /></span>
            )}
            {story.duration && <span className="position-absolute bottom-0 end-0 m-2 badge text-bg-dark">{story.duration}</span>}
          </>
        )}
      </div>
      <div className="p-3 p-lg-4">
        {story.category && <span className="pill mb-2">{story.category}</span>}
        <h3 className="h6 fw-bold mb-1">{title}</h3>
        <p className="small text-muted-2 mb-0">{tc(story.summary)}</p>
        {!hasVideo && <p className="small text-muted-2 mt-2 mb-0 fst-italic">{t('videoComingSoon')}</p>}
      </div>
    </article>
  );
}
