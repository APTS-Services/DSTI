import React from 'react';

export default function Loading({ lines = 3 }) {
  return (
    <div className="container py-5" aria-busy="true" aria-live="polite">
      <span className="visually-hidden">Loading…</span>
      <div className="skeleton mb-3" style={{ height: 36, width: '45%' }} />
      {Array.from({ length: lines }).map((_, i) => <div key={i} className="skeleton mb-2" style={{ height: 16, width: `${90 - i * 12}%` }} />)}
    </div>
  );
}
