import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Eye, EyeOff, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { api, assetUrl } from '../api/client';
import { buildSections } from './adminNav';
import { useContent } from '../context/ContentContext';
import { can, useAdmin } from './AdminContext';
import { titleOf } from './FormFields';

export default function CollectionList() {
  const { collection } = useParams();
  const { user, schemas } = useAdmin();
  const { reload } = useContent();
  const schema = schemas.collections[collection];
  const [items, setItems] = useState(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [msg, setMsg] = useState(null);
  const publisher = can(user, 'Administrator', 'Publisher');

  const load = useCallback(() => {
    setItems(null);
    api(`/api/admin/content/${collection}`).then((r) => setItems(r.items)).catch((e) => setMsg({ type: 'danger', text: e.message }));
  }, [collection]);
  useEffect(() => { load(); setQ(''); setStatus(''); setMsg(null); }, [load]);

  const rows = useMemo(() => {
    if (!items) return [];
    const term = q.trim().toLowerCase();
    let list = items.filter((i) => (!status || i._status === status) && (!term || JSON.stringify(i).toLowerCase().includes(term)));
    if (schema?.sortField) list = [...list].sort((a, b) => String(b[schema.sortField] ?? '').localeCompare(String(a[schema.sortField] ?? ''), undefined, { numeric: true }));
    return list;
  }, [items, q, status, schema]);

  if (!schema) return <div className="alert alert-warning">Unknown section.</div>;
  const section = buildSections(schemas).find((s) => s.items.some((i) => i.collection === collection));
  const imageField = schema.fields.find((f) => f.type === 'image')?.name;
  const sortLabel = schema.fields.find((f) => f.name === schema.sortField)?.label || schema.sortField;

  const remove = async (item) => {
    if (!window.confirm(`Delete "${titleOf(item, schema)}"? This cannot be undone.`)) return;
    try {
      await api(`/api/admin/content/${collection}/${encodeURIComponent(item.id)}`, { method: 'DELETE' });
      setMsg({ type: 'success', text: 'Item deleted.' });
      load();
      reload();
    } catch (e) {
      setMsg({ type: 'danger', text: e.message });
    }
  };

  const toggle = async (item) => {
    const { id, _status, _order, _updatedAt, ...data } = item;
    try {
      await api(`/api/admin/content/${collection}/${encodeURIComponent(id)}`, { method: 'PUT', body: { ...data, _status: _status === 'published' ? 'draft' : 'published', _order } });
      load();
      reload();
    } catch (e) {
      setMsg({ type: 'danger', text: e.message });
    }
  };

  return (
    <>
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <div className="me-auto">
          <p className="small text-muted-2 mb-0">{section?.label || schema.group}</p>
          <h1 className="h3 fw-bold mb-0">{schema.label}</h1>
        </div>
        <Link to={`/admin/c/${collection}/new`} className="btn btn-primary d-inline-flex align-items-center gap-1"><Plus size={16} aria-hidden="true" /> Add new</Link>
      </div>
      {msg && <div className={`alert alert-${msg.type} py-2`} role="status">{msg.text}</div>}
      {!publisher && <div className="alert alert-info py-2 small">As an Editor, new items are saved as drafts. A Publisher or Administrator publishes them.</div>}
      <div className="admin-card">
        <div className="d-flex flex-wrap gap-2 p-3 border-bottom">
          <div className="input-group" style={{ maxWidth: 360 }}>
            <span className="input-group-text"><Search size={15} aria-hidden="true" /></span>
            <input type="search" className="form-control" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search items" />
          </div>
          <select className="form-select w-auto" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
            <option value="">All statuses</option><option value="published">Published</option><option value="draft">Draft</option>
          </select>
          <span className="ms-auto small text-muted-2 align-self-center">{rows.length} item(s)</span>
        </div>
        {!items ? <div className="p-4"><div className="skeleton" style={{ height: 120 }} /></div> : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light"><tr><th>Title</th>{schema.sortField && <th className="text-nowrap">{sortLabel}</th>}<th>Status</th><th className="d-none d-md-table-cell">Order</th><th className="d-none d-lg-table-cell">Updated</th><th className="text-end">Actions</th></tr></thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        {imageField && (item[imageField] ? <img src={assetUrl(item[imageField])} alt="" className="list-thumb" loading="lazy" /> : <span className="list-thumb" />)}
                        <div><Link to={`/admin/c/${collection}/${encodeURIComponent(item.id)}`} className="fw-medium">{titleOf(item, schema)}</Link><small className="d-block text-muted-2 font-monospace">{item.id}</small></div>
                      </div>
                    </td>
                    {schema.sortField && <td className="text-nowrap small">{String(item[schema.sortField] ?? '')}</td>}
                    <td><span className={`badge ${item._status === 'published' ? 'text-bg-success' : 'text-bg-warning'}`}>{item._status}</span></td>
                    <td className="d-none d-md-table-cell small">{item._order}</td>
                    <td className="d-none d-lg-table-cell small text-muted-2 text-nowrap">{item._updatedAt?.slice(0, 16)}</td>
                    <td className="text-end text-nowrap">
                      {publisher && <button type="button" className="btn btn-sm btn-outline-secondary me-1" onClick={() => toggle(item)} title={item._status === 'published' ? 'Unpublish' : 'Publish'} aria-label={item._status === 'published' ? 'Unpublish' : 'Publish'}>{item._status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}</button>}
                      <Link to={`/admin/c/${collection}/${encodeURIComponent(item.id)}`} className="btn btn-sm btn-outline-primary me-1" aria-label="Edit"><Pencil size={14} /></Link>
                      {publisher && <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => remove(item)} aria-label="Delete"><Trash2 size={14} /></button>}
                    </td>
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan={schema.sortField ? 6 : 5} className="text-center text-muted-2 py-4">No items found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
