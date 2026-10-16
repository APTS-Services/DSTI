import React, { useCallback, useEffect, useState } from 'react';
import { Copy, FileText, Trash2, Upload } from 'lucide-react';
import { api } from '../api/client';
import { can, useAdmin } from './AdminContext';

const kb = (n) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.ceil(n / 1024)} KB`);

export default function MediaLibrary() {
  const { user } = useAdmin();
  const [items, setItems] = useState(null);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => api('/api/admin/uploads').then((r) => setItems(r.items)).catch((e) => setMsg({ type: 'danger', text: e.message })), []);
  useEffect(() => { load(); }, [load]);

  const upload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const r = await api('/api/admin/uploads', { method: 'POST', form });
      setMsg({ type: 'success', text: `Uploaded. Path: ${r.url}` });
      load();
    } catch (ex) {
      setMsg({ type: 'danger', text: ex.message });
    } finally {
      setBusy(false);
    }
  };
  const remove = async (it) => {
    if (!window.confirm(`Delete ${it.original_name}? Pages using this file will show a broken link.`)) return;
    await api(`/api/admin/uploads/${it.id}`, { method: 'DELETE' }).catch((ex) => setMsg({ type: 'danger', text: ex.message }));
    load();
  };
  const copy = (url) => navigator.clipboard?.writeText(url).then(() => setMsg({ type: 'success', text: `Copied ${url}` }));

  return (
    <>
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <h1 className="h3 fw-bold mb-0 me-auto">Files & images</h1>
        <label className="btn btn-primary d-inline-flex align-items-center gap-2 mb-0">
          {busy ? <span className="spinner-border spinner-border-sm" aria-hidden="true" /> : <Upload size={16} aria-hidden="true" />} Upload file
          <input type="file" className="d-none" accept=".pdf,.png,.jpg,.jpeg,.webp,.mp4" onChange={upload} />
        </label>
      </div>
      <p className="small text-muted-2">Allowed: PDF, PNG, JPG, WEBP and MP4. Files are checked for their real type and renamed on upload.</p>
      {msg && <div className={`alert alert-${msg.type} py-2`} role="status">{msg.text}</div>}
      <div className="admin-card">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light"><tr><th>Preview</th><th>File</th><th>Size</th><th>Uploaded</th><th className="text-end">Actions</th></tr></thead>
            <tbody>
              {(items || []).map((it) => (
                <tr key={it.id}>
                  <td>{it.mime.startsWith('image/') ? <img src={it.url} alt="" width="64" height="40" style={{ objectFit: 'cover' }} className="rounded border" /> : <FileText size={24} className="text-muted-2" aria-hidden="true" />}</td>
                  <td><a href={it.url} target="_blank" rel="noopener">{it.original_name}</a><small className="d-block font-monospace text-muted-2">{it.url}</small></td>
                  <td className="small">{kb(it.size_bytes)}</td>
                  <td className="small text-nowrap">{it.created_at}</td>
                  <td className="text-end text-nowrap">
                    <button type="button" className="btn btn-sm btn-outline-secondary me-1" onClick={() => copy(it.url)} aria-label="Copy path"><Copy size={14} /></button>
                    {can(user, 'Administrator', 'Publisher') && <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => remove(it)} aria-label="Delete"><Trash2 size={14} /></button>}
                  </td>
                </tr>
              ))}
              {items && !items.length && <tr><td colSpan={5} className="text-center text-muted-2 py-4">No files uploaded yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
