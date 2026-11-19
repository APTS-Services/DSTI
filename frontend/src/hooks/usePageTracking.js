// Anonymous page-view counter (no cookies, no personal data).
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { apiUrl } from '../api/client';

export default function usePageTracking() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname.startsWith('/admin')) return undefined;
    // Remember the session only once the hit is actually sent: React StrictMode
    // mounts this effect twice and cancels the first timer, so setting the flag
    // up front made the real hit report newVisitor=false every time.
    const t = setTimeout(() => {
      let newVisitor = false;
      try {
        if (!sessionStorage.getItem('dsti.visit')) {
          sessionStorage.setItem('dsti.visit', '1');
          newVisitor = true;
        }
      } catch {
        /* storage blocked: count the view, not the visitor */
      }
      fetch(apiUrl('/api/public/hit'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: pathname.slice(0, 120), newVisitor }),
        keepalive: true,
      })
        // The footer counter re-reads /api/public/stats when a view is recorded.
        .then((res) => {
          if (res.ok) window.dispatchEvent(new Event('dsti:visit'));
        })
        .catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [pathname]);
}
