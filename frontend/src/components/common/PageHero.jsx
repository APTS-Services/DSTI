// src/components/common/PageHero.jsx
import React from 'react';
import Breadcrumbs from './Breadcrumbs';

export default function PageHero({ title, subtitle, breadcrumbs = [], children }) {
  return (
    <section className="border-b border-neutral-200 bg-gradient-to-br from-neutral-900 via-neutral-800 to-primary-800 dark:border-neutral-800">
      <div className="dst-container py-8 md:py-10">
        <Breadcrumbs items={breadcrumbs} />
        <h1 className="mt-3 text-2xl font-extrabold text-white md:text-3xl lg:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-3xl text-sm text-neutral-100 md:text-base">{subtitle}</p>}
        {children && <div className="mt-5">{children}</div>}
      </div>
    </section>
  );
}
