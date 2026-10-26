import React from 'react';
import { Link, Route, Routes, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Download, Gift } from 'lucide-react';
import { useCollection } from '../context/ContentContext';
import { useLanguage } from '../i18n/LanguageContext';
import useSEO from '../hooks/useSEO';
import PageHero from '../components/common/PageHero';
import PageSections from '../components/common/PageSections';
import Reveal from '../components/common/Reveal';
import { assetUrl } from '../api/client';
import NotFound from './NotFound';

const TONES = ['lavender', 'sky', 'blush', 'mint'];

function List() {
  const { t, tc } = useLanguage();
  const policies = useCollection('policies');
  useSEO({ title: t('policies'), description: t('policiesDesc') });
  return (
    <>
      <PageHero title={t('policies')} subtitle={t('policiesDesc')} crumbs={[{ label: t('policies') }]} />
      <div className="container section-sm">
        <div className="row g-4">
          {policies.map((p, i) => (
            <Reveal key={p.id} className="col-md-6 col-lg-4" delay={(i % 3) * 0.07}>
              <Link to={`/policies/${p.id}`} className={`feature-card tone-${TONES[i % 4]}`}>
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div><span className="small fw-semibold text-uppercase opacity-75">{p.sector}</span><h2 className="h4 fw-bold mt-1 mb-0">{tc(p.name)}</h2></div>
                  <span className="arrow" aria-hidden="true"><ArrowRight size={20} /></span>
                </div>
                <p className="small">{tc(p.summary)}</p>
                <div className="d-flex gap-2 mt-auto">{p.year && <span className="pill">{p.year}</span>}{p.status && <span className="pill open">{p.status}</span>}</div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}

function Detail() {
  const { id } = useParams();
  const { t, tc } = useLanguage();
  const policies = useCollection('policies');
  const pages = useCollection('pages');
  const orgs = useCollection('organisations');
  const p = policies.find((x) => x.id === id);
  const statutory = !p && pages.find((x) => x.id === id);
  useSEO({ title: p ? tc(p.name) : statutory ? tc(statutory.title) : t('pageNotFound'), description: p ? tc(p.summary) : '' });

  if (statutory) {
    return (
      <>
        <PageHero title={tc(statutory.title)} subtitle={tc(statutory.subtitle)} crumbs={[{ label: t('statutoryPages'), to: '/sitemap' }, { label: tc(statutory.title) }]} />
        <div className="container section-sm" style={{ maxWidth: 900 }}><PageSections page={statutory} /></div>
      </>
    );
  }
  if (!p) return <NotFound />;
  const related = (p.relatedOrgs || []).map((oid) => orgs.find((o) => o.id === oid)).filter(Boolean);
  return (
    <>
      <PageHero title={tc(p.name)} subtitle={tc(p.summary)} crumbs={[{ label: t('policies'), to: '/policies' }, { label: tc(p.name) }]}>
        <div className="d-flex flex-wrap gap-2 mt-3">{p.sector && <span className="pill">{p.sector}</span>}{p.year && <span className="pill">{p.year}</span>}{p.status && <span className="pill open">{p.status}</span>}</div>
      </PageHero>
      <div className="container section-sm">
        <div className="row g-5">
          <div className="col-lg-8">
            <h2 className="h4 fw-bold mb-3">{t('objectives')}</h2>
            <ul className="list-unstyled d-grid gap-2 mb-5">{(p.objectives || []).map((o, i) => <Reveal as="li" key={i} className="dst-card p-3 d-flex gap-3"><CheckCircle2 className="text-success flex-shrink-0" aria-hidden="true" /> {tc(o)}</Reveal>)}</ul>
            <h2 className="h4 fw-bold mb-3">{t('incentives')}</h2>
            <ul className="list-unstyled d-grid gap-2">{(p.incentives || []).map((o, i) => <Reveal as="li" key={i} className="dst-card p-3 d-flex gap-3"><Gift className="text-danger flex-shrink-0" aria-hidden="true" /> {tc(o)}</Reveal>)}</ul>
          </div>
          <aside className="col-lg-4">
            <div className="dst-card">
              {p.file && <a href={assetUrl(p.file)} className="btn btn-primary w-100 mb-3 d-inline-flex align-items-center justify-content-center gap-2" target="_blank" rel="noopener"><Download size={16} aria-hidden="true" /> {t('downloadPolicy')}</a>}
              {related.length > 0 && (
                <>
                  <h2 className="h6 fw-bold">{t('implementingOrganisations')}</h2>
                  <ul className="list-unstyled d-grid gap-2 mb-0">{related.map((o) => <li key={o.id}><Link to={`/organisations/${o.id}`}><span className="pill me-2">{o.abbr}</span>{tc(o.name)}</Link></li>)}</ul>
                </>
              )}
              <hr />
              <Link to="/investors" className="d-inline-flex align-items-center gap-1 fw-semibold">{t('investors')} <ArrowRight size={14} aria-hidden="true" /></Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

export default function PolicyPages() {
  return (
    <Routes>
      <Route index element={<List />} />
      <Route path=":id" element={<Detail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
