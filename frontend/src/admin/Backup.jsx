import React, { useState } from 'react';
import { DatabaseBackup, Download, Upload } from 'lucide-react';
import { api } from '../api/client';
import { useContent } from '../context/ContentContext';

export default function Backup() {
  const { reload } = useContent();
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    try {
      const data = await api('/api/admin/backup');
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `dsti-content-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg({ type: 'success', text: `Backup downloaded (${data.items.length} items).` });
    } catch (e) {
      setMsg({ type: 'danger', text: e.message });
    } finally {
      setBusy(false);
    }
  };

  const restore = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!window.confirm('Restoring replaces ALL website content with the contents of this backup. Continue?')) return;
    setBusy(true);
    try {
      const body = JSON.parse(await file.text());
      const r = await api('/api/admin/restore', { method: 'POST', body });
      reload();
      setMsg({ type: 'success', text: `Restored ${r.restored} items.${r.warnings?.length ? ` Warnings: ${r.warnings.join('; ')}` : ''}` });
    } catch (ex) {
      setMsg({ type: 'danger', text: ex instanceof SyntaxError ? 'This file is not valid JSON.' : ex.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h1 className="h3 fw-bold mb-3 d-flex align-items-center gap-2"><DatabaseBackup size={24} aria-hidden="true" /> Backup & restore</h1>
      {msg && <div className={`alert alert-${msg.type}`} role="status">{msg.text}</div>}
      <div className="row g-4">
        <div className="col-md-6">
          <div className="admin-card p-4 h-100">
            <h2 className="h5 fw-bold">Download a content backup</h2>
            <p className="text-muted-2 small">Exports all pages, settings and records as a JSON file. Uploaded files and the full database are backed up by the scheduled server backup (see README).</p>
            <button type="button" className="btn btn-primary d-inline-flex align-items-center gap-2" onClick={download} disabled={busy}><Download size={16} aria-hidden="true" /> Download backup</button>
          </div>
        </div>
        <div className="col-md-6">
          <div className="admin-card p-4 h-100 border-danger">
            <h2 className="h5 fw-bold">Restore from a backup</h2>
            <p className="text-muted-2 small">Replaces all website content with the backup. User accounts are not affected. Download a fresh backup first.</p>
            <label className="btn btn-outline-danger d-inline-flex align-items-center gap-2 mb-0">
              <Upload size={16} aria-hidden="true" /> Choose backup file
              <input type="file" accept="application/json,.json" className="d-none" onChange={restore} disabled={busy} />
            </label>
          </div>
        </div>
      </div>
    </>
  );
}
