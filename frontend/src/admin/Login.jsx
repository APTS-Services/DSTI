import React, { useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, LogIn } from 'lucide-react';
import { api, encryptSecret } from '../api/client';
import { useSetting } from '../context/ContentContext';
import Captcha from '../components/common/Captcha';
import { DEFAULT_LOGO } from '../components/layout/Header';
import { useAdmin } from './AdminContext';

export default function Login() {
  const { user, signedIn, expired } = useAdmin();
  const site = useSetting('site');
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [captcha, setCaptcha] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const capRef = useRef(null);

  if (user) return <Navigate to={user.mustChangePassword ? '/admin/change-password' : '/admin'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password || !captcha.trim()) {
      setError('Please enter your username, password and the security code.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const captchaId = capRef.current?.id;
      const enc = await encryptSecret(password, captchaId);
      const res = await api('/api/auth/login', { method: 'POST', body: { username: username.trim(), password: enc, captchaId, captcha } });
      setPassword('');
      signedIn(res.user, res.csrf);
      navigate(res.user.mustChangePassword ? '/admin/change-password' : (location.state?.from || '/admin'), { replace: true });
    } catch (err) {
      setError(err.message);
      setPassword('');
      capRef.current?.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="login-wrap">
      <div className="admin-card p-4 p-md-5 w-100" style={{ maxWidth: 440 }}>
        <div className="text-center mb-4">
          <img src={site.logo || DEFAULT_LOGO} alt="Government of Andhra Pradesh" width="72" height="72" />
          <h1 className="h4 fw-bold mt-3 mb-1">Content Management System</h1>
          <p className="text-muted-2 small mb-0">{site.name?.en || 'Department of Science, Technology & Innovation'}</p>
        </div>
        {expired && <div className="alert alert-warning small" role="status">Your session has ended. Please sign in again.</div>}
        {error && <div className="alert alert-danger small" role="alert">{error}</div>}
        <form onSubmit={submit} noValidate autoComplete="off">
          <div className="mb-3">
            <label htmlFor="u" className="form-label">Username</label>
            <input id="u" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={50} autoComplete="username" required autoFocus />
          </div>
          <div className="mb-3">
            <label htmlFor="p" className="form-label">Password</label>
            <div className="input-group">
              <input id="p" type={show ? 'text' : 'password'} className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} maxLength={64} autoComplete="off" required />
              <button type="button" className="btn btn-outline-secondary" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </div>
          <div className="mb-4"><Captcha ref={capRef} value={captcha} onChange={setCaptcha} id="login-captcha" /></div>
          <button type="submit" className="btn btn-primary w-100 d-inline-flex align-items-center justify-content-center gap-2" disabled={busy}>
            {busy ? <span className="spinner-border spinner-border-sm" aria-hidden="true" /> : <LogIn size={16} aria-hidden="true" />} Sign in
          </button>
        </form>
        <p className="small text-muted-2 mt-4 mb-0 d-flex gap-2"><Lock size={14} className="flex-shrink-0 mt-1" aria-hidden="true" /> Authorised Department staff only. All activity is logged. Accounts lock after 5 failed attempts.</p>
        <p className="text-center mt-3 mb-0"><Link to="/" className="small">← Back to website</Link></p>
      </div>
    </main>
  );
}
