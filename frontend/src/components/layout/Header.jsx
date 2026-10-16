// Main header: single Government of Andhra Pradesh logo, simple menu with dropdowns,
// search and the "Ask Vigyan Mitra" call to action. Menu items come from the CMS.
import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, Search, X } from 'lucide-react';
import { useCollection, useSetting } from '../../context/ContentContext';
import { useLanguage } from '../../i18n/LanguageContext';

export const DEFAULT_LOGO = '/images/ap-govt-logo.svg';

function isActive(item, pathname) {
  const paths = [item.to, ...(item.children || []).map((c) => c.to)].map((p) => (p || '').split('?')[0]);
  return paths.some((p) => (p === '/' ? pathname === '/' : pathname === p || pathname.startsWith(`${p}/`)));
}

export default function Header({ onSearch, onAssistant }) {
  const { t, tc } = useLanguage();
  const site = useSetting('site');
  const nav = useCollection('navigation');
  const { pathname, search } = useLocation();
  const [open, setOpen] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const navRef = useRef(null);

  useEffect(() => {
    setOpen(null);
    setDrawer(false);
  }, [pathname, search]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(null);
        setDrawer(false);
      }
    };
    const onClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpen(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
  }, [drawer]);

  const name = tc(site.name) || t('siteName');

  return (
    <header className="site-header">
      <div className="container d-flex align-items-center gap-3 py-2" style={{ minHeight: 84 }}>
        <Link to="/" className="brand me-auto" aria-label={`${name} — ${t('home')}`}>
          <img src={site.logo || DEFAULT_LOGO} alt={tc(site.gov) || t('gov')} width="56" height="56" />
          <span className="d-flex flex-column">
            <span className="brand-title">{name}</span>
            <span className="brand-sub">{tc(site.gov) || t('gov')}</span>
          </span>
        </Link>

        <nav aria-label={t('menu')} className="d-none d-xxl-block" ref={navRef}>
          <ul className="nav-main list-unstyled d-flex align-items-center mb-0">
            {nav.map((item, i) => {
              const active = isActive(item, pathname);
              if (!item.children?.length) {
                return (
                  <li key={item.id}>
                    <NavLink to={item.to} end={item.to === '/'} className={active ? 'active' : ''}>{tc(item.label)}</NavLink>
                  </li>
                );
              }
              const isOpen = open === i;
              return (
                <li key={item.id} className="position-relative" onMouseEnter={() => setOpen(i)} onMouseLeave={() => setOpen(null)}>
                  <button type="button" className={active ? 'active' : ''} aria-expanded={isOpen} aria-haspopup="true" onClick={() => setOpen(isOpen ? null : i)}>
                    {tc(item.label)} <ChevronDown size={15} aria-hidden="true" />
                  </button>
                  <ul className={`dropdown-menu ${isOpen ? 'show' : ''}`} style={{ top: '100%', left: 0 }}>
                    {item.children.map((c) => (
                      <li key={c.to}>
                        <Link to={c.to} className={`dropdown-item ${pathname === c.to.split('?')[0] ? 'active' : ''}`}>{tc(c.label)}</Link>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </nav>

        <button type="button" className="btn btn-outline-secondary btn-icon" onClick={onSearch} aria-label={t('search')} title={t('search')}>
          <Search size={18} aria-hidden="true" />
        </button>
        <button type="button" className="btn btn-cta d-none d-md-inline-flex" onClick={onAssistant}>
          {tc(site.ctaLabel) || t('vigyanMitra')}
        </button>
        <button type="button" className="btn btn-dark btn-icon d-xxl-none" onClick={() => setDrawer(true)} aria-label={t('openMenu')} aria-expanded={drawer}>
          <Menu size={20} aria-hidden="true" />
        </button>
      </div>

      {drawer && (
        <div className="mobile-nav" role="dialog" aria-modal="true" aria-label={t('menu')} onClick={(e) => e.target === e.currentTarget && setDrawer(false)}>
          <div className="panel">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>{t('menu')}</strong>
              <button type="button" className="btn btn-outline-secondary btn-icon" onClick={() => setDrawer(false)} aria-label={t('closeMenu')} autoFocus>
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <nav aria-label={t('menu')}>
              {nav.map((item, i) => (item.children?.length ? (
                <div key={item.id}>
                  <button type="button" className="group-title" aria-expanded={expanded === i} onClick={() => setExpanded(expanded === i ? null : i)}>
                    {tc(item.label)} <ChevronDown size={16} aria-hidden="true" style={{ transform: expanded === i ? 'rotate(180deg)' : 'none' }} />
                  </button>
                  {expanded === i && (
                    <div className="sub py-1">
                      {item.children.map((c) => <Link key={c.to} to={c.to}>{tc(c.label)}</Link>)}
                    </div>
                  )}
                </div>
              ) : (
                <Link key={item.id} to={item.to} className="group-title text-decoration-none">{tc(item.label)}</Link>
              )))}
            </nav>
            <button type="button" className="btn btn-cta w-100 mt-3" onClick={() => { setDrawer(false); onAssistant(); }}>
              {tc(site.ctaLabel) || t('vigyanMitra')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
