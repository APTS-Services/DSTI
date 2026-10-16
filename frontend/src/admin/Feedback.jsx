import React, { useCallback, useEffect, useState } from 'react';
import { Mail, Trash2 } from 'lucide-react';
import { api } from '../api/client';
import { can, useAdmin } from './AdminContext';

export default function Feedback() {
  const { user } = useAdmin();
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(null);
  const [err, setErr] = useState('');
  const load = useCallback(() => api('/api/admin/feedback').then((r) => setItems(r.items)).catch((e) => setErr(e.message)), []);
  useEffect(() => { load(); }, [load]);

  const setStatus = async (f, status) => {
    await api(`/api/admin/feedback/${f.id}`, { method: 'PATCH', body: { status } }).catch((e) => setErr(e.message));
    load();
  };
  const remove = async (f) => {
    if (!window.confirm('Delete this feedback permanently?')) return;
    await api(`/api/admin/feedback/${f.id}`, { method: 'DELETE' }).catch((e) => setErr(e.message));
    setOpen(null);
    load();
  };
  const view = (f) => {
    setOpen(open === f.id ? null : f.id);
    if (f.status === 'new') setStatus(f, 'read');
  };
  const list = (items || []).filter((f) => !filter || f.status === filter);

  return (
    <>
      <h1 className="h3 fw-bold mb-3">Feedback inbox</h1>
      {err && <div className="alert alert-danger">{err}</div>}
      <div className="admin-card">
        <div className="p-3 border-bottom d-flex gap-2 align-items-center">
          <select className="form-select w-auto" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status">
            <option value="">All</option><option value="new">New</option><option value="read">Read</option><option value="resolved">Resolved</option>
          </select>
          <span className="small text-muted-2 ms-auto">{list.length} message(s)</span>
        </div>
        {!items ? <div className="p-4 skeleton" style={{ height: 120 }} /> : (
          <ul className="list-group list-group-flush">
            {list.map((f) => (
              <li key={f.id} className="list-group-item p-3">
                <button type="button" className="btn btn-link text-start text-body text-decoration-none p-0 w-100" onClick={() => view(f)} aria-expanded={open === f.id}>
                  <div className="d-flex flex-wrap justify-content-between gap-2">
                    <span><span className={`badge me-2 ${f.status === 'new' ? 'text-bg-danger' : f.status === 'read' ? 'text-bg-secondary' : 'text-bg-success'}`}>{f.status}</span><strong>{f.name}</strong> <span className="text-muted-2">— {f.subject || '(no subject)'}</span></span>
                    <small className="text-muted-2">FB-{String(f.id).padStart(5, '0')} · {f.created_at}</small>
                  </div>
                </button>
                {open === f.id && (
                  <div className="mt-3">
                    <p className="small mb-2"><a href={`mailto:${f.email}`} className="d-inline-flex align-items-center gap-1"><Mail size={13} aria-hidden="true" /> {f.email}</a>{f.phone && ` · ${f.phone}`}{f.notified ? ' · e-mail notification sent' : ''}</p>
                    <p className="bg-soft p-3 rounded-3" style={{ whiteSpace: 'pre-wrap' }}>{f.message}</p>
                    <div className="d-flex gap-2">
                      {f.status !== 'resolved' && <button type="button" className="btn btn-sm btn-success" onClick={() => setStatus(f, 'resolved')}>Mark resolved</button>}
                      {f.status !== 'new' && <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setStatus(f, 'new')}>Mark unread</button>}
                      {can(user, 'Administrator') && <button type="button" className="btn btn-sm btn-outline-danger ms-auto d-inline-flex align-items-center gap-1" onClick={() => remove(f)}><Trash2 size={13} aria-hidden="true" /> Delete</button>}
                    </div>
                  </div>
                )}
              </li>
            ))}
            {!list.length && <li className="list-group-item text-center text-muted-2 py-4">No feedback.</li>}
          </ul>
        )}
      </div>
    </>
  );
}
