// Anonymous page-view counter (no cookies, no personal data).
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { apiUrl } from '../api/client';

export default function usePageTracking() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname.startsWith('/admin')) return;
    let newVisitor = false;
    try {
      if (!sessionStorage.getItem('dsti.visit')) {
        sessionStorage.setItem('dsti.visit', '1');
        newVisitor = true;
      }
    } catch {
      /* ignore */
    }
    const t = setTimeout(() => {
      fetch(apiUrl('/api/public/hit'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: pathname.slice(0, 120), newVisitor }),
        keepalive: true,
      }).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [pathname]);
}
