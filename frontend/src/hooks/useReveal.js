// Adds a gentle fade-up when an element scrolls into view (respects reduced motion).
import { useEffect, useRef } from 'react';

let observer = null;
function getObserver() {
  if (observer || typeof IntersectionObserver === 'undefined') return observer;
  observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        observer.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  return observer;
}

export default function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const obs = getObserver();
    if (!el) return undefined;
    if (!obs) {
      el.classList.add('is-visible');
      return undefined;
    }
    obs.observe(el);
    return () => obs.unobserve(el);
  }, []);
  return ref;
}
