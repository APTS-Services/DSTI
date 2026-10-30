// Feedback: public dashboard of how the Department responds, the feedback
// form, and status tracking by reference number.
import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Hourglass, Inbox, Search, Timer } from 'lucide-react';
import { api, apiUrl, ApiError } from '../api/client';
import { useLanguage } from '../i18n/LanguageContext';
import useSEO from '../hooks/useSEO';
import PageHero from '../components/common/PageHero';
import Reveal from '../components/common/Reveal';
import FeedbackForm, { FEEDBACK_CATEGORIES } from '../components/common/FeedbackForm';
import { formatDate } from '../utils/format';

const num = (v) => Number(v || 0).toLocaleString('en-IN');

function useFeedbackStats() {
  const [stats, setStats] = useState(null);
  const load = () => fetch(apiUrl('/api/public/feedback/stats')).then((r) => (r.ok ? r.json() : null)).then(setStats).catch(() => setStats(null));
  useEffect(() => { load(); }, []);
  return [stats, load];
}

function responseTime(hours, t) {
  if (hours == null) return '—';
  if (hours < 48) return `${Math.max(0.1, hours).toLocaleString('en-IN', { maximumFractionDigits: 1 })} ${t('hours')}`;
  return `${(hours / 24).toLocaleString('en-IN', { maximumFractionDigits: 1 })} ${t('days')}`;
}

function monthLabel(ym, lang) {
  const d = new Date(`${ym}-01T00:00:00`);
  return Number.isNaN(d.getTime()) ? ym : d.toLocaleDateString(lang === 'te' ? 'te-IN' : 'en-IN', { month: 'short' });
}

/** The last six calendar months, so empty months still show as a zero bar. */
function lastSixMonths(rows) {
  const byMonth = Object.fromEntries((rows || []).map((r) => [r.month, r]));
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return byMonth[key] || { month: key, received: 0, answered: 0 };
  });
}

