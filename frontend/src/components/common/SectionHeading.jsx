import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal';

export default function SectionHeading({ eyebrow, title, subtitle, action, actionTo, children, id }) {
  return (
    <Reveal className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4 mb-lg-5">
      <div className="me-auto" style={{ maxWidth: '52rem' }}>
        {eyebrow && <p className="section-eyebrow mb-2">{eyebrow}</p>}
        <h2 className="section-title mb-0" id={id}>{title}</h2>
        {subtitle && <p className="text-muted-2 mt-2 mb-0">{subtitle}</p>}
      </div>
      {children}
      {action && actionTo && (
        <Link to={actionTo} className="btn btn-outline-dark d-inline-flex align-items-center gap-2">
          {action} <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}
    </Reveal>
  );
}
