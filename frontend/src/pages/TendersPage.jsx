import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarClock, Download, Search } from 'lucide-react';
import { useCollection } from '../context/ContentContext';
import { useLanguage } from '../i18n/LanguageContext';
import useSEO from '../hooks/useSEO';
import PageHero from '../components/common/PageHero';
import Empty from '../components/common/Empty';
import Reveal from '../components/common/Reveal';
import { formatDate } from '../utils/format';
import { assetUrl } from '../api/client';

const today = () => new Date().toISOString().slice(0, 10);
/** A tender past its closing date is shown as closed even if not yet updated. */
export const effectiveStatus = (tn) => (tn.status === 'open' && tn.closingDate && tn.closingDate < today() ? 'closed' : tn.status);

export default function TendersPage() {
  const { t, tc, lang } = useLanguage();
  const tenders = useCollection('tenders');
  const [params, setParams] = useSearchParams();
  const status = ['open', 'closed'].includes(params.get('status')) ? params.get('status') : '';
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('desc');
  useSEO({ title: t('tenders'), description: t('tendersDesc') });

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return tenders
      .map((x) => ({ ...x, eff: effectiveStatus(x) }))
      .filter((x) => !status || x.eff === status)
      .filter((x) => !term || `${x.tenderNo} ${x.title?.en} ${x.title?.te} ${x.department}`.toLowerCase().includes(term))
      .sort((a, b) => (sort === 'desc' ? -1 : 1) * String(a.publishedDate).localeCompare(String(b.publishedDate)));
  }, [tenders, status, q, sort]);
  const setStatus = (s) => setParams(s ? { status: s } : {});

  return (
    <>
      <PageHero title={t('tenderNotices')} subtitle={t('tendersDesc')} crumbs={[{ label: t('tenders') }]} />
      <div className="container section-sm">
        <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
          <div className="btn-group" role="group" aria-label={t('tenderStatus')}>
            {[['', t('all')], ['open', t('open')], ['closed', t('closed')]].map(([v, l]) => (
              <button key={v} type="button" className={`btn ${status === v ? 'btn-dark' : 'btn-outline-dark'}`} aria-pressed={status === v} onClick={() => setStatus(v)}>{l}</button>
            ))}
          </div>
          <div className="input-group ms-md-auto" style={{ maxWidth: 360 }}>
            <span className="input-group-text bg-surface"><Search size={16} aria-hidden="true" /></span>
            <label htmlFor="tq" className="visually-hidden">{t('search')}</label>
            <input id="tq" type="search" className="form-control" placeholder={t('searchTenders')} value={q} onChange={(e) => setQ(e.target.value)} maxLength={100} />
          </div>
          <label htmlFor="ts" className="visually-hidden">{t('sortBy')}</label>
          <select id="ts" className="form-select w-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="desc">{t('newestFirst')}</option><option value="asc">{t('oldestFirst')}</option>
          </select>
        </div>
        <p className="small text-muted-2" aria-live="polite">{rows.length} {t('records')}</p>
        {!rows.length ? <Empty /> : (
          <div className="d-grid gap-3">
            {rows.map((x) => (
              <Reveal as="article" key={x.id} className="dst-card">
                <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
                  <span className="small fw-semibold text-muted-2">{x.tenderNo} · {x.department}</span>
                  <span className={`pill ${x.eff}`}>{t(x.eff)}</span>
                </div>
                <h2 className="h5 fw-bold">{tc(x.title)}</h2>
                <div className="d-flex flex-wrap gap-4 small text-muted-2 mb-3">
                  <span>{t('publishedOn')}: <strong className="text-body">{formatDate(x.publishedDate, lang)}</strong></span>
                  <span className="d-inline-flex align-items-center gap-1"><CalendarClock size={14} aria-hidden="true" /> {t('closingDate')}: <strong className="text-body">{formatDate(x.closingDate, lang)}</strong></span>
                  {x.emd && <span>{t('emd')}: <strong className="text-body">{x.emd}</strong></span>}
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {(x.documents || []).map((d) => (
                    <a key={d.file} href={assetUrl(d.file)} target="_blank" rel="noopener" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1" aria-label={`${t('download')} ${d.name} (PDF${d.size ? `, ${d.size}` : ''})`}>
                      <Download size={14} aria-hidden="true" /> {d.name}{d.size && <small className="opacity-75 ms-1">({d.size})</small>}
                    </a>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
