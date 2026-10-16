// Interactive map of the 26 districts of Andhra Pradesh, with an equivalent
// accessible table view and a detail panel.
import React, { useMemo, useState } from 'react';
import { Building2, FlaskConical, Map as MapIcon, MapPin, Table2 } from 'lucide-react';
import { useCollection } from '../../context/ContentContext';
import { useLanguage } from '../../i18n/LanguageContext';

const OUTLINE = '300,10 360,40 380,110 360,180 400,230 410,300 380,360 400,440 360,520 300,600 240,620 190,560 150,520 110,470 120,400 150,340 140,270 170,200 200,130 230,60';

export default function DistrictExplorer({ initial, compact = false }) {
  const { t, tc } = useLanguage();
  const districts = useCollection('districts');
  const regions = useCollection('regions');
  const [view, setView] = useState('map');
  const [selected, setSelected] = useState(initial && districts.some((d) => d.id === initial) ? initial : districts[0]?.id);
  const regionOf = useMemo(() => Object.fromEntries(regions.map((r) => [r.id, r])), [regions]);
  const d = districts.find((x) => x.id === selected) || districts[0];
  if (!d) return null;
  const region = regionOf[d.region];

  return (
    <div>
      <div className="btn-group mb-3" role="group" aria-label={t('districtExplorer')}>
        <button type="button" className={`btn btn-sm ${view === 'map' ? 'btn-dark' : 'btn-outline-dark'}`} aria-pressed={view === 'map'} onClick={() => setView('map')}>
          <MapIcon size={15} aria-hidden="true" className="me-1" /> {t('mapView')}
        </button>
        <button type="button" className={`btn btn-sm ${view === 'table' ? 'btn-dark' : 'btn-outline-dark'}`} aria-pressed={view === 'table'} onClick={() => setView('table')}>
          <Table2 size={15} aria-hidden="true" className="me-1" /> {t('tableView')}
        </button>
      </div>
      <div className="row g-4">
        <div className={compact ? 'col-lg-7' : 'col-lg-7'}>
          {view === 'map' ? (
            <div className="district-map">
              <svg viewBox="80 0 360 640" role="group" aria-label={t('districtExplorerDesc')} style={{ width: '100%', height: 'auto', maxHeight: compact ? 460 : 620 }}>
                <polygon points={OUTLINE} fill="rgba(11,61,145,.06)" stroke="currentColor" strokeOpacity=".15" strokeWidth="2" />
                {districts.map((x) => {
                  const active = x.id === d.id;
                  const name = tc(x.name);
                  return (
                    <g key={x.id} className="node" role="button" tabIndex={0} aria-label={name} aria-pressed={active}
                      onClick={() => setSelected(x.id)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setSelected(x.id))}>
                      <circle cx={x.x} cy={x.y} r={active ? 14 : 9} fill={regionOf[x.region]?.color || '#0b3d91'} stroke={active ? '#111827' : '#fff'} strokeWidth={active ? 3 : 2} />
                      <text x={x.x} y={x.y + 24} textAnchor="middle">{name.length > 13 ? `${name.slice(0, 12)}…` : name}</text>
                    </g>
                  );
                })}
              </svg>
              <ul className="list-unstyled d-flex flex-wrap gap-3 small mb-0 mt-2 px-2">
                {regions.map((r) => <li key={r.id} className="d-flex align-items-center gap-1"><span className="legend-dot" style={{ background: r.color }} /> {tc(r.name)}</li>)}
              </ul>
            </div>
          ) : (
            <div className="table-wrap" style={{ maxHeight: compact ? 480 : 640 }}>
              <table className="table dst-table table-hover">
                <caption className="visually-hidden">{t('districtExplorer')}</caption>
                <thead><tr><th scope="col">{t('district')}</th><th scope="col">{t('region')}</th><th scope="col">{t('headquarters')}</th><th scope="col" className="text-center">{t('institutions')}</th></tr></thead>
                <tbody>
                  {districts.map((x) => (
                    <tr key={x.id} className={x.id === d.id ? 'table-active' : ''}>
                      <th scope="row"><button type="button" className="btn btn-link p-0 text-start" onClick={() => setSelected(x.id)}>{tc(x.name)}</button></th>
                      <td>{tc(regionOf[x.region]?.name)}</td>
                      <td>{x.hq}</td>
                      <td className="text-center">{(x.institutions || []).length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="col-lg-5">
          <div className="dst-card" aria-live="polite">
            <p className="section-eyebrow d-flex align-items-center gap-1 mb-1"><MapPin size={14} aria-hidden="true" /> {t('district')}</p>
            <h3 className="h3 fw-bold mb-1">{tc(d.name)}</h3>
            <p className="text-muted-2 small d-flex align-items-center gap-2"><span className="legend-dot" style={{ background: region?.color }} /> {tc(region?.name)} · {t('headquarters')}: {d.hq}</p>
            <h4 className="h6 fw-bold mt-4 d-flex align-items-center gap-2"><Building2 size={16} aria-hidden="true" /> {t('institutions')}</h4>
            {(d.institutions || []).length ? (
              <ul className="list-unstyled d-grid gap-2 mb-0">
                {d.institutions.map((inst, i) => (
                  <li key={i} className="d-flex justify-content-between gap-2 p-2 px-3 rounded-3 bg-soft">
                    <span className="small fw-medium">{tc(inst.name)}</span>
                    {inst.type && <span className="pill flex-shrink-0">{inst.type}</span>}
                  </li>
                ))}
              </ul>
            ) : <p className="small text-muted-2">{t('noDistrictData')}</p>}
            {(d.activities || []).length > 0 && (
              <>
                <h4 className="h6 fw-bold mt-4 d-flex align-items-center gap-2"><FlaskConical size={16} aria-hidden="true" /> {t('activities')}</h4>
                <ul className="small mb-0">{d.activities.map((a, i) => <li key={i}>{tc(a)}</li>)}</ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
