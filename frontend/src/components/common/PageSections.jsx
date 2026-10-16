// Renders a CMS "page" (title, subtitle, sections of paragraphs).
import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import Reveal from './Reveal';

const URL_RE = /(https?:\/\/[^\s]+)/g;

function Paragraph({ text }) {
  // Plain text only; bare URLs become safe external links.
  const parts = text.split(URL_RE);
  return (
    <p>
      {parts.map((p, i) => (i % 2 === 1
        ? <a key={i} href={p} target="_blank" rel="noopener noreferrer">{p}</a>
        : <React.Fragment key={i}>{p}</React.Fragment>))}
    </p>
  );
}

export default function PageSections({ page }) {
  const { tc } = useLanguage();
  return (
    <div className="prose">
      {(page?.sections || []).map((s, i) => (
        <Reveal as="section" key={i} className="mb-4">
          {tc(s.heading) && <h2 className="h4 fw-bold mb-3">{tc(s.heading)}</h2>}
          {(s.body || []).map((b, j) => <Paragraph key={j} text={tc(b)} />)}
        </Reveal>
      ))}
    </div>
  );
}
