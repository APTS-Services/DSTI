// src/utils/useSEO.js — per-page SEO: document title, meta description and canonical.
import { useEffect } from 'react';

const SUFFIX = 'DSTI | Government of Andhra Pradesh';

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function useSEO({ title, description, path } = {}) {
  useEffect(() => {
    document.title = title ? `${title} — ${SUFFIX}` : SUFFIX;
    if (description) {
      upsertMeta('name', 'description', description);
      upsertMeta('property', 'og:description', description);
    }
    if (title) upsertMeta('property', 'og:title', `${title} — ${SUFFIX}`);
    if (path) {
      upsertMeta('property', 'og:url', `https://dsti.ap.gov.in${path}`);
    }
  }, [title, description, path]);
}
