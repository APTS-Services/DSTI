import React, { useMemo, useState } from 'react';
import { Link, Route, Routes, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, CalendarDays, CheckCircle2, ExternalLink, MapPin } from 'lucide-react';
import { useCollection } from '../context/ContentContext';
import { useLanguage } from '../i18n/LanguageContext';
import useSEO from '../hooks/useSEO';
import PageHero from '../components/common/PageHero';
import Reveal from '../components/common/Reveal';
import DistrictExplorer from '../components/common/DistrictExplorer';
import ConnectionsGraph from '../components/home/ConnectionsGraph';
import { safeHref } from '../utils/format';
import { assetUrl } from '../api/client';
import useSiteCounts from '../hooks/useSiteCounts';
import NotFound from './NotFound';

function List() {
  const { t, tc } = useLanguage();
  const orgs = useCollection('organisations');
  const [cat, setCat] = useState('');
  const cats = [...new Set(orgs.map((o) => o.category).filter(Boolean))];
  const shown = orgs.filter((o) => !cat || o.category === cat);
  useSEO({ title: t('organisations') });
  return (
    <>
      <PageHero title={t('organisations')} subtitle={t('organisationsDesc')} crumbs={[{ label: t('organisations') }]} />
      <div className="container section-sm">
        <div className="d-flex flex-wrap gap-2 mb-4" role="group" aria-label={t('filterBy')}>
          <button type="button" className={`btn btn-sm ${!cat ? 'btn-dark' : 'btn-outline-dark'}`} aria-pressed={!cat} onClick={() => setCat('')}>{t('all')}</button>
          {cats.map((c) => <button key={c} type="button" className={`btn btn-sm ${cat === c ? 'btn-dark' : 'btn-outline-dark'}`} aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}
        </div>
        <div className="row g-4">
          {shown.map((o, i) => (
            <Reveal key={o.id} className="col-md-6 col-lg-4" delay={(i % 3) * 0.07}>
              <Link to={`/organisations/${o.id}`} className="dst-card hoverable d-flex flex-column">
                <div className="d-flex align-items-center gap-3 mb-3">
                  {o.logo ? <img src={assetUrl(o.logo)} alt="" width="48" height="48" className="rounded-3 border" style={{ objectFit: 'contain' }} /> : <span className="icon-chip fw-bold small">{o.abbr.slice(0, 4)}</span>}
                  <div><span className="pill">{o.category}</span></div>
                </div>
                <h2 className="h5 fw-bold">{tc(o.name)}</h2>
                <p className="small text-muted-2 flex-grow-1">{tc(o.summary)}</p>
                <span className="fw-semibold small d-inline-flex align-items-center gap-1 text-primary">{t('viewDetails')} <ArrowRight size={14} aria-hidden="true" /></span>
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
  const orgs = useCollection('organisations');
  const policies = useCollection('policies');
  const districts = useCollection('districts');
  const o = orgs.find((x) => x.id === id);
  useSEO({ title: o ? tc(o.name) : t('pageNotFound'), description: o ? tc(o.summary) : '' });
  if (!o) return <NotFound />;
  const linked = policies.filter((p) => (p.relatedOrgs || []).includes(o.id));
  const district = districts.find((d) => d.id === o.district);
  return (
    <>
      <PageHero title={tc(o.name)} subtitle={tc(o.summary)} crumbs={[{ label: t('organisations'), to: '/organisations' }, { label: o.abbr }]} />
      <div className="container section-sm">
        <div className="row g-5">
          <div className="col-lg-8">
            <h2 className="h4 fw-bold mb-3">{t('keyFunctions')}</h2>
            <ul className="list-unstyled d-grid gap-2">
              {(o.functions || []).map((f, i) => <Reveal as="li" key={i} className="dst-card d-flex gap-3 p-3"><CheckCircle2 className="text-success flex-shrink-0" aria-hidden="true" /> {tc(f)}</Reveal>)}
            </ul>
            {linked.length > 0 && (
              <>
                <h2 className="h4 fw-bold mt-5 mb-3">{t('relatedPolicies')}</h2>
                <div className="row g-3">
                  {linked.map((p) => (
                    <div className="col-sm-6" key={p.id}>
                      <Link to={`/policies/${p.id}`} className="dst-card hoverable p-3"><strong className="d-block">{tc(p.name)}</strong><small className="text-muted-2">{p.sector}</small></Link>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <aside className="col-lg-4">
            <div className="dst-card">
              {o.logo && <img src={assetUrl(o.logo)} alt={o.abbr} className="img-fluid mb-3" style={{ maxHeight: 80 }} />}
              <dl className="mb-0 small">
                <dt>{t('abbreviation')}</dt><dd>{o.abbr}</dd>
                <dt>{t('category')}</dt><dd>{o.category}</dd>
                {o.established && <><dt className="d-flex align-items-center gap-1"><CalendarDays size={14} aria-hidden="true" /> {t('established')}</dt><dd>{o.established}</dd></>}
                {district && <><dt className="d-flex align-items-center gap-1"><MapPin size={14} aria-hidden="true" /> {t('district')}</dt><dd><Link to={`/districts?district=${district.id}`}>{tc(district.name)}</Link></dd></>}
              </dl>
              {o.website && <a href={safeHref(o.website)} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-100 mt-3 d-inline-flex align-items-center justify-content-center gap-2">{t('visitWebsite')} <ExternalLink size={14} aria-hidden="true" /><span className="visually-hidden">({t('opensNewWindow')})</span></a>}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

function Districts() {
  const { t } = useLanguage();
  const [params] = useSearchParams();
  const districts = useCollection('districts');
  const counts = useSiteCounts();
  const total = counts?.districts ?? districts.length;
  const description = t('districtExplorerDesc').replace('{n}', String(total));
  useSEO({ title: t('districtExplorer'), description });
  return (
    <>
      <PageHero title={t('districtExplorer')} subtitle={description} crumbs={[{ label: t('organisations'), to: '/organisations' }, { label: t('districtExplorer') }]} />
      <div className="container section-sm"><DistrictExplorer initial={params.get('district')} key={params.get('district') || 'all'} /></div>
    </>
  );
}

function Connect() {
  const { t, tc } = useLanguage();
  const policies = useCollection('policies');
  const orgs = useCollection('organisations');
  const bySector = useMemo(() => {
    const m = {};
    policies.forEach((p) => { (m[p.sector || '—'] = m[p.sector || '—'] || []).push(p); });
    return Object.entries(m);
  }, [policies]);
  useSEO({ title: t('howItConnects'), description: t('howItConnectsDesc') });
  return (
    <>
      <PageHero title={t('howItConnects')} subtitle={t('howItConnectsDesc')} crumbs={[{ label: t('organisations'), to: '/organisations' }, { label: t('howItConnects') }]} />
      <div className="container section-sm">
        <ConnectionsGraph />
        <h2 className="h4 fw-bold mt-5 mb-3">{t('sectorsAndPolicies')}</h2>
        <div className="table-wrap">
          <table className="table dst-table">
            <caption className="visually-hidden">{t('sectorsAndPolicies')}</caption>
            <thead><tr><th scope="col">{t('sector')}</th><th scope="col">{t('policies')}</th><th scope="col">{t('organisations')}</th></tr></thead>
            <tbody>
              {bySector.map(([sector, list]) => (
                <tr key={sector}>
                  <th scope="row">{sector}</th>
                  <td>{list.map((p) => <Link key={p.id} to={`/policies/${p.id}`} className="d-block">{tc(p.name)}</Link>)}</td>
                  <td>{[...new Set(list.flatMap((p) => p.relatedOrgs || []))].map((id) => orgs.find((o) => o.id === id)).filter(Boolean).map((o) => <Link key={o.id} to={`/organisations/${o.id}`} className="pill me-1 mb-1 text-decoration-none">{o.abbr}</Link>)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default function OrganisationPages({ page }) {
  if (page === 'districts') return <Districts />;
  if (page === 'connect') return <Connect />;
  return (
    <Routes>
      <Route index element={<List />} />
      <Route path=":id" element={<Detail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
