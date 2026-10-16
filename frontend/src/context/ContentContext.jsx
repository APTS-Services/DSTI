// Loads all published website content once from the CMS API and keeps it in
// sync (stale-while-revalidate: cached copy renders instantly, then refreshes).
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ContentContext = createContext(null);
const CACHE = 'dsti.content.v1';

const EMPTY = { collections: {}, settings: {} };

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function ContentProvider({ children }) {
  const [state, setState] = useState(() => {
    const cached = readCache();
    return { data: cached?.data || null, etag: cached?.etag || null, error: null };
  });

  const load = useCallback(async (etag) => {
    try {
      const res = await fetch('/api/public/content', { headers: etag ? { 'If-None-Match': etag } : {}, credentials: 'same-origin' });
      if (res.status === 304) return;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const next = { data, etag: res.headers.get('etag') };
      setState({ ...next, error: null });
      try {
        localStorage.setItem(CACHE, JSON.stringify(next));
      } catch {
        /* quota or private mode */
      }
    } catch (err) {
      setState((s) => ({ ...s, error: s.data ? null : err }));
    }
  }, []);

  useEffect(() => {
    load(state.etag);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => ({
    data: state.data || EMPTY,
    ready: Boolean(state.data),
    error: state.error,
    reload: () => load(null),
  }), [state, load]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export const useContent = () => useContext(ContentContext);
export const useCollection = (name) => useContext(ContentContext).data.collections[name] || [];
export const useSetting = (name) => useContext(ContentContext).data.settings[name] || {};
