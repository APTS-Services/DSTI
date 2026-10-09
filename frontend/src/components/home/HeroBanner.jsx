// src/components/home/HeroBanner.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Atom, Cpu, Leaf, Rocket } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { site } from '../../data/site';

const SLIDES = [
  {
    icon: Rocket,
    accent: 'from-neutral-900 via-neutral-800 to-primary-800',
    key: { en: 'Building a space-tech and semiconductor future for Andhra Pradesh', te: 'ఆంధ్రప్రదేశ్ కోసం అంతరిక్ష-టెక్ మరియు సెమీకండక్టర్ భవిష్యత్తును నిర్మిస్తున్నాము' },
    cta: { label: { en: 'Explore Organisations', te: 'సంస్థలను అన్వేషించండి' }, to: '/organisations' },
  },
  {
    icon: Cpu,
    accent: 'from-neutral-900 via-primary-800 to-neutral-800',
    key: { en: 'e-Governance and emerging technologies for every citizen', te: 'ప్రతి పౌరుడికి ఇ-గవర్నెన్స్ మరియు ఉద్భవిస్తున్న సాంకేతికతలు' },
    cta: { label: { en: 'e-Citizen Services', te: 'ఇ-పౌర సేవలు' }, to: '/ecitizen' },
  },
  {
    icon: Atom,
    accent: 'from-primary-800 via-neutral-800 to-neutral-900',
    key: { en: 'Science for society — research, innovation and inclusive growth', te: 'సమాజం కోసం విజ్ఞానం — పరిశోధన, ఆవిష్కరణ, సమగ్ర వృద్ధి' },
    cta: { label: { en: 'Read the Policies', te: 'విధానాలు చదవండి' }, to: '/policies' },
  },
  {
    icon: Leaf,
    accent: 'from-neutral-800 via-primary-700 to-neutral-900',
    key: { en: 'Innovation, start-ups and industry partnerships across the State', te: 'రాష్ట్రవ్యాప్తంగా ఆవిష్కరణ, స్టార్టప్‌లు మరియు పరిశ్రమ భాగస్వామ్యాలు' },
    cta: { label: { en: "Investor's Corner", te: 'పెట్టుబడిదారుల విభాగం' }, to: '/investors' },
  },
];

export default function HeroBanner() {
  const { tc } = useLanguage();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6000);
    return () => clearInterval(id);
  }, []);

  const slide = SLIDES[index];
  const Icon = slide.icon;

  return (
    <section className={`relative overflow-hidden bg-gradient-to-br ${slide.accent}`} aria-label="Highlights">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
        aria-hidden="true"
      />
      <div className="dst-container relative grid items-center gap-8 py-14 md:grid-cols-[1.4fr_1fr] md:py-20">
        <div key={index} className="animate-fade-up">
          <p className="dst-eyebrow text-secondary-300">{tc(site.gov)}</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight text-white md:text-4xl lg:text-5xl">
            {tc(slide.key)}
          </h2>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link to={slide.cta.to} className="btn-secondary">
              {tc(slide.cta.label)} <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link to="/about" className="btn border border-white/40 text-white hover:bg-white/10">
              {tc(site.tagline)}
            </Link>
          </div>

          <div className="mt-8 flex gap-2" role="tablist" aria-label="Highlights">
            {SLIDES.map((s, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Highlight ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-secondary-400' : 'w-2.5 bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-center md:justify-end">
          <div className="flex h-48 w-48 items-center justify-center rounded-3xl border border-white/20 bg-white/10 backdrop-blur md:h-64 md:w-64">
            <Icon className="text-secondary-300" size={110} strokeWidth={1.2} aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
