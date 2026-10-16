// Searchable, filterable, date-sortable document list with PDF download.
import React, { useMemo, useState } from 'react';
import { Download, FileText, Search } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatDate } from '../../utils/format';
import Empty from './Empty';

const TYPE_KEYS = { go: 'governmentOrders', notification: 'notifications', circular: 'circulars', act: 'acts', rule: 'rules', guideline: 'guidelines' };

export default function DocumentTable({ documents, showTypeFilter = false, caption }) {
  const { t, tc, lang } = useLanguage();
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('desc');
  const [year, setYear] = useState('');
  const types = [...new Set(documents.map((d) => d.type))];
  const years = [...new Set(documents.map((d) => (d.date || '').slice(0, 4)).filter(Boolean))].sort().reverse();

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return documents
      .filter((d) => !type || d.type === type)
      .filter((d) => !year || (d.date || '').startsWith(year))
      .filter((d) => !term || `${d.number} ${d.title?.en} ${d.title?.te} ${d.department}`.toLowerCase().includes(term))
      .sort((a, b) => (sort === 'desc' ? -1 : 1) * String(a.date).localeCompare(String(b.date)));
  }, [documents, q, type, sort, year]);

  return (
    <div>
      <div className="row g-2 mb-3" role="search">
        <div className="col-md">
          <label className="visually-hidden" htmlFor="doc-q">{t('search')}</label>
          <div className="input-group">
            <span className="input-group-text bg-surface"><Search size={16} aria-hidden="true" /></span>
            <input id="doc-q" type="search" className="form-control" placeholder={t('searchDocuments')} value={q} onChange={(e) => setQ(e.target.value)} maxLength={100} />
          </div>
        </div>
        {showTypeFilter && types.length > 1 && (
          <div className="col-6 col-md-auto">
            <label className="visually-hidden" htmlFor="doc-type">{t('category')}</label>
            <select id="doc-type" className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">{t('allTypes')}</option>
              {types.map((x) => <option key={x} value={x}>{t(TYPE_KEYS[x] || x)}</option>)}
            </select>
          </div>
        )}
        <div className="col-6 col-md-auto">
          <label className="visually-hidden" htmlFor="doc-year">{t('year')}</label>
          <select id="doc-year" className="form-select" value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">{t('allYears')}</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="col-6 col-md-auto">
          <label className="visually-hidden" htmlFor="doc-sort">{t('sortBy')}</label>
          <select id="doc-sort" className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="desc">{t('newestFirst')}</option>
            <option value="asc">{t('oldestFirst')}</option>
          </select>
        </div>
      </div>
      <p className="small text-muted-2" aria-live="polite">{rows.length} {t('records')}</p>
      {rows.length === 0 ? <Empty /> : (
        <div className="table-wrap">
          <table className="table dst-table table-hover">
            {caption && <caption className="visually-hidden">{caption}</caption>}
            <thead>
              <tr>
                <th scope="col">{t('number')}</th>
                <th scope="col">{t('date')}</th>
                <th scope="col">{t('subject')}</th>
                <th scope="col" className="d-none d-md-table-cell">{t('department')}</th>
                <th scope="col" className="text-end">{t('download')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id}>
                  <td className="fw-semibold text-nowrap">{d.number}</td>
                  <td className="text-nowrap">{formatDate(d.date, lang)}</td>
                  <td>{tc(d.title)}</td>
                  <td className="d-none d-md-table-cell small text-muted-2">{d.department}</td>
                  <td className="text-end">
                    {d.file ? (
                      <a href={d.file} className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 text-nowrap" target="_blank" rel="noopener" aria-label={`${t('downloadPdf')}: ${tc(d.title)}${d.size ? ` (${d.size})` : ''}`}>
                        <Download size={14} aria-hidden="true" /> PDF{d.size ? <small className="ms-1 opacity-75">{d.size}</small> : null}
                      </a>
                    ) : <FileText size={16} className="text-muted-2" aria-label={t('notAvailable')} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
