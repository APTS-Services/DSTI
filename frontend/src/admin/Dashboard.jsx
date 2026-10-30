import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, CalendarPlus, CheckCircle2, FilePlus2, FileText, ImagePlus, Inbox, Megaphone, Timer, UserRoundPen, Users } from 'lucide-react';
import { api } from '../api/client';
import { can, useAdmin } from './AdminContext';
import { buildSections } from './adminNav';

const QUICK = [
  ['news', 'Add a news update', Megaphone],
  ['tenders', 'Publish a tender', FileText],
  ['documents', 'Upload a G.O. / circular', FilePlus2],
  ['events', 'Add an event', CalendarPlus],
  ['gallery', 'Add a photo', ImagePlus],
  ['leaders', 'Update leadership', UserRoundPen],
];

const n = (v) => Number(v || 0).toLocaleString('en-IN');

function hours(h) {
  if (h == null) return '—';
  return h < 48 ? `${Math.round(h)} h` : `${(h / 24).toFixed(1)} days`;
}

export default function Dashboard() {
  const { user, schemas } = useAdmin();
  const [d, setD] = useState(null);
  const [fb, setFb] = useState(null);
  const readsFeedback = can(user, 'Administrator', 'Publisher', 'Viewer');
  const writes = can(user, 'Administrator', 'Publisher', 'Editor');
  useEffect(() => {
    api('/api/admin/dashboard').then(setD).catch(() => {});
    if (readsFeedback) api('/api/admin/feedback/stats').then(setFb).catch(() => {});
  }, [readsFeedback]);

  const sections = useMemo(() => buildSections(schemas), [schemas]);
  const drafts = useMemo(() => Object.entries(d?.counts || {}).filter(([, c]) => c.drafts > 0), [d]);
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const kpis = [
    { label: 'Visitors today', value: n(d?.visits.today), icon: Users, to: '/admin/analytics', note: `${n(d?.visits.total)} in total` },
    { label: 'Open tenders', value: n(d?.openTenders), icon: FileText, to: '/admin/c/tenders', note: 'published and open' },
    ...(readsFeedback ? [
      { label: 'Feedback pending', value: n(fb?.pending), icon: Inbox, to: '/admin/feedback', note: `${n(d?.feedback.unread)} not yet read`, tone: fb?.pending ? 'warn' : '' },
      { label: 'Average response', value: hours(fb?.avgResponseHours), icon: Timer, to: '/admin/feedback', note: `${fb?.answeredRate ?? 0}% of feedback answered` },
    ] : []),
  ];

  return (
    <>
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-4">
        <div>
          <p className="text-muted-2 small mb-1">{today}</p>
          <h1 className="h3 fw-bold mb-0">Welcome, {user.name}</h1>
        </div>
        <a href="/" target="_blank" rel="noopener noreferrer" className="small">Open the public website ↗</a>
      </div>

      <div className="row g-3 mb-4">
        {kpis.map(({ label, value, icon: Icon, to, note, tone }) => (
          <div className="col-6 col-xl-3" key={label}>
            <Link to={to} className={`admin-card kpi d-block text-decoration-none text-body h-100 ${tone === 'warn' ? 'kpi-warn' : ''}`}>
              <span className="kpi-icon"><Icon size={18} aria-hidden="true" /></span>
              <div className="v">{value ?? '—'}</div>
              <div className="l">{label}</div>
              <div className="small text-muted-2">{note}</div>
            </Link>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-xl-8 d-grid gap-4 align-content-start">
          {writes && (
            <section className="admin-card p-4" aria-labelledby="quick-title">
              <h2 id="quick-title" className="h6 fw-bold mb-3">Quick actions</h2>
              <div className="quick-grid">
                {QUICK.filter(([c]) => schemas.collections[c]).map(([c, label, Icon]) => (
                  <Link key={c} to={`/admin/c/${c}/new`} className="quick-tile"><Icon size={20} aria-hidden="true" /> <span>{label}</span></Link>
                ))}
              </div>
            </section>
          )}

          <section className="admin-card p-4" aria-labelledby="content-title">
            <h2 id="content-title" className="h6 fw-bold mb-3">Website content</h2>
            <div className="row g-3">
              {sections.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.id} className="col-md-6">
                    <div className="content-group">
                      <div className="d-flex align-items-center gap-2 fw-semibold mb-2"><Icon size={16} aria-hidden="true" className="text-primary" /> {s.label}</div>
                      <ul className="list-unstyled mb-0">
                        {s.items.map((i) => {
                          const c = i.collection && d?.counts?.[i.collection];
                          return (
                            <li key={i.key}>
                              <Link to={i.to}>
                                <span>{i.label}</span>
                                {c ? <span className="text-muted-2">{c.total}{c.drafts ? <span className="badge text-bg-warning ms-1">{c.drafts} draft</span> : null}</span> : <ArrowRight size={13} aria-hidden="true" className="text-muted-2" />}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="col-xl-4 d-grid gap-4 align-content-start">
          <section className="admin-card p-4" aria-labelledby="attention-title">
            <h2 id="attention-title" className="h6 fw-bold mb-3">Needs attention</h2>
            <ul className="list-unstyled d-grid gap-2 mb-0 small">
              {readsFeedback && fb?.pending > 0 && (
                <li><Link to="/admin/feedback" className="attention"><AlertCircle size={16} aria-hidden="true" /> {fb.pending} feedback message(s) awaiting a reply</Link></li>
              )}
              {drafts.map(([k, c]) => (
                <li key={k}><Link to={`/admin/c/${k}`} className="attention"><AlertCircle size={16} aria-hidden="true" /> {c.drafts} draft(s) in {schemas.collections[k]?.label || k}</Link></li>
              ))}
              {d && !drafts.length && !(readsFeedback && fb?.pending) && (
                <li className="d-flex align-items-center gap-2 text-success"><CheckCircle2 size={16} aria-hidden="true" /> All caught up.</li>
              )}
            </ul>
          </section>

          <section className="admin-card p-4" aria-labelledby="recent-title">
            <h2 id="recent-title" className="h6 fw-bold mb-3">Recent activity</h2>
            {!d?.recent?.length ? <p className="small text-muted-2 mb-0">No recent activity to show.</p> : (
              <ul className="list-unstyled small d-grid gap-2 mb-0">
                {d.recent.map((r, i) => (
                  <li key={i} className="d-flex justify-content-between gap-2 border-bottom pb-2">
                    <span><strong>{r.username || 'Website'}</strong> {r.action.toLowerCase().replace(/_/g, ' ')} <span className="text-muted-2">{r.target}</span></span>
                    <span className="text-muted-2 text-nowrap">{r.created_at?.slice(5, 16)}</span>
                  </li>
                ))}
              </ul>
            )}
            {can(user, 'Administrator') && <Link to="/admin/audit" className="small d-inline-block mt-3">Full audit log →</Link>}
          </section>
        </div>
      </div>
    </>
  );
}
