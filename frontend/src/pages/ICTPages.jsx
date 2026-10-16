import React from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { useCollection } from '../context/ContentContext';
import { useLanguage } from '../i18n/LanguageContext';
import useSEO from '../hooks/useSEO';
import PageHero from '../components/common/PageHero';
import Reveal from '../components/common/Reveal';
import Empty from '../components/common/Empty';
import NotFound from './NotFound';

function Tabs() {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  return (
    <ul className="nav nav-pills gap-2 mb-4">
      {[['eGovernance', '/ict'], ['projects', '/ict/projects']].map(([k, to]) => (
        <li className="nav-item" key={k}><Link to={to} className={`nav-link ${pathname === to ? 'active' : 'bg-soft text-body'}`} aria-current={pathname === to ? 'page' : undefined}>{t(k)}</Link></li>
      ))}
    </ul>
  );
}

function EGov() {
  const { t, tc } = useLanguage();
  const items = useCollection('egov');
  useSEO({ title: t('eGovernance') });
  return (
    <>
      <PageHero title={t('eGovernance')} subtitle={t('eGovDesc')} crumbs={[{ label: t('ict'), to: '/ict' }, { label: t('eGovernance') }]} />
      <div className="container section-sm">
        <Tabs />
        {!items.length ? <Empty /> : (
          <div className="row g-4">
            {items.map((e, i) => (
              <Reveal key={e.id} className="col-md-6" delay={(i % 2) * 0.08}>
                <div className="dst-card">
                  <div className="d-flex justify-content-between gap-2 mb-2"><h2 className="h5 fw-bold mb-0">{tc(e.name)}</h2>{e.status && <span className="pill open">{e.status}</span>}</div>
                  <p className="text-muted-2">{tc(e.summary)}</p>
                  <div className="d-flex flex-wrap gap-2">{(e.tags || []).map((tag) => <span key={tag} className="pill">{tag}</span>)}</div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function Projects() {
  const { t, tc } = useLanguage();
  const items = useCollection('projects');
  useSEO({ title: t('projects') });
  return (
    <>
      <PageHero title={t('projects')} subtitle={t('projectsDesc')} crumbs={[{ label: t('ict'), to: '/ict' }, { label: t('projects') }]} />
      <div className="container section-sm">
        <Tabs />
        {!items.length ? <Empty /> : (
          <div className="row g-4">
            {items.map((p, i) => (
              <Reveal key={p.id} className="col-md-6 col-lg-4" delay={(i % 3) * 0.07}>
                <div className="dst-card d-flex flex-column">
                  <span className="pill mb-2 align-self-start">{p.sector}</span>
                  <h2 className="h5 fw-bold">{tc(p.name)}</h2>
                  <p className="small text-muted-2 flex-grow-1">{tc(p.summary)}</p>
                  {p.progress != null && (
                    <>
                      <div className="d-flex justify-content-between small mb-1"><span>{p.status}</span><strong>{p.progress}%</strong></div>
                      <div className="progress" role="progressbar" aria-label={`${tc(p.name)} ${t('progress')}`} aria-valuenow={p.progress} aria-valuemin={0} aria-valuemax={100} style={{ height: 8 }}>
                        <div className="progress-bar" style={{ width: `${p.progress}%` }} />
                      </div>
                    </>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function ICTPages() {
  return (
    <Routes>
      <Route index element={<EGov />} />
      <Route path="projects" element={<Projects />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
