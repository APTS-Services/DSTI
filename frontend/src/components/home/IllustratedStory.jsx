// src/components/home/IllustratedStory.jsx
import React from 'react';
import { BookOpen, FlaskConical, Lightbulb, Rocket, Sprout } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

const CHAPTERS = [
  {
    icon: FlaskConical,
    color: 'from-primary-600 to-primary-800',
    title: { en: 'Research', te: 'పరిశోధన' },
    text: {
      en: 'Universities and research institutions across the State pursue science that solves real problems — from climate-resilient crops to new materials.',
      te: 'రాష్ట్రవ్యాప్తంగా విశ్వవిద్యాలయాలు, పరిశోధన సంస్థలు వాతావరణ-నిరోధక పంటల నుండి కొత్త పదార్థాల వరకు నిజమైన సమస్యలను పరిష్కరించే విజ్ఞానాన్ని అన్వేషిస్తాయి.',
    },
  },
  {
    icon: Lightbulb,
    color: 'from-secondary-500 to-secondary-700',
    title: { en: 'Innovation', te: 'ఆవిష్కరణ' },
    text: {
      en: 'Innovation hubs and incubators help ideas become products, with seed funding, mentoring and market access for start-ups.',
      te: 'ఇన్నోవేషన్ హబ్‌లు, ఇన్‌క్యుబేటర్లు ఆలోచనలను ఉత్పత్తులుగా మార్చడానికి సీడ్ నిధులు, మెంటరింగ్, మార్కెట్ ప్రాప్యత అందిస్తాయి.',
    },
  },
  {
    icon: Rocket,
    color: 'from-neutral-700 to-neutral-900',
    title: { en: 'Industry', te: 'పరిశ్రమ' },
    text: {
      en: 'Policies for electronics, semiconductors, space and data centres attract investment and create high-value jobs.',
      te: 'ఎలక్ట్రానిక్స్, సెమీకండక్టర్లు, అంతరిక్షం, డేటా సెంటర్ల విధానాలు పెట్టుబడులను ఆకర్షించి అధిక-విలువ ఉద్యోగాలు సృష్టిస్తాయి.',
    },
  },
  {
    icon: Sprout,
    color: 'from-primary-700 to-neutral-800',
    title: { en: 'Citizens', te: 'పౌరులు' },
    text: {
      en: 'e-Governance, science outreach and skill programmes make technology work for every citizen, in every district.',
      te: 'ఇ-గవర్నెన్స్, విజ్ఞాన ప్రచారం, నైపుణ్య కార్యక్రమాలు ప్రతి జిల్లాలో ప్రతి పౌరుడికి సాంకేతికతను ఉపయోగకరంగా మారుస్తాయి.',
    },
  },
];

export default function IllustratedStory() {
  const { t, tc } = useLanguage();
  return (
    <section className="bg-white py-12 dark:bg-neutral-950">
      <div className="dst-container">
        <div className="mb-8 text-center">
          <p className="dst-eyebrow">{t('ourWork')}</p>
          <h2 className="dst-section-title mx-auto max-w-3xl">{t('illustratedStory')}</h2>
        </div>
        <ol className="relative grid gap-6 md:grid-cols-4">
          {/* connector line on wide screens */}
          <div className="absolute left-0 right-0 top-10 hidden h-0.5 bg-gradient-to-r from-primary-200 via-secondary-200 to-neutral-200 md:block dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800" aria-hidden="true" />
          {CHAPTERS.map((c, i) => {
            const Icon = c.icon;
            return (
              <li key={i} className="relative">
                <div className="flex flex-col items-center text-center">
                  <span className={`z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${c.color} text-white shadow-lg`}>
                    <Icon size={34} aria-hidden="true" />
                  </span>
                  <span className="mt-3 rounded-full bg-neutral-100 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                    Chapter {i + 1}
                  </span>
                  <h3 className="mt-2 text-lg font-bold text-neutral-900 dark:text-white">{tc(c.title)}</h3>
                </div>
                <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-300">{tc(c.text)}</p>
              </li>
            );
          })}
        </ol>
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-neutral-500 dark:text-neutral-300">
          <BookOpen size={16} className="text-primary-600" aria-hidden="true" />
          <span>{t('quickAccess')}</span>
        </div>
      </div>
    </section>
  );
}
