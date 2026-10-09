// src/components/common/Prose.jsx
import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

/** Renders an array of bilingual paragraphs or a single bilingual string. */
export default function Prose({ content }) {
  const { tc } = useLanguage();
  if (!content) return null;
  const items = Array.isArray(content) ? content : [content];
  return (
    <div className="prose-dst">
      {items.map((p, i) => (
        <p key={i}>{tc(p)}</p>
      ))}
    </div>
  );
}
