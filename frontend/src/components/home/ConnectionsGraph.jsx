// Interactive view of how organisations, policies and sectors link together.
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Network } from 'lucide-react';
import { useCollection } from '../../context/ContentContext';
import { useLanguage } from '../../i18n/LanguageContext';

export default function ConnectionsGraph() {
  const { t, tc } = useLanguage();
  const orgs = useCollection('organisations');
  const policies = useCollection('policies');
  const [active, setActive] = useState(orgs[0]?.id);
  const org = orgs.find((o) => o.id === active) || orgs[0];
  const linked = useMemo(() => policies.filter((p) => (p.relatedOrgs || []).includes(org?.id)), [policies, org]);
  const sectors = [...new Set(linked.map((p) => p.sector).filter(Boolean))];
  if (!org) return null;

  return (
    <div className="row g-4">
      <div className="col-lg-5">
        <div className="dst-card p-3">
          <p className="section-eyebrow px-2 mb-2">{t('organisations')}</p>
          <div className="d-grid gap-1">
            {orgs.map((o) => (
              <button key={o.id} type="button" aria-pressed={o.id === org.id} onClick={() => setActive(o.id)}
                className={`btn text-start d-flex align-items-center gap-3 ${o.id === org.id ? 'btn-primary' : 'btn-link text-body text-decoration-none'}`}>
                <span className={`badge ${o.id === org.id ? 'text-bg-light' : 'bg-soft text-body'}`} style={{ minWidth: 64 }}>{o.abbr}</span>
                <span className="small fw-medium">{tc(o.name)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="col-lg-7">
        <div className="dst-card p-4" aria-live="polite">
          <h3 className="h4 fw-bold d-flex align-items-center gap-2"><Network size={20} className="text-danger" aria-hidden="true" /> {tc(org.name)}</h3>
          <p className="text-muted-2">{tc(org.summary)}</p>
          <p className="section-eyebrow mt-4 mb-2">{t('policies')} ({linked.length})</p>
          {linked.length ? (
            <div className="row g-2">
              {linked.map((p) => (
                <div className="col-sm-6" key={p.id}>
                  <Link to={`/policies/${p.id}`} className="d-block p-3 rounded-3 border text-decoration-none text-body h-100">
                    <span className="fw-semibold d-block">{tc(p.name)}</span>
                    <small className="text-muted-2">{p.sector}</small>
                  </Link>
                </div>
              ))}
            </div>
          ) : <p className="text-muted-2">{t('noRecords')}</p>}
          {sectors.length > 0 && (
            <>
              <p className="section-eyebrow mt-4 mb-2">{t('sectors')}</p>
              <div className="d-flex flex-wrap gap-2">{sectors.map((s) => <span key={s} className="pill">{s}</span>)}</div>
            </>
          )}
          <Link to={`/organisations/${org.id}`} className="btn btn-dark mt-4 d-inline-flex align-items-center gap-2">{t('viewDetails')} <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </div>
    </div>
  );
}
