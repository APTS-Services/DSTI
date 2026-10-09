// src/components/common/Header.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, Search, Sparkles, X } from 'lucide-react';
import { navItems, site } from '../../data/site';
import { useLanguage } from '../../i18n/LanguageContext';

export function Emblem({ className = 'h-11 w-11' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="DSTI emblem">
      <rect width="64" height="64" rx="12" fill="#24145c" />
      <circle cx="32" cy="25" r="6.5" fill="none" stroke="#a391ff" strokeWidth="2.6" />
      <ellipse cx="32" cy="25" rx="14" ry="5.6" fill="none" stroke="#ffbe6f" strokeWidth="2.2" />
      <ellipse cx="32" cy="25" rx="5.6" ry="15" fill="none" stroke="#ffbe6f" strokeWidth="2.2" transform="rotate(60 32 25)" />
      <ellipse cx="32" cy="25" rx="5.6" ry="15" fill="none" stroke="#ffbe6f" strokeWidth="2.2" transform="rotate(120 32 25)" />
      <text x="32" y="54" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="800" fill="#fff" textAnchor="middle">DSTI</text>
    </svg>
  );
}

export default function Header({ onOpenSearch, onOpenAssistant }) {
  const { t, tc } = useLanguage();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const closeTimer = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const isActiveSection = (item) =>
    item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);

  const openMenu = (key) => {
    clearTimeout(closeTimer.current);
    setOpenDropdown(key);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  return (
    <header className="sticky top-0 z-40 border-b-4 border-secondary-500 bg-gradient-to-r from-neutral-900 via-neutral-800 to-primary-700 text-white shadow-lg">
      <div className="dst-container flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
        <Link to="/" className="order-1 flex flex-shrink-0 items-center gap-3" aria-label={t('home')}>
          <Emblem />
          <span className="leading-tight">
            <span className="block max-w-[16rem] text-sm font-extrabold leading-tight tracking-tight sm:max-w-none sm:text-lg">
              {tc(site.name)}
            </span>
            <span className="block text-[0.68rem] font-medium text-primary-100 sm:text-xs">
              {tc(site.gov)}
            </span>
          </span>
        </Link>

        {/* Full navigation sits on its own row at desktop widths so the
            identity block and actions never force horizontal overflow. */}
        <nav className="order-3 hidden w-full items-center gap-0.5 border-t border-white/10 pt-2 xl:flex" aria-label="Primary">
          {navItems.map((item) => {
            const active = isActiveSection(item);
            const hasChildren = item.children?.length > 0;
            return (
              <div
                key={item.key}
                className="relative"
                onMouseEnter={() => hasChildren && openMenu(item.key)}
                onMouseLeave={scheduleClose}
              >
                <NavLink
                  to={item.to}
                  className={`flex items-center gap-1 rounded px-2.5 py-2 text-[0.82rem] font-semibold transition-colors ${
                    active ? 'bg-white/15 text-secondary-300' : 'text-neutral-50 hover:bg-white/10'
                  }`}
                  aria-haspopup={hasChildren ? 'true' : undefined}
                  aria-expanded={hasChildren ? openDropdown === item.key : undefined}
                >
                  {t(item.key)}
                  {hasChildren && <ChevronDown size={13} aria-hidden="true" />}
                </NavLink>

                {hasChildren && openDropdown === item.key && (
                  <div
                    className="absolute left-0 top-full z-50 min-w-[15rem] rounded-b-xl border border-neutral-100 bg-white py-2 shadow-xl"
                    role="menu"
                  >
                    {item.children.map((child) => (
                      <NavLink
                        key={child.key + child.to}
                        to={child.to}
                        role="menuitem"
                        className="block px-4 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-primary-50 hover:text-primary-700"
                      >
                        {t(child.key)}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="order-2 flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20"
            aria-label={t('search')}
          >
            <Search size={16} aria-hidden="true" />
            <span className="hidden lg:inline">{t('search')}</span>
          </button>
          <button
            type="button"
            onClick={onOpenAssistant}
            className="hidden items-center gap-1.5 rounded-lg bg-secondary-500 px-3 py-2 text-sm font-bold text-neutral-950 hover:bg-secondary-400 md:flex"
          >
            <Sparkles size={16} aria-hidden="true" />
            {t('askVigyanMitra')}
          </button>
          <button
            type="button"
            className="rounded-lg p-2 hover:bg-white/15 xl:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? t('closeMenu') : t('openMenu')}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="absolute inset-x-0 top-[calc(100%+4px)] z-40 max-h-[calc(100vh-4.5rem)] overflow-y-auto border-t border-white/10 bg-neutral-900 xl:hidden">
          <nav className="dst-container py-4" aria-label="Mobile">
            {navItems.map((item) => (
              <div key={item.key} className="border-b border-white/10 py-1">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `block rounded px-3 py-2.5 font-semibold ${isActive ? 'text-secondary-300' : 'text-white'}`
                  }
                >
                  {t(item.key)}
                </NavLink>
                {item.children?.length > 0 && (
                  <div className="mb-2 ml-3 flex flex-wrap gap-2">
                    {item.children.map((c) => (
                      <NavLink
                        key={c.key + c.to}
                        to={c.to}
                        className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-neutral-50 hover:bg-white/20"
                      >
                        {t(c.key)}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={onOpenAssistant}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-secondary-500 px-4 py-3 font-bold text-neutral-950"
            >
              <Sparkles size={18} aria-hidden="true" /> {t('askVigyanMitra')}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
