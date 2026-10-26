// Adds a gentle fade-up when an element scrolls into view (respects reduced motion).
//
// Content must never stay hidden: the fade is a decoration, so this hook reveals
// anything that is already on screen on the next frame, keeps a short safety
// timer for environments where IntersectionObserver callbacks are delayed, and
// re-checks on scroll. Without these, a client-side route change could leave a
// page's whole body at opacity 0 — i.e. a blank page under a correct URL.
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

/** True when the element is inside the viewport (ratio > 1 reaches below it). */
function onScreen(el, ratio = 1) {
  const rect = el.getBoundingClientRect();
  const height = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < height * ratio && rect.bottom > 0;
}

export default function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const show = () => el.classList.add('is-visible');
    const obs = getObserver();
    if (!obs) {
      show();
      return undefined;
    }

    obs.observe(el);

    // Already on screen (first paint, or a route change): reveal on the next
    // frame so the fade still plays instead of staying invisible.
    const frame = requestAnimationFrame(() => {
      if (onScreen(el)) show();
    });

    // Safety net for delayed/undelivered observer callbacks.
    const timer = setTimeout(() => {
      if (onScreen(el, 1.1)) show();
    }, 700);

    // The visitor is scrolling: reveal whatever is on screen right now.
    const onScroll = () => {
      if (onScreen(el, 1.05)) show();
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      obs.unobserve(el);
    };
  }, []);

  return ref;
}
