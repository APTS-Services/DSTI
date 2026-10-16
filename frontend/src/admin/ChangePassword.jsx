import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { api, encryptSecret, getCsrf, setCsrf } from '../api/client';
import { useAdmin } from './AdminContext';

export const POLICY = '10–64 characters with upper- and lower-case letters, a digit and a special character. Must not contain your username or match your last 3 passwords.';

export function policyProblems(pw, username = '') {
  const p = [];
  if (pw.length < 10 || pw.length > 64) p.push('10–64 characters');
  if (!/[A-Z]/.test(pw)) p.push('an uppercase letter');
  if (!/[a-z]/.test(pw)) p.push('a lowercase letter');
  if (!/[0-9]/.test(pw)) p.push('a digit');
  if (!/[^A-Za-z0-9]/.test(pw)) p.push('a special character');
  if (username && pw.toLowerCase().includes(username.toLowerCase())) p.push('no username');
  return p;
}

export default function ChangePassword({ embedded = false }) {
  const { user, refresh, logout } = useAdmin();
  const navigate = useNavigate();
  const [f, setF] = useState({ current: '', next: '', confirm: '' });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  if (!user) return <Navigate to="/admin/login" replace />;

  const problems = policyProblems(f.next, user.username);
  const submit = async (e) => {
    e.preventDefault();
    if (problems.length) return setMsg({ type: 'danger', text: `New password needs: ${problems.join(', ')}.` });
    if (f.next !== f.confirm) return setMsg({ type: 'danger', text: 'The new passwords do not match.' });
    setBusy(true);
    try {
      const csrf = getCsrf();
      const res = await api('/api/auth/change-password', { method: 'POST', body: { currentPassword: await encryptSecret(f.current, csrf), newPassword: await encryptSecret(f.next, csrf) } });
      setCsrf(res.csrf);
      setF({ current: '', next: '', confirm: '' });
      await refresh();
      setMsg({ type: 'success', text: 'Your password has been changed.' });
      if (!embedded) navigate('/admin', { replace: true });
    } catch (err) {
      setMsg({ type: 'danger', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const form = (
    <form onSubmit={submit} noValidate>
      {msg && <div className={`alert alert-${msg.type} small`} role="alert">{msg.text}</div>}
      {[['current', 'Current password', 'current-password'], ['next', 'New password', 'new-password'], ['confirm', 'Confirm new password', 'new-password']].map(([k, l, ac]) => (
        <div className="mb-3" key={k}>
          <label htmlFor={`cp-${k}`} className="form-label">{l}</label>
          <input id={`cp-${k}`} type="password" className="form-control" value={f[k]} maxLength={64} autoComplete={ac} required onChange={(e) => setF((x) => ({ ...x, [k]: e.target.value }))} />
        </div>
      ))}
      <p className="small text-muted-2">{POLICY}</p>
      <button type="submit" className="btn btn-primary" disabled={busy}>{busy && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}Change password</button>
    </form>
  );

  if (embedded) {
    return (
      <div className="admin-card p-4" style={{ maxWidth: 560 }}>
        <h1 className="h4 fw-bold d-flex align-items-center gap-2"><KeyRound size={20} aria-hidden="true" /> My account</h1>
        <p className="text-muted-2 small">{user.name} · {user.role}</p>
        {form}
      </div>
    );
  }
  return (
    <main className="login-wrap">
      <div className="admin-card p-4 p-md-5 w-100" style={{ maxWidth: 480 }}>
        <h1 className="h4 fw-bold d-flex align-items-center gap-2"><KeyRound size={20} aria-hidden="true" /> Set a new password</h1>
        <p className="text-muted-2 small">{user.mustChangePassword ? 'For security, you must change your password before using the CMS.' : 'Change your password.'}</p>
        {form}
        <button type="button" className="btn btn-link px-0 mt-2" onClick={logout}>Sign out</button>
      </div>
    </main>
  );
}
