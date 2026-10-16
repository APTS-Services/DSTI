import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Inbox, Newspaper, Plus, Users } from 'lucide-react';
import { api } from '../api/client';
import { can, useAdmin } from './AdminContext';

export default function Dashboard() {
  const { user, schemas } = useAdmin();
  const [d, setD] = useState(null);
  useEffect(() => { api('/api/admin/dashboard').then(setD).catch(() => {}); }, []);
  const kpis = d ? [
    ['Visitors today', d.visits.today, Users, '/admin/analytics'],
    ['Total visitors', d.visits.total, Users, '/admin/analytics'],
    ['Open tenders', d.openTenders, FileText, '/admin/c/tenders'],
    ...(can(user, 'Administrator', 'Publisher') ? [['Unread feedback', d.feedback.unread, Inbox, '/admin/feedback']] : []),
  ] : [];
  const quick = [['news', 'Add an update'], ['tenders', 'Publish a tender'], ['documents', 'Upload a G.O. / circular'], ['events', 'Add an event']];

  return (
    <>
      <h1 className="h3 fw-bold mb-1">Welcome, {user.name}</h1>
      <p className="text-muted-2">Manage every part of the DSTI website from here. Changes appear on the site immediately after publishing.</p>
      <div className="row g-3 mb-4">
        {kpis.map(([l, v, Icon, to]) => (
          <div className="col-6 col-xl-3" key={l}>
            <Link to={to} className="admin-card kpi d-block text-decoration-none text-body h-100">
              <Icon size={18} className="text-primary mb-2" aria-hidden="true" />
              <div className="v">{Number(v).toLocaleString('en-IN')}</div><div className="l">{l}</div>
            </Link>
          </div>
        ))}
      </div>
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="admin-card p-4 h-100">
            <h2 className="h6 fw-bold mb-3">Quick actions</h2>
            <div className="d-flex flex-wrap gap-2">
              {quick.map(([c, l]) => <Link key={c} to={`/admin/c/${c}/new`} className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1"><Plus size={14} aria-hidden="true" /> {l}</Link>)}
            </div>
            <h2 className="h6 fw-bold mt-4 mb-3">Content</h2>
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead><tr><th>Section</th><th className="text-end">Items</th><th className="text-end">Drafts</th></tr></thead>
                <tbody>
                  {Object.entries(schemas.collections).map(([k, c]) => (
                    <tr key={k}><td><Link to={`/admin/c/${k}`}>{c.label}</Link></td><td className="text-end">{d?.counts[k]?.total ?? 0}</td><td className="text-end">{d?.counts[k]?.drafts ? <span className="badge text-bg-warning">{d.counts[k].drafts}</span> : 0}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="admin-card p-4 h-100">
            <h2 className="h6 fw-bold mb-3 d-flex align-items-center gap-2"><Newspaper size={16} aria-hidden="true" /> Recent activity</h2>
            {!d?.recent?.length ? <p className="small text-muted-2">No recent activity to show.</p> : (
              <ul className="list-unstyled small d-grid gap-2 mb-0">
                {d.recent.map((r, i) => <li key={i} className="d-flex justify-content-between gap-2 border-bottom pb-2"><span><strong>{r.username || '—'}</strong> {r.action.toLowerCase().replace(/_/g, ' ')} <span className="text-muted-2">{r.target}</span></span><span className="text-muted-2 text-nowrap">{r.created_at?.slice(5, 16)}</span></li>)}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