export function FeedbackBoard({ stats }) {
  const { t, lang } = useLanguage();
  if (!stats) return <div className="skeleton" style={{ height: 180 }} />;
  const months = lastSixMonths(stats.months);
  const peak = Math.max(1, ...months.map((m) => m.received));
  const catName = (value) => {
    const found = FEEDBACK_CATEGORIES.find(([v]) => v === value);
    return found ? (lang === 'te' ? found[2] : found[1]) : value;
  };
  const tiles = [
    { icon: Inbox, tone: 'navy', value: num(stats.received), label: t('fbReceived'), note: `${num(stats.last30Days)} ${t('fbLast30')}` },
    { icon: CheckCircle2, tone: 'green', value: num(stats.answered), label: t('fbAnswered'), note: `${stats.answeredRate}% ${t('fbOfTotal')}` },
    { icon: Hourglass, tone: 'amber', value: num(stats.pending), label: t('fbPending'), note: t('fbAwaiting') },
    { icon: Timer, tone: 'sky', value: responseTime(stats.avgResponseHours, t), label: t('fbAvgResponse'), note: t('fbFromReceipt') },
  ];
  return (
    <div className="fb-board">
      <div className="row g-3">
        {tiles.map(({ icon: Icon, tone, value, label, note }) => (
          <div key={label} className="col-6 col-lg-3">
            <div className={`fb-tile tone-${tone}`}>
              <span className="fb-icon"><Icon size={20} aria-hidden="true" /></span>
              <div className="fb-value">{value}</div>
              <div className="fb-label">{label}</div>
              <div className="fb-note">{note}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="row g-3 mt-1">
        <div className="col-lg-7">
          <div className="fb-panel h-100">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <h3 className="h6 fw-bold mb-0">{t('fbMonthly')}</h3>
              <div className="d-flex gap-3 small text-muted-2">
                <span className="d-inline-flex align-items-center gap-1"><span className="legend-dot bg-received" /> {t('fbReceived')}</span>
                <span className="d-inline-flex align-items-center gap-1"><span className="legend-dot bg-answered" /> {t('fbAnswered')}</span>
              </div>
            </div>
            <div className="fb-chart" aria-hidden="true">
              {months.map((m) => (
                <div key={m.month} className="fb-col">
                  <div className="fb-bars">
                    <span className="bar received" style={{ height: `${(m.received / peak) * 100}%` }} title={`${t('fbReceived')}: ${m.received}`} />
                    <span className="bar answered" style={{ height: `${(m.answered / peak) * 100}%` }} title={`${t('fbAnswered')}: ${m.answered}`} />
                  </div>
                  <span className="fb-month">{monthLabel(m.month, lang)}</span>
                </div>
              ))}
            </div>
            <table className="visually-hidden">
              <caption>{t('feedbackTable')}</caption>
              <thead><tr><th scope="col">{t('month')}</th><th scope="col">{t('fbReceived')}</th><th scope="col">{t('fbAnswered')}</th></tr></thead>
              <tbody>{months.map((m) => <tr key={m.month}><th scope="row">{m.month}</th><td>{m.received}</td><td>{m.answered}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="fb-panel h-100">
            <h3 className="h6 fw-bold mb-3">{t('fbWithin7')}</h3>
            <div className="d-flex align-items-end gap-2 mb-2"><span className="fb-value">{stats.answered ? `${stats.within7DaysRate}%` : '—'}</span></div>
            <div className="progress mb-4" role="progressbar" aria-label={t('fbWithin7')} aria-valuenow={stats.within7DaysRate} aria-valuemin={0} aria-valuemax={100} style={{ height: 8 }}>
              <div className="progress-bar bg-success" style={{ width: `${stats.within7DaysRate}%` }} />
            </div>
            <h3 className="h6 fw-bold mb-2">{t('fbByCategory')}</h3>
            {!stats.categories.length ? <p className="small text-muted-2 mb-0">{t('fbNoData')}</p> : (
              <ul className="list-unstyled d-grid gap-2 mb-0 small">
                {stats.categories.slice(0, 5).map((c) => (
                  <li key={c.category}>
                    <div className="d-flex justify-content-between"><span>{catName(c.category)}</span><span className="text-muted-2">{c.answered}/{c.received}</span></div>
                    <div className="fb-cat"><span style={{ width: `${(c.received / stats.received) * 100}%` }} /></div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrackFeedback({ initialRef }) {
  const { t, lang } = useLanguage();
  const [ref, setRef] = useState(initialRef || '');
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ busy: false, result: null, error: '' });
  useEffect(() => { if (initialRef) setRef(initialRef); }, [initialRef]);

  const submit = async (e) => {
    e.preventDefault();
    if (!ref.trim() || !email.trim()) return;
    setState({ busy: true, result: null, error: '' });
    try {
      const result = await api('/api/public/feedback/track', { method: 'POST', body: { reference: ref.trim(), email: email.trim() } });
      setState({ busy: false, result, error: '' });
    } catch (err) {
      setState({ busy: false, result: null, error: err instanceof ApiError ? err.message : t('contentUnavailable') });
    }
  };
  const r = state.result;
  return (
    <div className="dst-card">
      <h2 className="h5 fw-bold d-flex align-items-center gap-2"><Search size={18} aria-hidden="true" /> {t('trackFeedback')}</h2>
      <p className="small text-muted-2">{t('trackFeedbackDesc')}</p>
      <form className="row g-2" onSubmit={submit}>
        <div className="col-sm-5">
          <label htmlFor="tr-ref" className="form-label small mb-1">{t('referenceNo')}</label>
          <input id="tr-ref" className="form-control" placeholder="FB-00001" value={ref} onChange={(e) => setRef(e.target.value)} maxLength={12} required />
        </div>
        <div className="col-sm-7">
          <label htmlFor="tr-email" className="form-label small mb-1">{t('yourEmail')}</label>
          <input id="tr-email" type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={160} autoComplete="email" required />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary" disabled={state.busy}>{state.busy && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}{t('trackButton')}</button>
        </div>
      </form>
      <div aria-live="polite">
        {state.error && <div className="alert alert-warning mt-3 mb-0">{state.error}</div>}
        {r && (
          <div className="track-result mt-3">
            <div className="d-flex flex-wrap justify-content-between gap-2">
              <strong className="font-monospace">{r.reference}</strong>
              <span className={`pill status-${r.status}`}>{r.statusLabel}</span>
            </div>
            {r.subject && <div className="small mt-1">{r.subject}</div>}
            <dl className="row small mt-2 mb-0">
              <dt className="col-5 text-muted-2 fw-normal">{t('receivedOn')}</dt><dd className="col-7 mb-1">{formatDate(String(r.receivedAt).slice(0, 10), lang)}</dd>
              {r.respondedAt && <><dt className="col-5 text-muted-2 fw-normal">{t('answeredOn')}</dt><dd className="col-7 mb-1">{formatDate(String(r.respondedAt).slice(0, 10), lang)}</dd></>}
            </dl>
            {r.response ? (
              <div className="mt-2"><div className="small fw-semibold mb-1">{t('departmentReply')}</div><p className="reply mb-0">{r.response}</p></div>
            ) : <p className="small text-muted-2 mt-2 mb-0">{t('noReplyYet')}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  const { t } = useLanguage();
  const [stats, reload] = useFeedbackStats();
  const [lastRef, setLastRef] = useState('');
  useSEO({ title: t('feedbackTitle'), description: t('feedbackIntro') });
  return (
    <>
      <PageHero title={t('feedbackTitle')} subtitle={t('feedbackIntro')} crumbs={[{ label: t('contact'), to: '/contact' }, { label: t('feedback') }]} />
      <section className="container section-sm" aria-labelledby="fb-board-title">
        <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
          <div>
            <h2 id="fb-board-title" className="h4 fw-bold mb-1">{t('feedbackBoard')}</h2>
            <p className="text-muted-2 small mb-0">{t('feedbackBoardDesc')}</p>
          </div>
          {stats?.updatedAt && <span className="small text-muted-2 d-inline-flex align-items-center gap-1"><Clock size={14} aria-hidden="true" /> {new Date(stats.updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>}
        </div>
        <FeedbackBoard stats={stats} />
      </section>
      <section className="container pb-5">
        <div className="row g-4">
          <Reveal className="col-lg-7">
            <div className="dst-card">
              <h2 className="h5 fw-bold mb-3">{t('feedbackForm')}</h2>
              <FeedbackForm onSent={(ref) => { setLastRef(ref); reload(); }} />
            </div>
          </Reveal>
          <Reveal className="col-lg-5 d-grid gap-4 align-content-start" delay={0.08}>
            <TrackFeedback initialRef={lastRef} />
            <div className="dst-card">
              <h2 className="h6 fw-bold mb-3">{t('howWeHandle')}</h2>
              <ol className="timeline small mb-0">
                {['fbStep1', 'fbStep2', 'fbStep3', 'fbStep4'].map((k) => <li key={k}>{t(k)}</li>)}
              </ol>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
