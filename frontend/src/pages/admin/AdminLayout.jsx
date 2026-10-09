// src/pages/admin/AdminLayout.jsx
import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3, CalendarDays, FileText, Home, Inbox, LogOut, Megaphone, Newspaper, ScrollText,
} from 'lucide-react';
import { Emblem } from '../../components/common/Header';
import { getRole, getUserName, isAuthed, logout } from '../../utils/adminAuth';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: BarChart3, end: true },
  { to: '/admin/tenders', label: 'Tenders', icon: FileText },
  { to: '/admin/documents', label: 'Documents', icon: ScrollText },
  { to: '/admin/news', label: 'News & Updates', icon: Newspaper },
  { to: '/admin/events', label: 'Events', icon: CalendarDays },
  { to: '/admin/feedback', label: 'Feedback Inbox', icon: Inbox },
  { to: '/admin/analytics', label: 'Visitor Analytics', icon: Megaphone },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  if (!isAuthed()) {
    return (
      <div className="dst-container flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-semibold text-neutral-900 dark:text-white">Please sign in to access the CMS.</p>
        <Link to="/admin/login" className="btn-primary mt-4">Sign in</Link>
      </div>
    );
  }

  const onLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-6 lg:flex-row">
        {/* Sidebar */}
        <aside className="lg:w-64 lg:flex-shrink-0">
          <div className="rounded-xl bg-gradient-to-br from-neutral-900 to-primary-800 p-4 text-white">
            <div className="flex items-center gap-3">
              <Emblem className="h-10 w-10" />
              <div>
                <p className="text-sm font-extrabold">DSTI CMS</p>
                <p className="text-[0.7rem] text-primary-100">Content Management</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-white/10 p-3">
              <p className="text-xs font-semibold">{getUserName()}</p>
              <p className="text-[0.7rem] text-primary-100">{getRole()}</p>
            </div>
          </div>

          <nav className="mt-4 space-y-1" aria-label="CMS">
            {LINKS.map((l) => {
              const Icon = l.icon;
              return (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-900'
                    }`
                  }
                >
                  <Icon size={17} aria-hidden="true" /> {l.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-4 space-y-1 border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-900">
              <Home size={17} aria-hidden="true" /> View website
            </Link>
            <button type="button" onClick={onLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-danger-600 hover:bg-danger-50 dark:hover:bg-neutral-900">
              <LogOut size={17} aria-hidden="true" /> Sign out
            </button>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
