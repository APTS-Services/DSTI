import React, { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AuditLog() {
  const [items, setItems] = useState(null);
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');
  useEffect(() => { api('/api/admin/audit').then((r) => setItems(r.items)).catch((e) => setErr(e.message)); }, []);
  const list = (items || []).filter((a) => !q || JSON.stringify(a).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <h1 className="h3 fw-bold mb-3">Audit log</h1>
      {err && <div className="alert alert-danger">{err}</div>}
      <div className="admin-card">
        <div className="p-3 border-bottom"><input type="search" className="form-control" style={{ maxWidth: 360 }} placeholder="Filter by user, action or item…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filter audit log" /></div>
        <div className="table-responsive">
          <table className="table table-sm align-middle mb-0">
            <thead className="table-light"><tr><th>Time (UTC)</th><th>User</th><th>Action</th><th>Item</th><th>Details</th><th>IP</th></tr></thead>
            <tbody>{list.map((a) => (
              <tr key={a.id}><td className="text-nowrap small">{a.created_at}</td><td>{a.username || '—'}</td><td><span className={`badge ${a.action.includes('FAIL') || a.action.includes('LOCK') ? 'text-bg-danger' : 'text-bg-light border'}`}>{a.action}</span></td><td className="small font-monospace">{a.target}</td><td className="small">{a.details}</td><td className="small font-monospace">{a.ip}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </>
  );
}
