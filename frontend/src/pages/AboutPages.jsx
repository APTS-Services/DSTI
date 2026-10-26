import React, { useMemo } from 'react';
import { Link, Route, Routes, useLocation, useSearchParams } from 'react-router-dom';
import { Award, CheckCircle2, Target } from 'lucide-react';
import { useCollection, useSetting } from '../context/ContentContext';
import { useLanguage } from '../i18n/LanguageContext';
import useSEO from '../hooks/useSEO';
import PageHero from '../components/common/PageHero';
import Reveal from '../components/common/Reveal';
import Empty from '../components/common/Empty';
import NotFound from './NotFound';
import { assetUrl } from '../api/client';

const TABS = [['intro', '/about'], ['mission', '/about/mission'], ['objectives', '/about/objectives'], ['organisationStructure', '/about/organisation'], ['awards', '/about/awards']];

function SubNav() {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  return (
    <nav aria-label={t('about')} className="mb-4">
      <ul className="nav nav-pills gap-2 flex-wrap">
        {TABS.map(([k, to]) => (
          <li className="nav-item" key={k}><Link to={to} className={`nav-link ${pathname === to ? 'active' : 'bg-soft text-body'}`} aria-current={pathname === to ? 'page' : undefined}>{t(k)}</Link></li>
        ))}
      </ul>
    </nav>
  );
}

function Shell({ titleKey, children }) {
  const { t } = useLanguage();
  useSEO({ title: t(titleKey) });
  return (
    <>
      <PageHero title={t(titleKey)} crumbs={[{ label: t('about'), to: '/about' }, ...(titleKey === 'about' ? [] : [{ label: t(titleKey) }])]} />
      <div className="container section-sm"><SubNav />{children}</div>
    </>
  );
}

function Intro() {
  const { t, tc } = useLanguage();
  const about = useSetting('about');
  const orgs = useCollection('organisations');
  return (
    <Shell titleKey="about">
      <div className="row g-5">
        <div className="col-lg-8 prose">{(about.intro || []).map((p, i) => <Reveal as="p" key={i} className="fs-5">{tc(p)}</Reveal>)}</div>
        <div className="col-lg-4">
          <Reveal className="dst-card">
            <h2 className="h6 fw-bold">{t('organisations')}</h2>
            <ul className="list-unstyled d-grid gap-2 mb-0">
              {orgs.map((o) => <li key={o.id}><Link to={`/organisations/${o.id}`}><span className="pill me-2">{o.abbr}</span>{tc(o.name)}</Link></li>)}
            </ul>
          </Reveal>
        </div>
      </div>
    </Shell>
  );
}

function Mission() {
  const { tc } = useLanguage();
  const about = useSetting('about');
  return (
    <Shell titleKey="mission">
      <Reveal className="feature-card tone-sky p-4 p-lg-5" style={{ maxWidth: 900 }}>
        <Target size={40} className="icon" aria-hidden="true" />
        <p className="fs-4 fw-medium lh-base mb-0">{tc(about.mission)}</p>
      </Reveal>
    </Shell>
  );
}

function Objectives() {
  const { tc } = useLanguage();
  const about = useSetting('about');
  return (
    <Shell titleKey="objectives">
      <div className="row g-3">
        {(about.objectives || []).map((o, i) => (
          <Reveal key={i} className="col-md-6" delay={(i % 2) * 0.08}>
            <div className="dst-card d-flex gap-3"><CheckCircle2 className="text-success flex-shrink-0" aria-hidden="true" /> <span>{tc(o)}</span></div>
          </Reveal>
        ))}
      </div>
    </Shell>
  );
}

function Structure() {
  const { t, tc } = useLanguage();
  const about = useSetting('about');
  const orgs = useCollection('organisations');
  return (
    <Shell titleKey="organisationStructure">
      <p className="fs-5 prose" style={{ maxWidth: 900 }}>{tc(about.orgStructure)}</p>
      {about.orgChart && <img src={assetUrl(about.orgChart)} alt={t('organisationStructure')} className="img-fluid rounded-4 border my-4" />}
      <Reveal className="text-center my-4">
        <div className="d-inline-block bg-primary text-white rounded-4 px-4 py-3 fw-semibold">{t('siteName')}</div>
        <div className="mx-auto bg-secondary opacity-25" style={{ width: 2, height: 28 }} />
      </Reveal>
      <div className="row g-3">
        {orgs.map((o, i) => (
          <Reveal key={o.id} className="col-sm-6 col-lg-3" delay={(i % 4) * 0.06}>
            <Link to={`/organisations/${o.id}`} className="dst-card hoverable text-center">
              <span className="pill mb-2">{o.abbr}</span>
              <p className="small fw-semibold mb-0">{tc(o.name)}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </Shell>
  );
}

function Awards() {
  const { t, tc } = useLanguage();
  const years = useCollection('awards');
  const sorted = useMemo(() => [...years].sort((a, b) => b.year - a.year), [years]);
  const [params, setParams] = useSearchParams();
  const year = Number(params.get('year')) || sorted[0]?.year;
  const current = sorted.find((y) => y.year === year) || sorted[0];
  return (
    <Shell titleKey="awards">
      {!current ? <Empty /> : (
        <>
          <div className="d-flex flex-wrap gap-2 mb-4" role="group" aria-label={t('year')}>
            {sorted.map((y) => (
              <button key={y.id} type="button" className={`btn ${y.year === current.year ? 'btn-dark' : 'btn-outline-dark'}`} aria-pressed={y.year === current.year} onClick={() => setParams({ year: String(y.year) })}>{y.year}</button>
            ))}
          </div>
          <h2 className="h3 fw-bold mb-4">{tc(current.title) || `${t('awards')} ${current.year}`}</h2>
          <div className="row g-4">
            {(current.awards || []).map((a, i) => (
              <Reveal key={i} className="col-md-6 col-lg-4" delay={i * 0.08}>
                <div className="feature-card tone-blush">
                  <Award size={36} className="icon" aria-hidden="true" />
                  <h3 className="h5">{tc(a.name)}</h3>
                  <p className="mb-0"><strong>{a.recipient}</strong>{a.field && <span className="d-block small">{a.field}</span>}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </>
      )}
    </Shell>
  );
}

export default function AboutPages() {
  return (
    <Routes>
      <Route index element={<Intro />} />
      <Route path="mission" element={<Mission />} />
      <Route path="objectives" element={<Objectives />} />
      <Route path="organisation" element={<Structure />} />
      <Route path="awards" element={<Awards />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
