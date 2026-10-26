// Renders CMS form fields from the server-provided schema.
import React, { useState } from 'react';
import { ArrowDown, ArrowUp, FileText, Plus, Trash2, Upload } from 'lucide-react';
import { api, assetUrl } from '../api/client';
import { useAdmin } from './AdminContext';

export function emptyValue(field) {
  switch (field.type) {
    case 'bi': case 'bitext': return { en: '', te: '' };
    case 'bilist': case 'list': case 'repeater': return [];
    case 'bool': return false;
    case 'number': return '';
    case 'select': return field.options[0];
    default: return '';
  }
}

export const emptyItem = (fields) => Object.fromEntries(fields.map((f) => [f.name, emptyValue(f)]));

export function titleOf(item, schema) {
  const v = item?.[schema.titleField];
  if (v && typeof v === 'object') return v.en || v.te || '(untitled)';
  return v || item?.id || '(untitled)';
}

function move(arr, i, d) {
  const next = [...arr];
  const j = i + d;
  if (j < 0 || j >= next.length) return next;
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

function Upload1({ value, onChange, accept, image, id }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setErr('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await api('/api/admin/uploads', { method: 'POST', form });
      onChange(res.url);
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div>
      <div className="input-group">
        <input id={id} className="form-control" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="/uploads/…" maxLength={300} />
        <label className="btn btn-outline-primary d-inline-flex align-items-center gap-1 mb-0">
          {busy ? <span className="spinner-border spinner-border-sm" aria-hidden="true" /> : <Upload size={14} aria-hidden="true" />} Upload
          <input type="file" accept={accept} className="d-none" onChange={pick} />
        </label>
        {value && <button type="button" className="btn btn-outline-secondary" onClick={() => onChange('')}>Clear</button>}
      </div>
      {err && <div className="text-danger small mt-1">{err}</div>}
      {value && (image ? <img src={assetUrl(value)} alt="" className="mt-2 rounded border" style={{ maxHeight: 90, maxWidth: 200, objectFit: 'contain' }} />
        : <a href={assetUrl(value)} target="_blank" rel="noopener" className="small d-inline-flex align-items-center gap-1 mt-1"><FileText size={13} aria-hidden="true" /> Open file</a>)}
    </div>
  );
}

function BiInputs({ value, onChange, long, id, required }) {
  const v = value || { en: '', te: '' };
  const Tag = long ? 'textarea' : 'input';
  return (
    <div className="row g-2">
      {['en', 'te'].map((l) => (
        <div className="col-md-6" key={l}>
          <span className="lang-tag">{l === 'en' ? 'ENGLISH' : 'TELUGU / తెలుగు'}</span>
          <Tag id={l === 'en' ? id : `${id}-te`} className="form-control" rows={long ? 4 : undefined} value={v[l] || ''} lang={l}
            maxLength={long ? 5000 : 500} required={required && l === 'en'} aria-label={l === 'te' ? 'Telugu' : undefined}
            onChange={(e) => onChange({ ...v, [l]: e.target.value })} />
        </div>
      ))}
    </div>
  );
}

function BiList({ value, onChange }) {
  const list = Array.isArray(value) ? value : [];
  return (
    <div className="d-grid gap-2">
      {list.map((row, i) => (
        <div key={i} className="field-group p-2">
          <div className="d-flex justify-content-between mb-1">
            <span className="small text-muted-2">#{i + 1}</span>
            <Controls i={i} n={list.length} onMove={(d) => onChange(move(list, i, d))} onRemove={() => onChange(list.filter((_, k) => k !== i))} />
          </div>
          <BiInputs value={row} long onChange={(v) => onChange(list.map((x, k) => (k === i ? v : x)))} id={`bl-${i}`} />
        </div>
      ))}
      <button type="button" className="btn btn-sm btn-outline-primary justify-self-start d-inline-flex align-items-center gap-1" style={{ justifySelf: 'start' }} onClick={() => onChange([...list, { en: '', te: '' }])}><Plus size={14} aria-hidden="true" /> Add line</button>
    </div>
  );
}

function Controls({ i, n, onMove, onRemove }) {
  return (
    <div className="btn-group btn-group-sm">
      <button type="button" className="btn btn-outline-secondary" disabled={i === 0} onClick={() => onMove(-1)} aria-label="Move up"><ArrowUp size={13} /></button>
      <button type="button" className="btn btn-outline-secondary" disabled={i === n - 1} onClick={() => onMove(1)} aria-label="Move down"><ArrowDown size={13} /></button>
      <button type="button" className="btn btn-outline-danger" onClick={onRemove} aria-label="Remove"><Trash2 size={13} /></button>
    </div>
  );
}

/**
 * Link picker for menu entries: choose a published page or an app section, or
 * fall back to a free-text field for an external address. The values come from
 * GET /api/admin/schemas (linkTargets), and the server rejects anything that
 * does not resolve, so a dead menu link cannot be published.
 */
function RoutePicker({ id, value, onChange }) {
  const { schemas } = useAdmin();
  const [custom, setCustom] = useState(false);
  const targets = schemas?.linkTargets || { routes: [], pages: [] };
  const pages = targets.pages || [];
  const routes = targets.routes || [];
  const known = [...pages, ...routes].some((t) => t.path === value);
  const editing = custom || Boolean(value && !known);

  return (
    <>
      <select
        id={id}
        className="form-select"
        value={editing ? '__custom' : value || ''}
        onChange={(e) => {
          const next = e.target.value;
          if (next === '__custom') {
            setCustom(true);
            return;
          }
          setCustom(false);
          onChange(next);
        }}
      >
        <option value="">— none —</option>
        {pages.length > 0 && (
          <optgroup label="Pages">
            {pages.map((page) => <option key={page.id} value={page.path}>{page.title}</option>)}
          </optgroup>
        )}
        <optgroup label="Site sections">
          {routes.map((route) => <option key={route.path} value={route.path}>{route.label}</option>)}
        </optgroup>
        <option value="__custom">Other / external link…</option>
      </select>
      {editing && (
        <input
          className="form-control mt-2 font-monospace"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/path or https://…"
          maxLength={500}
          aria-label="Link URL"
        />
      )}
    </>
  );
}

function Repeater({ field, value, onChange }) {
  const list = Array.isArray(value) ? value : [];
  return (
    <div className="d-grid gap-2">
      {list.map((row, i) => (
        <div key={i} className="field-group">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <strong className="small">{field.label} #{i + 1}</strong>
            <Controls i={i} n={list.length} onMove={(d) => onChange(move(list, i, d))} onRemove={() => onChange(list.filter((_, k) => k !== i))} />
          </div>
          <Fields fields={field.fields} value={row} onChange={(v) => onChange(list.map((x, k) => (k === i ? v : x)))} prefix={`${field.name}-${i}`} />
        </div>
      ))}
      <button type="button" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1" style={{ justifySelf: 'start' }} onClick={() => onChange([...list, emptyItem(field.fields)])}><Plus size={14} aria-hidden="true" /> Add {field.label.toLowerCase()}</button>
    </div>
  );
}

function Field({ field, value, onChange, id }) {
  switch (field.type) {
    case 'bi': return <BiInputs id={id} value={value} onChange={onChange} required={field.required} />;
    case 'bitext': return <BiInputs id={id} value={value} onChange={onChange} long required={field.required} />;
    case 'bilist': return <BiList value={value} onChange={onChange} />;
    case 'repeater': return <Repeater field={field} value={value} onChange={onChange} />;
    case 'list': return (
      <>
        <textarea id={id} className="form-control" rows={3} value={(Array.isArray(value) ? value : []).join('\n')} onChange={(e) => onChange(e.target.value.split('\n'))} />
        <div className="form-text">One per line.</div>
      </>
    );
    case 'textarea': return <textarea id={id} className="form-control" rows={4} value={value || ''} onChange={(e) => onChange(e.target.value)} maxLength={5000} />;
    case 'bool': return (
      <div className="form-check form-switch">
        <input id={id} className="form-check-input" type="checkbox" role="switch" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
        <label className="form-check-label" htmlFor={id}>{value ? 'Yes' : 'No'}</label>
      </div>
    );
    case 'select': return (
      <select id={id} className="form-select" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        {field.options.map((o) => <option key={o} value={o}>{o || '— none —'}</option>)}
      </select>
    );
    case 'number': return <input id={id} type="number" className="form-control" value={value ?? ''} min={field.min} max={field.max} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} />;
    case 'date': return <input id={id} type="date" className="form-control" value={value || ''} onChange={(e) => onChange(e.target.value)} />;
    case 'color': return <input id={id} type="color" className="form-control form-control-color" value={value || '#0b3d91'} onChange={(e) => onChange(e.target.value)} />;
    case 'file': return <Upload1 id={id} value={value} onChange={onChange} accept=".pdf,.mp4,application/pdf,video/mp4" />;
    case 'image': return <Upload1 id={id} value={value} onChange={onChange} accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp" image />;
    case 'email': return <input id={id} type="email" className="form-control" value={value || ''} onChange={(e) => onChange(e.target.value)} maxLength={160} />;
    case 'url': return <input id={id} className="form-control" value={value || ''} onChange={(e) => onChange(e.target.value)} maxLength={500} placeholder="/page-path or https://…" />;
    case 'route': return <RoutePicker id={id} value={value} onChange={onChange} />;
    case 'slug': return <input id={id} className="form-control font-monospace" value={value || ''} onChange={(e) => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} maxLength={64} />;
    default: return <input id={id} className="form-control" value={value ?? ''} onChange={(e) => onChange(e.target.value)} maxLength={field.max || 300} />;
  }
}

const WIDE = new Set(['bi', 'bitext', 'bilist', 'repeater', 'list', 'textarea', 'file', 'image']);

export default function Fields({ fields, value, onChange, prefix = 'f' }) {
  const v = value || {};
  return (
    <div className="row g-3">
      {fields.map((field) => {
        const id = `${prefix}-${field.name}`;
        return (
          <div key={field.name} className={WIDE.has(field.type) ? 'col-12' : 'col-md-6'}>
            <label htmlFor={id} className="form-label fw-medium">{field.label}{field.required && <span className="text-danger"> *</span>}</label>
            <Field field={field} id={id} value={v[field.name]} onChange={(nv) => onChange({ ...v, [field.name]: nv })} />
          </div>
        );
      })}
    </div>
  );
}
