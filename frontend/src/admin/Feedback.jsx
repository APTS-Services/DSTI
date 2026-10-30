import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Download, Mail, MessageSquareReply, Phone, RotateCcw, Search, Trash2 } from 'lucide-react';
import { api, apiUrl } from '../api/client';
import { can, useAdmin } from './AdminContext';
import { FeedbackBoard } from '../pages/FeedbackPage';

const TABS = [['', 'All'], ['new', 'New'], ['read', 'Read'], ['replied', 'Answered'], ['resolved', 'Resolved']];
const BADGE = { new: 'text-bg-danger', read: 'text-bg-secondary', replied: 'text-bg-primary', resolved: 'text-bg-success' };
const LABEL = { new: 'New', read: 'Read', replied: 'Answered', resolved: 'Resolved' };
const ref = (id) => `FB-${String(id).padStart(5, '0')}`;

/** Days between two 'YYYY-MM-DD HH:MM:SS' timestamps, for the "answered in" hint. */
function elapsed(from, to) {
  const a = new Date(String(from).replace(' ', 'T'));
  const b = to ? new Date(String(to).replace(' ', 'T')) : new Date();
  const hours = (b - a) / 36e5;
  if (!Number.isFinite(hours)) return '';
  return hours < 48 ? `${Math.max(0, Math.round(hours))} h` : `${Math.round(hours / 24)} days`;
}

function Reply({ item, onDone, onError }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const send = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api(`/api/admin/feedback/${item.id}/reply`, { method: 'POST', body: { response: text } });
      setText('');
      onDone(res.emailed ? 'Reply saved and e-mailed to the citizen.' : 'Reply saved. (E-mail is not configured, so it was not sent; the citizen can read it by tracking the reference.)');
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={send} className="mt-3">
      <label htmlFor={`reply-${item.id}`} className="form-label small fw-semibold">{item.response ? 'Update the reply' : 'Reply to the citizen'}</label>
      <textarea id={`reply-${item.id}`} className="form-control" rows={4} maxLength={4000} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write the Department's reply. It is e-mailed to the citizen and shown when they track this reference." required minLength={5} />
      <div className="d-flex justify-content-end mt-2">
        <button type="submit" className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1" disabled={busy || text.trim().length < 5}>
          <MessageSquareReply size={14} aria-hidden="true" /> {busy ? 'Sending…' : 'Send reply'}
        </button>
      </div>
    </form>
  );
}

