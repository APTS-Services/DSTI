import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ChevronDown, ExternalLink, LayoutDashboard, LogOut, Menu, Search, UserRound, X } from 'lucide-react';
import { useSetting } from '../context/ContentContext';
import { DEFAULT_LOGO } from '../components/layout/Header';
import { can, useAdmin } from './AdminContext';
import { assetUrl, api } from '../api/client';
import { ADMIN_TOOLS, FEEDBACK_LINK, buildSections } from './adminNav';

const STORE = 'dsti.cms.open';

function readOpen() {
  try {
    return JSON.parse(sessionStorage.getItem(STORE) || '{}') || {};
  } catch {
    return {};
  }
}

export default function Layout() {
  const { user, schemas, logout } = useAdmin();
  const site = useSetting('site');
  const [drawer, setDrawer] = useState(false);
  const [query, setQuery] = useState('');
  const [openGroups, setOpenGroups] = useState(readOpen);
  const [unread, setUnread] = useState(0);
  const { pathname } = useLocation();
  const sections = useMemo(() => buildSections(schemas), [schemas]);
  const allowed = (link) => !link.roles || can(user, ...link.roles);

  useEffect(() => setDrawer(false), [pathname]);
  useEffect(() => {
    try { sessionStorage.setItem(STORE, JSON.stringify(openGroups)); } catch { /* storage unavailable */ }
  }, [openGroups]);
  // The section holding the current page is always open.
  useEffect(() => {
    const current = sections.find((s) => s.items.some((i) => pathname === i.to || pathname.startsWith(`${i.to}/`)));
    if (current && !openGroups[current.id]) setOpenGroups((g) => ({ ...g, [current.id]: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, sections]);
  useEffect(() => {
    if (!allowed(FEEDBACK_LINK)) return;
    api('/api/admin/dashboard').then((d) => setUnread(d?.feedback?.unread || 0)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const term = query.trim().toLowerCase();
  const filtered = term
    ? sections.map((s) => ({ ...s, items: s.items.filter((i) => `${i.label} ${s.label}`.toLowerCase().includes(term)) })).filter((s) => s.items.length)
    : sections;
  const tools = ADMIN_TOOLS.filter(allowed).filter((l) => !term || l.label.toLowerCase().includes(term));

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${drawer ? 'open' : ''}`} aria-label="CMS navigation">
        <div className="brand">
          <img src={assetUrl(site.logo) || DEFAULT_LOGO} alt="" />
          <span><strong>DSTI CMS</strong><small>Website management</small></span>
          <button type="button" className="btn btn-sm text-white ms-auto d-lg-none" onClick={() => setDrawer(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <div className="side-search">
          <Search size={14} aria-hidden="true" />
          <input type="search" placeholder="Find a section…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Find a CMS section" />
        </div>
        <nav>
          <NavLink to="/admin" end className="side-link"><LayoutDashboard size={17} aria-hidden="true" /> Dashboard</NavLink>
          {allowed(FEEDBACK_LINK) && (!term || 'feedback inbox'.includes(term)) && (
            <NavLink to={FEEDBACK_LINK.to} className="side-link"><FEEDBACK_LINK.icon size={17} aria-hidden="true" /> Feedback {unread > 0 && <span className="side-badge">{unread}</span>}</NavLink>
          )}
          <div className="side-label">Website content</div>
          {filtered.map((s) => {
            const open = Boolean(term) || openGroups[s.id];
            const Icon = s.icon;
            return (
              <div key={s.id} className="side-group">
                <button type="button" className="side-link" aria-expanded={open} onClick={() => setOpenGroups((g) => ({ ...g, [s.id]: !g[s.id] }))}>
                  <Icon size={17} aria-hidden="true" /> {s.label} <ChevronDown size={15} className="ms-auto chev" aria-hidden="true" />
                </button>
                {open && (
                  <div className="side-sub">
                    {s.items.map((i) => <NavLink key={i.key} to={i.to}>{i.label}</NavLink>)}
                  </div>
                )}
              </div>
            );
          })}
          {tools.length > 0 && <div className="side-label">Administration</div>}
          {tools.map((l) => <NavLink key={l.to} to={l.to} className="side-link"><l.icon size={17} aria-hidden="true" /> {l.label}</NavLink>)}
          {term && !filtered.length && !tools.length && <p className="small px-3 text-white-50">Nothing matches “{query}”.</p>}
        </nav>
      </aside>
      {drawer && <button type="button" className="admin-backdrop d-lg-none" aria-label="Close menu" onClick={() => setDrawer(false)} />}
      <div className="admin-main">
        <header className="admin-topbar d-flex align-items-center gap-2 px-3 px-lg-4">
          <button type="button" className="btn btn-outline-secondary btn-icon d-lg-none" onClick={() => setDrawer(true)} aria-label="Open menu"><Menu size={18} /></button>
          <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 ms-auto">View website <ExternalLink size={14} aria-hidden="true" /></a>
          <Link to="/admin/account" className="btn btn-sm btn-light d-inline-flex align-items-center gap-2" title="My account and password">
            <UserRound size={15} aria-hidden="true" /> <span className="d-none d-sm-inline">{user.name}</span> <span className="badge text-bg-primary">{user.role}</span>
          </Link>
          <button type="button" className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1" onClick={logout}><LogOut size={14} aria-hidden="true" /> <span className="d-none d-sm-inline">Sign out</span></button>
        </header>
        <main id="main-content" className="admin-content">
          {!schemas ? <div className="skeleton" style={{ height: 200 }} /> : <Outlet />}
        </main>
      </div>
    </div>
  );
}
