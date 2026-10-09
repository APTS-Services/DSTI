// src/components/common/SectionHeading.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function SectionHeading({ eyebrow, title, action, actionTo, className = '' }) {
  return (
    <div className={`mb-5 flex flex-wrap items-end justify-between gap-3 ${className}`}>
      <div>
        {eyebrow && <p className="dst-eyebrow">{eyebrow}</p>}
        <h2 className="dst-section-title">{title}</h2>
      </div>
      {action && actionTo && (
        <Link to={actionTo} className="text-sm font-semibold text-primary-700 hover:underline dark:text-primary-300">
          {action} →
        </Link>
      )}
    </div>
  );
}
