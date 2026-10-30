// Main header: Government of Andhra Pradesh emblem and Department name, a short
// menu of six groups with descriptive drop-downs, search, and a mobile drawer.
// Menu items come from the CMS (Site > Main menu).
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ChevronDown, Menu, MessageCircleQuestion, Phone, Search, X } from 'lucide-react';
import { useCollection, useSetting } from '../../context/ContentContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { assetUrl } from '../../api/client';

export const DEFAULT_LOGO = '/images/ap-govt-logo.svg';

const base = (to) => (to || '').split(/[?#]/)[0];

function isActive(item, pathname) {
  const paths = [item.to, ...(item.children || []).map((c) => c.to)].map(base).filter(Boolean);
  return paths.some((p) => (p === '/' ? pathname === '/' : pathname === p || pathname.startsWith(`${p}/`)));
}

function LanguageToggle({ className = '' }) {
  const { lang, setLang } = useLanguage();
  const next = lang === 'en' ? 'te' : 'en';
  return (
    <button type="button" className={`btn-lang ${className}`} lang={next} onClick={() => setLang(next)} title={next === 'te' ? 'తెలుగులో చూడండి' : 'View in English'}>
      {next === 'te' ? 'తెలుగు' : 'English'}
    </button>
  );
}

export default function Header({ onSearch, onAssistant }) {
  const { t, tc } = useLanguage();
  const site = useSetting('site');
  const contact = useSetting('contact');
  const nav = useCollection('navigation');
  const { pathname, search, hash } = useLocation();
  const [open, setOpen] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const navRef = useRef(null);
  const closeTimer = useRef(null);

  useEffect(() => {
    setOpen(null);
    setDrawer(false);
  }, [pathname, search, hash]);

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
    if (drawer) setExpanded(nav.findIndex((item) => isActive(item, pathname)));
    return () => { document.body.style.overflow = ''; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawer]);

  // A short delay before closing lets the pointer travel from the menu label
  // into its panel without the panel disappearing.
  const hoverOpen = (i) => {
    clearTimeout(closeTimer.current);
    setOpen(i);
  };
  const hoverClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 160);
  };

  const name = tc(site.name) || t('siteName');
  const gov = tc(site.gov) || t('gov');

  return (
    <header className="site-header">
      <div className="container d-flex align-items-center gap-2 gap-md-3 header-bar">
        <Link to="/" className="brand me-auto" aria-label={`${name} — ${t('home')}`}>
          <img src={assetUrl(site.logo) || DEFAULT_LOGO} alt={gov} width="58" height="58" />
          <span className="d-flex flex-column">
            <span className="brand-title">{name}</span>
            <span className="brand-sub">{gov}</span>
          </span>
        </Link>

        <nav aria-label={t('menu')} className="d-none d-xl-block" ref={navRef}>
          <ul className="nav-main list-unstyled d-flex align-items-center mb-0">
            {nav.map((item, i) => {
              const active = isActive(item, pathname);
              if (!item.children?.length) {
                return (
                  <li key={item.id}>
                    <Link to={item.to} className={`nav-top ${active ? 'active' : ''}`} aria-current={active ? 'page' : undefined}>{tc(item.label)}</Link>
                  </li>
                );
              }
              const isOpen = open === i;
              const wide = item.children.length > 6;
              return (
                <li key={item.id} className="position-relative" onMouseEnter={() => hoverOpen(i)} onMouseLeave={hoverClose}
                  onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(null); }}>
                  <button type="button" className={`nav-top ${active ? 'active' : ''}`} aria-expanded={isOpen} aria-controls={`menu-${item.id}`} onClick={() => setOpen(isOpen ? null : i)}>
                    {tc(item.label)} <ChevronDown size={15} aria-hidden="true" className="chev" />
                  </button>
                  <div id={`menu-${item.id}`} className={`mega ${wide ? 'wide' : ''} ${isOpen ? 'show' : ''} ${i >= Math.floor(nav.length / 2) ? 'align-end' : ''}`}>
                    {tc(item.blurb) && (
                      <div className="mega-head">
                        <p className="mb-1">{tc(item.blurb)}</p>
                        <Link to={item.to} className="mega-overview">{tc(item.label)} <ArrowRight size={14} aria-hidden="true" /></Link>
                      </div>
                    )}
                    <ul className="list-unstyled mb-0 mega-list">
                      {item.children.map((c) => {
                        const current = pathname === base(c.to) && (!c.to.includes('?') || `${pathname}${search}` === c.to);
                        return (
                          <li key={c.to}>
                            <Link to={c.to} className={current ? 'active' : ''} aria-current={current ? 'page' : undefined}>
                              <span className="mega-label">{tc(c.label)}</span>
                              {tc(c.desc) && <span className="mega-desc">{tc(c.desc)}</span>}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        <button type="button" className="btn-round" onClick={onSearch} aria-label={t('search')} title={t('search')}>
          <Search size={18} aria-hidden="true" />
        </button>
        <button type="button" className="btn-round btn-round-dark d-xl-none" onClick={() => setDrawer(true)} aria-label={t('openMenu')} aria-expanded={drawer}>
          <Menu size={20} aria-hidden="true" />
        </button>
      </div>

      {/* Rendered in <body>: the sticky header is its own stacking context. */}
      {drawer && createPortal((
        <div className="mobile-nav" role="dialog" aria-modal="true" aria-label={t('menu')} onClick={(e) => e.target === e.currentTarget && setDrawer(false)}>
          <div className="panel">
            <div className="panel-head">
              <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none text-body" onClick={() => setDrawer(false)}>
                <img src={assetUrl(site.logo) || DEFAULT_LOGO} alt="" width="40" height="40" />
                <strong className="small lh-sm">{name}</strong>
              </Link>
              <button type="button" className="btn-round" onClick={() => setDrawer(false)} aria-label={t('closeMenu')} autoFocus>
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="d-flex gap-2 my-3">
              <button type="button" className="btn btn-outline-secondary flex-grow-1 d-inline-flex align-items-center justify-content-center gap-2" onClick={() => { setDrawer(false); onSearch(); }}>
                <Search size={16} aria-hidden="true" /> {t('search')}
              </button>
              <LanguageToggle className="btn btn-outline-secondary" />
            </div>
            <nav aria-label={t('menu')}>
              <Link to="/" className={`group-title ${pathname === '/' ? 'active' : ''}`}>{t('home')}</Link>
              {nav.map((item, i) => (item.children?.length ? (
                <div key={item.id} className="group">
                  <button type="button" className={`group-title ${isActive(item, pathname) ? 'active' : ''}`} aria-expanded={expanded === i} onClick={() => setExpanded(expanded === i ? null : i)}>
                    {tc(item.label)} <ChevronDown size={18} aria-hidden="true" style={{ transform: expanded === i ? 'rotate(180deg)' : 'none' }} />
                  </button>
                  {expanded === i && (
                    <div className="sub">
                      {item.children.map((c) => <Link key={c.to} to={c.to} className={pathname === base(c.to) ? 'active' : ''}>{tc(c.label)}</Link>)}
                    </div>
                  )}
                </div>
              ) : (
                <Link key={item.id} to={item.to} className={`group-title ${isActive(item, pathname) ? 'active' : ''}`}>{tc(item.label)}</Link>
              )))}
            </nav>
            <div className="panel-foot">
              <button type="button" className="btn btn-primary w-100 d-inline-flex align-items-center justify-content-center gap-2" onClick={() => { setDrawer(false); onAssistant(); }}>
                <MessageCircleQuestion size={18} aria-hidden="true" /> {tc(site.ctaLabel) || t('vigyanMitra')}
              </button>
              {contact.phone && <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="d-flex align-items-center justify-content-center gap-2 mt-3 small"><Phone size={14} aria-hidden="true" /> {contact.phone}</a>}
            </div>
          </div>
        </div>
      ), document.body)}
    </header>
  );
}

export { LanguageToggle };
