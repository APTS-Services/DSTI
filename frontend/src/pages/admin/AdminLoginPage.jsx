// src/pages/admin/AdminLoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, LogIn, ShieldCheck, User } from 'lucide-react';
import { login } from '../../utils/adminAuth';
import { Emblem } from '../../components/common/Header';
import { useLanguage } from '../../i18n/LanguageContext';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    const user = login(username.trim(), password);
    if (user) {
      navigate('/admin');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-primary-800 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl dark:bg-neutral-900">
        <div className="flex flex-col items-center text-center">
          <Emblem className="h-14 w-14" />
          <h1 className="mt-3 text-xl font-extrabold text-neutral-900 dark:text-white">DSTI Content Management</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-300">Sign in to manage website content</p>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label-style" htmlFor="u">Username</label>
            <div className="relative">
              <User size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
              <input id="u" value={username} onChange={(e) => setUsername(e.target.value)} className="input-style pl-9" autoComplete="username" required />
            </div>
          </div>
          <div>
            <label className="label-style" htmlFor="p">Password</label>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
              <input id="p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-style pl-9" autoComplete="current-password" required />
            </div>
          </div>
          {error && <p role="alert" className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700">{error}</p>}
          <button type="submit" className="btn-primary w-full">
            <LogIn size={16} aria-hidden="true" /> Sign in
          </button>
        </form>

        <div className="mt-6 rounded-xl bg-neutral-50 p-4 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
          <p className="flex items-center gap-1.5 font-semibold"><ShieldCheck size={13} aria-hidden="true" /> Demo accounts</p>
          <ul className="mt-1.5 space-y-0.5">
            <li>Administrator — <code>admin / admin@123</code></li>
            <li>Editor — <code>editor / editor@123</code></li>
            <li>Publisher — <code>publisher / publish@123</code></li>
          </ul>
        </div>

        <Link to="/" className="mt-4 block text-center text-sm dst-link">{t('backHome')}</Link>
      </div>
    </div>
  );
}
