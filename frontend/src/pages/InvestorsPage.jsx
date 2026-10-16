import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Gift } from 'lucide-react';
import { useCollection, useSetting } from '../context/ContentContext';
import { useLanguage } from '../i18n/LanguageContext';
import useSEO from '../hooks/useSEO';
import PageHero from '../components/common/PageHero';
import Reveal from '../components/common/Reveal';

export default function InvestorsPage() {
  const { t, tc } = useLanguage();
  const inv = useSetting('investors');
  const incentives = useCollection('investorIncentives');
  const policies = useCollection('policies');
  useSEO({ title: t('investors'), description: tc(inv.intro) });
  return (
    <>
      <PageHero title={t('investors')} subtitle={tc(inv.intro)} crumbs={[{ label: t('investors') }]} />
      <section className="container section-sm">
        <div className="row g-5">
          <div className="col-lg-6">
            <h2 className="section-title h3 mb-4">{t('whyInvest')}</h2>
            <ul className="list-unstyled d-grid gap-3">{(inv.whyInvest || []).map((w, i) => <Reveal as="li" key={i} className="d-flex gap-3" delay={i * 0.05}><BadgeCheck className="text-primary flex-shrink-0" aria-hidden="true" /> <span className="fs-6">{tc(w)}</span></Reveal>)}</ul>
          </div>
          <div className="col-lg-6">
            <h2 className="section-title h3 mb-4">{t('howToInvest')}</h2>
            <ol className="timeline">{(inv.steps || []).map((s, i) => <Reveal as="li" key={i} delay={i * 0.05}>{tc(s)}</Reveal>)}</ol>
          </div>
        </div>
      </section>
      <section className="section-sm bg-soft">
        <div className="container">
          <h2 className="section-title h3 mb-4">{t('incentives')}</h2>
          <div className="row g-4">
            {incentives.map((x, i) => (
              <Reveal key={x.id} className="col-md-6 col-lg-4" delay={(i % 3) * 0.07}>
                <div className="dst-card"><span className="icon-chip mb-3"><Gift size={22} aria-hidden="true" /></span><h3 className="h5 fw-bold">{tc(x.title)}</h3><p className="small text-muted-2 mb-0">{tc(x.detail)}</p></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="container section-sm">
        <h2 className="section-title h3 mb-4">{t('sectorPolicies')}</h2>
        <div className="row g-3">
          {policies.map((p) => (
            <div className="col-sm-6 col-lg-4" key={p.id}>
              <Link to={`/policies/${p.id}`} className="dst-card hoverable p-3 d-flex justify-content-between align-items-center gap-2"><span><strong className="d-block">{tc(p.name)}</strong><small className="text-muted-2">{p.sector}</small></span><ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
