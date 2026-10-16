// Per-page title, description and social sharing tags.
import { useEffect } from 'react';

const SUFFIX = 'DSTI, Government of Andhra Pradesh';

function upsert(attr, key, content) {
  if (content == null) return;
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
    const full = title ? `${title} | ${SUFFIX}` : `Department of Science, Technology & Innovation | ${SUFFIX}`;
    document.title = full;
    upsert('property', 'og:title', full);
    upsert('name', 'twitter:title', full);
    if (description) {
      const d = description.slice(0, 200);
      upsert('name', 'description', d);
      upsert('property', 'og:description', d);
      upsert('name', 'twitter:description', d);
    }
    const url = `${window.location.origin}${path || window.location.pathname}`;
    upsert('property', 'og:url', url);
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }, [title, description, path]);
}
