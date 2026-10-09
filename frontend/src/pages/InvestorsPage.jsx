// src/pages/InvestorsPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { BadgeIndianRupee, CheckCircle2, Handshake, TrendingUp } from 'lucide-react';
import useSEO from '../utils/useSEO';
import { useLanguage } from '../i18n/LanguageContext';
import PageHero from '../components/common/PageHero';
import Prose from '../components/common/Prose';
import SectionHeading from '../components/common/SectionHeading';
import { investmentSteps, investorIncentives, investorIntro, whyInvest } from '../data/investors';
import { policies } from '../data/policies';

export default function InvestorsPage() {
  const { t, tc } = useLanguage();
  useSEO({ title: t('investors'), description: 'Information and incentives for investors and industry.', path: '/investors' });
  const investPolicies = policies.filter((p) => ['Electronics', 'Semiconductors', 'Information Technology', 'Data Centres', 'Space Technology', 'Innovation'].includes(p.sector));

  return (
    <>
      <PageHero title={t('investors')} subtitle={tc(investorIntro)} breadcrumbs={[{ label: t('investors') }]} />

      <div className="dst-container py-10">
        {/* Why invest */}
        <SectionHeading title="Why Andhra Pradesh" />
        <ul className="grid gap-3 md:grid-cols-2">
          {whyInvest.map((w, i) => (
            <li key={i} className="flex items-start gap-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
              <CheckCircle2 size={19} className="mt-0.5 flex-shrink-0 text-primary-600" aria-hidden="true" />
              <span className="text-neutral-600 dark:text-neutral-200">{tc(w)}</span>
            </li>
          ))}
        </ul>

        {/* Incentives */}
        <div className="mt-12">
          <SectionHeading title="Incentives & Support" eyebrow="What you can claim" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {investorIncentives.map((inc, i) => (
              <div key={i} className="dst-card p-5">
                <BadgeIndianRupee size={22} className="text-secondary-500" aria-hidden="true" />
                <h3 className="mt-3 font-bold text-neutral-900 dark:text-neutral-100">{tc(inc.title)}</h3>
                <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-300">{tc(inc.detail)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="mt-12">
          <SectionHeading title="How to invest" eyebrow="Single-window process" />
          <ol className="grid gap-4 md:grid-cols-4">
            {investmentSteps.map((s, i) => (
              <li key={i} className="relative rounded-xl border border-neutral-200 p-5 dark:border-neutral-700">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-sm font-extrabold text-white">
                  {i + 1}
                </span>
                <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-200">{tc(s)}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Related policies */}
        <div className="mt-12">
          <SectionHeading title={t('policies')} action={t('viewAll')} actionTo="/policies" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {investPolicies.map((p) => (
              <Link key={p.id} to={`/policies/${p.id}`} className="dst-card dst-card-hover flex items-center gap-3 p-4">
                <TrendingUp size={18} className="flex-shrink-0 text-primary-600" aria-hidden="true" />
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{tc(p.name)}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-neutral-900 to-primary-700 p-6 text-center md:flex-row md:text-left">
          <div className="flex items-center gap-3">
            <Handshake size={30} className="flex-shrink-0 text-secondary-300" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-bold text-white">Talk to the investment facilitation team</h2>
              <p className="text-sm text-neutral-100">Single-window support for approvals, land and incentives.</p>
            </div>
          </div>
          <Link to="/contact" className="btn-secondary flex-shrink-0">{t('contact')}</Link>
        </div>
      </div>
    </>
  );
}
