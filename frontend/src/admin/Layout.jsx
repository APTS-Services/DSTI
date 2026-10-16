import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { BarChart3, DatabaseBackup, ExternalLink, FolderOpen, History, Inbox, LayoutDashboard, LogOut, Menu, Settings, UserCog, UserRound } from 'lucide-react';
import { useSetting } from '../context/ContentContext';
import { DEFAULT_LOGO } from '../components/layout/Header';
import { can, useAdmin } from './AdminContext';

export default function Layout() {
  const { user, schemas, logout } = useAdmin();
  const site = useSetting('site');
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);

  const groups = {};
  Object.entries(schemas?.collections || {}).forEach(([key, c]) => { (groups[c.group] = groups[c.group] || []).push([key, c]); });

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${open ? 'open' : ''}`} aria-label="CMS navigation">
        <div className="brand"><img src={site.logo || DEFAULT_LOGO} alt="" /> <span>DSTI CMS</span></div>
        <nav>
          <NavLink to="/admin" end><LayoutDashboard size={16} aria-hidden="true" /> Dashboard</NavLink>
          {Object.entries(groups).map(([g, items]) => (
            <div key={g}>
              <div className="grp">{g}</div>
              {items.map(([key, c]) => <NavLink key={key} to={`/admin/c/${key}`}>{c.label}</NavLink>)}
            </div>
          ))}
          {schemas && Object.keys(schemas.settings).length > 0 && (
            <>
              <div className="grp">Settings</div>
              {Object.entries(schemas.settings).map(([key, s]) => <NavLink key={key} to={`/admin/settings/${key}`}><Settings size={15} aria-hidden="true" /> {s.label}</NavLink>)}
            </>
          )}
          <div className="grp">Administration</div>
          <NavLink to="/admin/media"><FolderOpen size={16} aria-hidden="true" /> Files & images</NavLink>
          {can(user, 'Administrator', 'Publisher') && <NavLink to="/admin/feedback"><Inbox size={16} aria-hidden="true" /> Feedback inbox</NavLink>}
          <NavLink to="/admin/analytics"><BarChart3 size={16} aria-hidden="true" /> Visitor statistics</NavLink>
          {can(user, 'Administrator') && (
            <>
              <NavLink to="/admin/users"><UserCog size={16} aria-hidden="true" /> Users & roles</NavLink>
              <NavLink to="/admin/audit"><History size={16} aria-hidden="true" /> Audit log</NavLink>
              <NavLink to="/admin/backup"><DatabaseBackup size={16} aria-hidden="true" /> Backup & restore</NavLink>
            </>
          )}
        </nav>
      </aside>
      {open && <button type="button" className="position-fixed top-0 start-0 w-100 h-100 border-0 bg-dark opacity-50 d-lg-none" style={{ zIndex: 1044 }} aria-label="Close menu" onClick={() => setOpen(false)} />}
      <div className="admin-main">
        <header className="admin-topbar d-flex align-items-center gap-2 px-3 py-2">
          <button type="button" className="btn btn-outline-secondary btn-icon d-lg-none" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={18} /></button>
          <a href="/" target="_blank" rel="noopener" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 ms-auto">View website <ExternalLink size={14} aria-hidden="true" /></a>
          <Link to="/admin/account" className="btn btn-sm btn-light d-inline-flex align-items-center gap-2"><UserRound size={15} aria-hidden="true" /> <span className="d-none d-sm-inline">{user.name}</span> <span className="badge text-bg-primary">{user.role}</span></Link>
          <button type="button" className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1" onClick={logout}><LogOut size={14} aria-hidden="true" /> Sign out</button>
        </header>
        <main id="main-content" className="p-3 p-lg-4">
          {!schemas ? <div className="skeleton" style={{ height: 200 }} /> : <Outlet />}
        </main>
      </div>
    </div>
  );
}
