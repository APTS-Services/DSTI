import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Save, Trash2 } from 'lucide-react';
import { api } from '../api/client';
import { useContent } from '../context/ContentContext';
import { can, useAdmin } from './AdminContext';
import Fields, { emptyItem, titleOf } from './FormFields';
import publicPath from './publicPath';

export default function ItemEditor() {
  const { collection, key } = useParams();
  const isNew = key === 'new';
  const navigate = useNavigate();
  const location = useLocation();
  const { user, schemas } = useAdmin();
  const { reload } = useContent();
  const schema = schemas.collections[collection];
  const publisher = can(user, 'Administrator', 'Publisher');
  const [item, setItem] = useState(null);
  const [meta, setMeta] = useState({ _status: publisher ? 'published' : 'draft', _order: 0 });
  const [errors, setErrors] = useState([]);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setErrors([]);
    // A message passed through navigation (after creating an item) survives the reload.
    setMsg(location.state?.flash || null);
    setDirty(false);
    if (!schema) return;
    if (isNew) {
      setItem(emptyItem(schema.fields));
      setMeta({ _status: publisher ? 'published' : 'draft', _order: 0 });
      return;
    }
    api(`/api/admin/content/${collection}/${encodeURIComponent(key)}`)
      .then(({ item: it }) => {
        const { _status, _order, _updatedAt, ...data } = it;
        setItem({ ...emptyItem(schema.fields), ...data });
        setMeta({ _status, _order });
      })
      .catch((e) => setMsg({ type: 'danger', text: e.message }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection, key, isNew, schema, publisher]);

  useEffect(() => {
    const warn = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  if (!schema) return <div className="alert alert-warning">Unknown section.</div>;
  if (!item) return msg ? <div className={`alert alert-${msg.type}`}>{msg.text}</div> : <div className="skeleton" style={{ height: 300 }} />;

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors([]);
    setMsg(null);
    try {
      const body = { ...item, ...meta };
      const res = isNew
        ? await api(`/api/admin/content/${collection}`, { method: 'POST', body })
        : await api(`/api/admin/content/${collection}/${encodeURIComponent(key)}`, { method: 'PUT', body });
      setDirty(false);
      reload();
      const flash = { type: 'success', text: res.item._status === 'draft' ? 'Saved as draft.' : 'Saved and published.' };
      setMsg(flash);
      if (isNew || res.item.id !== key) navigate(`/admin/c/${collection}/${encodeURIComponent(res.item.id)}`, { replace: true, state: { flash } });
    } catch (err) {
      setErrors(err.body?.errors || []);
      setMsg({ type: 'danger', text: err.message });
      window.scrollTo({ top: 0 });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this item? This cannot be undone.')) return;
    try {
      await api(`/api/admin/content/${collection}/${encodeURIComponent(key)}`, { method: 'DELETE' });
      reload();
      navigate(`/admin/c/${collection}`, { replace: true });
    } catch (err) {
      setMsg({ type: 'danger', text: err.message });
    }
  };

  return (
    <form onSubmit={save} noValidate>
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <Link to={`/admin/c/${collection}`} className="btn btn-outline-secondary btn-icon" aria-label="Back to list"><ArrowLeft size={16} /></Link>
        <div className="me-auto">
          <p className="small text-muted-2 mb-0">{schema.label}</p>
          <h1 className="h4 fw-bold mb-0">{isNew ? 'New item' : titleOf(item, schema)}</h1>
        </div>
        {!isNew && <a href={publicPath(collection, item)} target="_blank" rel="noopener" className="btn btn-outline-secondary d-inline-flex align-items-center gap-1">View on site <ExternalLink size={14} aria-hidden="true" /></a>}
      </div>
      {msg && <div className={`alert alert-${msg.type}`} role="alert">{msg.text}{errors.length > 0 && <ul className="mb-0 mt-2 small">{errors.map((er) => <li key={er}>{er}</li>)}</ul>}</div>}
      <div className="row g-4">
        <div className="col-xl-9">
          <div className="admin-card p-3 p-md-4">
            <Fields fields={schema.fields} value={item} onChange={(v) => { setItem(v); setDirty(true); }} />
          </div>
        </div>
        <div className="col-xl-3">
          <div className="admin-card p-3 position-sticky" style={{ top: 72 }}>
            <label htmlFor="meta-status" className="form-label fw-medium">Status</label>
            <select id="meta-status" className="form-select mb-3" value={meta._status} disabled={!publisher} onChange={(e) => { setMeta((m) => ({ ...m, _status: e.target.value })); setDirty(true); }}>
              <option value="published">Published</option><option value="draft">Draft (hidden)</option>
            </select>
            {!publisher && <p className="small text-muted-2">Only Publishers and Administrators can publish.</p>}
            <label htmlFor="meta-order" className="form-label fw-medium">Display order</label>
            <input id="meta-order" type="number" className="form-control mb-1" value={meta._order} min={-9999} max={9999} onChange={(e) => { setMeta((m) => ({ ...m, _order: Number(e.target.value) || 0 })); setDirty(true); }} />
            <p className="small text-muted-2">Lower numbers appear first.</p>
            <button type="submit" className="btn btn-primary w-100 d-inline-flex align-items-center justify-content-center gap-2" disabled={busy}>
              {busy ? <span className="spinner-border spinner-border-sm" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />} Save
            </button>
            {!isNew && publisher && <button type="button" className="btn btn-outline-danger w-100 mt-2 d-inline-flex align-items-center justify-content-center gap-2" onClick={remove}><Trash2 size={16} aria-hidden="true" /> Delete</button>}
          </div>
        </div>
      </div>
    </form>
  );
}
