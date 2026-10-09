// src/components/districts/DistrictExplorer.jsx
// Interactive map of all 26 districts of Andhra Pradesh with an equivalent,
// fully accessible table view (WCAG) and a detail panel.
import React, { useMemo, useState } from 'react';
import { Building2, FlaskConical, Map, MapPin, Table2 } from 'lucide-react';
import { districts, getRegion, regions } from '../../data/districts';
import { useLanguage } from '../../i18n/LanguageContext';

export default function DistrictExplorer({ initialDistrict }) {
  const { t, tc } = useLanguage();
  const [view, setView] = useState('map');
  const [selected, setSelected] = useState(initialDistrict || districts[0].id);

  const district = useMemo(() => districts.find((d) => d.id === selected), [selected]);
  const region = district ? getRegion(district.region) : null;

  return (
    <div>
      {/* View toggle */}
      <div className="mb-5 inline-flex rounded-lg border border-neutral-200 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-800" role="tablist" aria-label="District view">
        <button
          type="button"
          role="tab"
          aria-selected={view === 'map'}
          onClick={() => setView('map')}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold ${view === 'map' ? 'bg-neutral-900 text-white' : 'text-neutral-700 dark:text-neutral-200'}`}
        >
          <Map size={15} aria-hidden="true" /> {t('mapView')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === 'table'}
          onClick={() => setView('table')}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold ${view === 'table' ? 'bg-neutral-900 text-white' : 'text-neutral-700 dark:text-neutral-200'}`}
        >
          <Table2 size={15} aria-hidden="true" /> {t('tableView')}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Map or table */}
        <div>
          {view === 'map' ? (
            <div className="rounded-xl border border-neutral-200 bg-gradient-to-b from-neutral-50 to-white p-3 dark:border-neutral-700 dark:from-neutral-900 dark:to-neutral-950">
              <svg viewBox="0 0 600 700" className="h-auto w-full" role="img" aria-label={t('districtExplorerDesc')}>
                {/* stylised Andhra Pradesh landmass */}
                <polygon
                  points="300,10 360,40 380,110 360,180 400,230 410,300 380,360 400,440 360,520 300,600 240,620 190,560 150,520 110,470 120,400 150,340 140,270 170,200 200,130 230,60"
                  fill="rgba(74,43,194,0.05)"
                  stroke="#d9d9d9"
                  strokeWidth="2"
                />
                {districts.map((d) => {
                  const r = getRegion(d.region);
                  const isActive = d.id === selected;
                  return (
                    <g key={d.id} className="cursor-pointer" onClick={() => setSelected(d.id)}>
                      <circle
                        cx={d.x}
                        cy={d.y}
                        r={isActive ? 18 : 12}
                        fill={r?.color || '#4a2bc2'}
                        stroke={isActive ? '#171717' : '#ffffff'}
                        strokeWidth={isActive ? 4 : 2}
                        className="transition-all"
                        opacity={isActive ? 1 : 0.85}
                      >
                        <title>{tc(d.name)}</title>
                      </circle>
                      <text
                        x={d.x}
                        y={d.y + 30}
                        textAnchor="middle"
                        className="fill-neutral-800 text-[13px] font-semibold dark:fill-neutral-100"
                        style={{ fontSize: '12px' }}
                      >
                        {tc(d.name).length > 14 ? `${tc(d.name).slice(0, 12)}…` : tc(d.name)}
                      </text>
                    </g>
                  );
                })}
              </svg>
              {/* legend */}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                {regions.map((r) => (
                  <span key={r.id} className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                    <span className="h-3 w-3 rounded-full" style={{ background: r.color }} />
                    {tc(r)}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-700">
              <table className="dst-table">
                <caption className="sr-only">{t('districtExplorer')}</caption>
                <thead>
                  <tr>
                    <th scope="col">{t('district')}</th>
                    <th scope="col">Region</th>
                    <th scope="col">HQ</th>
                    <th scope="col" className="text-center">{t('institutions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {districts.map((d) => (
                    <tr
                      key={d.id}
                      onClick={() => setSelected(d.id)}
                      className={`cursor-pointer ${d.id === selected ? 'bg-primary-50 dark:bg-neutral-800' : ''}`}
                    >
                      <td className="font-semibold text-neutral-900 dark:text-neutral-100">{tc(d.name)}</td>
                      <td>{tc(getRegion(d.region))}</td>
                      <td>{d.hq}</td>
                      <td className="text-center">{d.institutions.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="dst-card h-fit p-5" aria-live="polite">
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300">
            <MapPin size={14} aria-hidden="true" /> {t('selectDistrict')}
          </span>
          <h3 className="mt-1 text-xl font-extrabold text-neutral-900 dark:text-white">{tc(district.name)}</h3>
          <p className="mt-1 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-300">
            <span className="h-3 w-3 rounded-full" style={{ background: region?.color }} />
            {tc(region)} · HQ: {district.hq}
          </p>

          <h4 className="mt-5 flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100">
            <Building2 size={15} className="text-primary-600" aria-hidden="true" /> {t('institutions')}
          </h4>
          {district.institutions.length === 0 ? (
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-300">{t('noDistrictData')}</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {district.institutions.map((inst, i) => (
                <li key={i} className="flex items-start justify-between gap-3 rounded-lg bg-neutral-50 px-3 py-2 dark:bg-neutral-800">
                  <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{tc(inst.name)}</span>
                  <span className="flex-shrink-0 rounded bg-white px-2 py-0.5 text-[0.65rem] font-semibold uppercase text-primary-700 dark:bg-neutral-900 dark:text-primary-300">
                    {inst.type}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {district.activities.length > 0 && (
            <>
              <h4 className="mt-5 flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                <FlaskConical size={15} className="text-secondary-500" aria-hidden="true" /> {t('activities')}
              </h4>
              <ul className="mt-2 space-y-1.5">
                {district.activities.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-200">
                    <span className="text-secondary-500">•</span> {tc(a)}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
