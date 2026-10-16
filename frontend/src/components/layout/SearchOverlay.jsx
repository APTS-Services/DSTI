import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { search } from '../../utils/searchIndex';

export default function SearchOverlay({ open, onClose }) {
  const { t, tc, lang } = useLanguage();
  const { data } = useContent();
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const results = useMemo(() => (q.trim().length > 1 ? search(data, q, { limit: 8, lang }) : []), [data, q, lang]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.activeElement;
    inputRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    onClose();
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="overlay search" role="dialog" aria-modal="true" aria-label={t('search')} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <form onSubmit={submit} className="d-flex align-items-center gap-2 p-3 border-bottom">
          <Search size={20} aria-hidden="true" className="text-muted-2" />
          <label htmlFor="site-search" className="visually-hidden">{t('search')}</label>
          <input ref={inputRef} id="site-search" type="search" className="form-control border-0 shadow-none fs-5" placeholder={t('searchPlaceholder')} value={q} onChange={(e) => setQ(e.target.value)} maxLength={120} autoComplete="off" />
          <button type="button" className="btn btn-outline-secondary btn-icon" onClick={onClose} aria-label={t('closeMenu')}><X size={18} aria-hidden="true" /></button>
        </form>
        <div className="overflow-auto p-2">
          {q.trim().length > 1 && results.length === 0 && <p className="text-muted-2 p-3 mb-0">{t('noResults')}</p>}
          <ul className="list-unstyled mb-0">
            {results.map((r) => (
              <li key={r.id}>
                <Link to={r.path} onClick={onClose} className="d-block p-3 rounded-3 text-decoration-none text-body search-hit">
                  <span className="pill me-2">{t(`type_${r.type}`)}</span>
                  <strong>{tc(r.titleObj)}</strong>
                  <small className="d-block text-muted-2 mt-1">{r.snippet}</small>
                </Link>
              </li>
            ))}
          </ul>
          {results.length > 0 && (
            <div className="p-2"><button type="button" className="btn btn-primary" onClick={submit}>{t('searchAll')}</button></div>
          )}
        </div>
      </div>
    </div>
  );
}
