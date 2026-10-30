import React from 'react';
import { Expand } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { assetUrl } from '../../api/client';

/** Photo tiles; the first one of a page can be shown large ("feature"). */
export default function GalleryTile({ photo, onOpen, feature = false }) {
  const { t, tc } = useLanguage();
  const title = tc(photo.title);
  return (
    <button type="button" className={`gallery-tile ${feature ? 'feature' : ''}`} onClick={onOpen} aria-label={`${t('openPhoto')}: ${title}`}>
      <img src={assetUrl(photo.image)} alt="" loading="lazy" />
      <span className="shade" aria-hidden="true" />
      <span className="meta">
        {photo.album && <span className="album">{photo.album}</span>}
        <strong>{title}</strong>
      </span>
      <span className="zoom" aria-hidden="true"><Expand size={16} /></span>
    </button>
  );
}
