// Authentication state and CMS schemas for the admin area.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, onUnauthorized, setCsrf } from '../api/client';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [state, setState] = useState({ loading: true, user: null, expired: false });
  const [schemas, setSchemas] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const res = await api('/api/auth/me');
      setCsrf(res.user ? res.csrf : null);
      setState({ loading: false, user: res.user || null, expired: false });
    } catch {
      setCsrf(null);
      setState({ loading: false, user: null, expired: false });
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => onUnauthorized(() => {
    setCsrf(null);
    setSchemas(null);
    setState({ loading: false, user: null, expired: true });
  }), []);

  useEffect(() => {
    if (state.user && !state.user.mustChangePassword && !schemas) {
      api('/api/admin/schemas').then(setSchemas).catch(() => {});
    }
  }, [state.user, schemas]);

  const signedIn = useCallback((user, csrf) => {
    setCsrf(csrf);
    setSchemas(null);
    setState({ loading: false, user, expired: false });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } catch {
      /* already signed out */
    }
    setCsrf(null);
    setSchemas(null);
    setState({ loading: false, user: null, expired: false });
  }, []);

  const value = useMemo(() => ({ ...state, schemas, signedIn, logout, refresh }), [state, schemas, signedIn, logout, refresh]);
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export const useAdmin = () => useContext(AdminContext);
export const can = (user, ...roles) => Boolean(user && roles.includes(user.role));