export default function Feedback() {
  const { user } = useAdmin();
  const [items, setItems] = useState(null);
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const canAct = can(user, 'Administrator', 'Publisher');

  const load = useCallback(() => {
    api('/api/admin/feedback').then((r) => setItems(r.items)).catch((e) => setMsg({ type: 'danger', text: e.message }));
    api('/api/admin/feedback/stats').then(setStats).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);

  const setStatus = async (f, status) => {
    await api(`/api/admin/feedback/${f.id}`, { method: 'PATCH', body: { status } }).catch((e) => setMsg({ type: 'danger', text: e.message }));
    load();
  };
  const remove = async (f) => {
    if (!window.confirm(`Delete ${ref(f.id)} permanently?`)) return;
    await api(`/api/admin/feedback/${f.id}`, { method: 'DELETE' }).catch((e) => setMsg({ type: 'danger', text: e.message }));
    setOpen(null);
    load();
  };
  const view = (f) => {
    setOpen(open === f.id ? null : f.id);
    if (f.status === 'new' && canAct) setStatus(f, 'read');
  };
  const exportCsv = async () => {
    const res = await fetch(apiUrl('/api/admin/feedback/export'), { credentials: 'include' });
    if (!res.ok) return setMsg({ type: 'danger', text: 'Export failed.' });
    const url = URL.createObjectURL(await res.blob());
    const a = Object.assign(document.createElement('a'), { href: url, download: `dsti-feedback-${new Date().toISOString().slice(0, 10)}.csv` });
    a.click();
    URL.revokeObjectURL(url);
    return undefined;
  };

  const counts = useMemo(() => (items || []).reduce((acc, f) => ({ ...acc, [f.status]: (acc[f.status] || 0) + 1 }), {}), [items]);
  const list = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (items || []).filter((f) => (!tab || f.status === tab)
      && (!needle || [ref(f.id), f.name, f.email, f.subject, f.message, f.category].join(' ').toLowerCase().includes(needle)));
  }, [items, tab, query]);

  return (
    <>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div>
          <h1 className="h3 fw-bold mb-0">Feedback</h1>
          <p className="text-muted-2 small mb-0">Read, answer and resolve citizen feedback. The same figures appear on the public Feedback page.</p>
        </div>
        {canAct && <button type="button" className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1" onClick={exportCsv}><Download size={14} aria-hidden="true" /> Export CSV</button>}
      </div>
      {msg.text && <div className={`alert alert-${msg.type} alert-dismissible`} role="status">{msg.text}<button type="button" className="btn-close" aria-label="Close" onClick={() => setMsg({ type: '', text: '' })} /></div>}

      <div className="mb-4"><FeedbackBoard stats={stats} /></div>

      <div className="admin-card">
        <div className="p-3 border-bottom d-flex flex-wrap gap-2 align-items-center">
          <div className="admin-tabs" role="group" aria-label="Filter by status">
            {TABS.map(([k, l]) => (
              <button key={k || 'all'} type="button" className={tab === k ? 'active' : ''} aria-pressed={tab === k} onClick={() => setTab(k)}>
                {l} <span className="count">{k ? counts[k] || 0 : items?.length || 0}</span>
              </button>
            ))}
          </div>
          <div className="input-group input-group-sm ms-auto" style={{ maxWidth: 280 }}>
            <span className="input-group-text"><Search size={14} aria-hidden="true" /></span>
            <input type="search" className="form-control" placeholder="Search reference, name, text…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search feedback" />
          </div>
        </div>
        {!items ? <div className="p-4"><div className="skeleton" style={{ height: 120 }} /></div> : (
          <ul className="list-group list-group-flush">
            {list.map((f) => (
              <li key={f.id} className={`list-group-item p-0 ${open === f.id ? 'bg-soft' : ''}`}>
                <button type="button" className="fb-row" onClick={() => view(f)} aria-expanded={open === f.id}>
                  <span className={`badge ${BADGE[f.status] || 'text-bg-secondary'}`}>{LABEL[f.status] || f.status}</span>
                  <span className="flex-grow-1 text-start min-w-0">
                    <strong>{f.subject || '(no subject)'}</strong>
                    <span className="d-block small text-muted-2 text-truncate">{f.name} · {f.category || 'General'} · {f.message}</span>
                  </span>
                  <span className="small text-muted-2 text-end text-nowrap">
                    <span className="font-monospace d-block">{ref(f.id)}</span>
                    {String(f.created_at).slice(0, 16)}
                  </span>
                </button>
                {open === f.id && (
                  <div className="px-3 pb-3">
                    <div className="d-flex flex-wrap gap-3 small mb-2">
                      <a href={`mailto:${f.email}`} className="d-inline-flex align-items-center gap-1"><Mail size={13} aria-hidden="true" /> {f.email}</a>
                      {f.phone && <a href={`tel:${f.phone}`} className="d-inline-flex align-items-center gap-1"><Phone size={13} aria-hidden="true" /> {f.phone}</a>}
                      {f.responded_at ? <span className="text-success">Answered in {elapsed(f.created_at, f.responded_at)}{f.handler_name ? ` by ${f.handler_name}` : ''}</span> : <span className="text-warning-emphasis">Waiting {elapsed(f.created_at)}</span>}
                    </div>
                    <p className="bg-surface border p-3 rounded-3 mb-0" style={{ whiteSpace: 'pre-wrap' }}>{f.message}</p>
                    {f.response && (
                      <div className="mt-3"><div className="small fw-semibold mb-1">Reply sent {String(f.responded_at || '').slice(0, 16)}</div><p className="track-reply mb-0">{f.response}</p></div>
                    )}
                    {canAct && <Reply item={f} onDone={(text) => { setMsg({ type: 'success', text }); load(); }} onError={(text) => setMsg({ type: 'danger', text })} />}
                    {canAct && (
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {f.status !== 'resolved' && <button type="button" className="btn btn-sm btn-success d-inline-flex align-items-center gap-1" onClick={() => setStatus(f, 'resolved')}><CheckCircle2 size={14} aria-hidden="true" /> Mark resolved</button>}
                        {f.status !== 'new' && <button type="button" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1" onClick={() => setStatus(f, 'new')}><RotateCcw size={14} aria-hidden="true" /> Mark unread</button>}
                        {can(user, 'Administrator') && <button type="button" className="btn btn-sm btn-outline-danger ms-auto d-inline-flex align-items-center gap-1" onClick={() => remove(f)}><Trash2 size={13} aria-hidden="true" /> Delete</button>}
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
            {!list.length && <li className="list-group-item text-center text-muted-2 py-5">No feedback matches.</li>}
          </ul>
        )}
      </div>
    </>
  );
}
