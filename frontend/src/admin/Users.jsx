import React, { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api, encryptSecret, getCsrf } from '../api/client';
import { useAdmin } from './AdminContext';
import { POLICY } from './ChangePassword';

const BLANK = { username: '', full_name: '', email: '', role: 'Editor', is_active: true, password: '', unlock: false };

export default function Users() {
  const { user } = useAdmin();
  const [items, setItems] = useState(null);
  const [edit, setEdit] = useState(null);
  const [msg, setMsg] = useState(null);
  const load = useCallback(() => api('/api/admin/users').then((r) => setItems(r.items)).catch((e) => setMsg({ type: 'danger', text: e.message })), []);
  useEffect(() => { load(); }, [load]);

  const save = async (e) => {
    e.preventDefault();
    try {
      const body = { ...edit, is_active: Boolean(edit.is_active) };
      body.password = edit.password ? await encryptSecret(edit.password, getCsrf()) : undefined;
      if (edit.id) await api(`/api/admin/users/${edit.id}`, { method: 'PUT', body });
      else await api('/api/admin/users', { method: 'POST', body });
      setMsg({ type: 'success', text: edit.id ? 'User updated.' : 'User created. They must change the password at first sign-in.' });
      setEdit(null);
      load();
    } catch (err) {
      setMsg({ type: 'danger', text: err.message });
    }
  };
  const remove = async (u) => {
    if (!window.confirm(`Delete user ${u.username}?`)) return;
    await api(`/api/admin/users/${u.id}`, { method: 'DELETE' }).then(() => setMsg({ type: 'success', text: 'User deleted.' })).catch((e) => setMsg({ type: 'danger', text: e.message }));
    load();
  };
  const set = (k) => (e) => setEdit((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <>
      <div className="d-flex align-items-center mb-3">
        <h1 className="h3 fw-bold mb-0 me-auto">Users & roles</h1>
        <button type="button" className="btn btn-primary d-inline-flex align-items-center gap-1" onClick={() => setEdit({ ...BLANK })}><Plus size={16} aria-hidden="true" /> Add user</button>
      </div>
      <div className="row g-3 mb-3 small">
        {[['Administrator', 'Everything, including users, audit log, backups and system settings.'], ['Publisher', 'Create, edit, publish and delete content; feedback inbox; site settings.'], ['Editor', 'Create and edit content. New items are saved as drafts for a Publisher to publish.']].map(([r, d]) => (
          <div className="col-md-4" key={r}><div className="admin-card p-3 h-100"><strong>{r}</strong><p className="text-muted-2 mb-0">{d}</p></div></div>
        ))}
      </div>
      {msg && <div className={`alert alert-${msg.type} py-2`} role="status">{msg.text}</div>}
      {edit && (
        <form className="admin-card p-4 mb-3" onSubmit={save} noValidate>
          <h2 className="h5 fw-bold">{edit.id ? `Edit ${edit.username}` : 'New user'}</h2>
          <div className="row g-3">
            <div className="col-md-4"><label className="form-label" htmlFor="uu">Username</label><input id="uu" className="form-control" value={edit.username} onChange={set('username')} disabled={Boolean(edit.id)} maxLength={50} required /></div>
            <div className="col-md-4"><label className="form-label" htmlFor="un">Full name</label><input id="un" className="form-control" value={edit.full_name} onChange={set('full_name')} maxLength={120} required /></div>
            <div className="col-md-4"><label className="form-label" htmlFor="ue">E-mail</label><input id="ue" type="email" className="form-control" value={edit.email} onChange={set('email')} maxLength={160} /></div>
            <div className="col-md-4"><label className="form-label" htmlFor="ur">Role</label><select id="ur" className="form-select" value={edit.role} onChange={set('role')}><option>Administrator</option><option>Publisher</option><option>Editor</option></select></div>
            <div className="col-md-5"><label className="form-label" htmlFor="up">{edit.id ? 'Reset password (optional)' : 'Temporary password'}</label><input id="up" type="password" className="form-control" value={edit.password} onChange={set('password')} maxLength={64} autoComplete="new-password" /><div className="form-text">{POLICY}</div></div>
            <div className="col-md-3 d-flex flex-column justify-content-center gap-2">
              <div className="form-check form-switch"><input id="ua" className="form-check-input" type="checkbox" checked={Boolean(edit.is_active)} onChange={set('is_active')} /><label className="form-check-label" htmlFor="ua">Active</label></div>
              {edit.id && <div className="form-check"><input id="ul" className="form-check-input" type="checkbox" checked={edit.unlock} onChange={set('unlock')} /><label className="form-check-label" htmlFor="ul">Unlock account</label></div>}
            </div>
          </div>
          <div className="mt-3 d-flex gap-2"><button type="submit" className="btn btn-primary">Save</button><button type="button" className="btn btn-outline-secondary" onClick={() => setEdit(null)}>Cancel</button></div>
        </form>
      )}
      <div className="admin-card table-responsive">
        <table className="table align-middle mb-0">
          <thead className="table-light"><tr><th>User</th><th>Role</th><th>Status</th><th className="d-none d-md-table-cell">Last sign-in</th><th className="text-end">Actions</th></tr></thead>
          <tbody>
            {(items || []).map((u) => (
              <tr key={u.id}>
                <td><strong>{u.full_name}</strong><small className="d-block text-muted-2">{u.username}{u.email && ` · ${u.email}`}</small></td>
                <td><span className="badge text-bg-primary">{u.role}</span></td>
                <td>{u.is_active ? <span className="badge text-bg-success">Active</span> : <span className="badge text-bg-secondary">Disabled</span>} {u.locked_until && new Date(`${u.locked_until.replace(' ', 'T')}Z`) > new Date() && <span className="badge text-bg-danger">Locked</span>} {u.must_change_password ? <span className="badge text-bg-warning">Must change password</span> : null}</td>
                <td className="d-none d-md-table-cell small">{u.last_login_at || '—'}</td>
                <td className="text-end text-nowrap">
                  <button type="button" className="btn btn-sm btn-outline-primary me-1" onClick={() => setEdit({ ...BLANK, ...u, is_active: Boolean(u.is_active), password: '' })} aria-label="Edit"><Pencil size={14} /></button>
                  {u.id !== user.id && <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => remove(u)} aria-label="Delete"><Trash2 size={14} /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
