import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { assetUrl } from '../../api/client';

/** Name (or the designation until a name is entered in the CMS), designation and portfolio. */
export function leaderText(leader, tc) {
  const name = tc(leader.name);
  const designation = tc(leader.designation);
  const portfolio = tc(leader.portfolio);
  return { title: name || designation, subtitle: [name ? designation : '', portfolio].filter(Boolean).join(', ') };
}

export default function LeaderCard({ leader, variant = 'card' }) {
  const { tc } = useLanguage();
  const { title, subtitle } = leaderText(leader, tc);
  return (
    <figure className={`leader leader-${variant}`}>
      <div className="leader-photo">
        {leader.photo && <img src={assetUrl(leader.photo)} alt={title} loading="lazy" width="200" height="240" />}
      </div>
      <figcaption>
        <strong>{title}</strong>
        {subtitle && <span>{subtitle}</span>}
      </figcaption>
    </figure>
  );
}
