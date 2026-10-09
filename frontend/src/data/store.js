// src/data/store.js
// A small persistence layer used by the frontend-first prototype.
// It seeds from the static data modules, then lets the CMS create / edit / delete
// records in localStorage. When the backend is wired up, these functions become
// thin API calls without changing the components that consume them.

import { useEffect, useState } from 'react';
import { tenders as seedTenders } from './tenders';
import { documents as seedDocuments } from './documents';
import { events as seedEvents } from './events';
import { news as seedNews } from './news';

const KEYS = {
  tenders: 'dsti.data.tenders',
  documents: 'dsti.data.documents',
  events: 'dsti.data.events',
  news: 'dsti.data.news',
  feedback: 'dsti.data.feedback',
};

const SEEDS = {
  tenders: seedTenders,
  documents: seedDocuments,
  events: seedEvents,
  news: seedNews,
  feedback: [],
};

const listeners = new Set();

function read(key) {
  try {
    const raw = localStorage.getItem(KEYS[key]);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore corrupt data */
  }
  return SEEDS[key];
}

function write(key, value) {
  try {
    localStorage.setItem(KEYS[key], JSON.stringify(value));
  } catch {
    /* storage may be unavailable */
  }
  listeners.forEach((fn) => fn(key));
}

export function getCollection(key) {
  return read(key);
}

export function saveItem(key, item) {
  const list = read(key);
  const id = item.id || `${key}-${Date.now()}`;
  const record = { ...item, id };
  const idx = list.findIndex((r) => r.id === id);
  const next = idx >= 0 ? list.map((r) => (r.id === id ? record : r)) : [record, ...list];
  write(key, next);
  return record;
}

export function deleteItem(key, id) {
  write(key, read(key).filter((r) => r.id !== id));
}

export function addFeedback(payload) {
  const record = { id: `fb-${Date.now()}`, ...payload, date: new Date().toISOString(), status: 'new' };
  write('feedback', [record, ...read('feedback')]);
  return record;
}

export function markFeedbackRead(id, status = 'read') {
  write('feedback', read('feedback').map((f) => (f.id === id ? { ...f, status } : f)));
}

export function resetCollection(key) {
  localStorage.removeItem(KEYS[key]);
  listeners.forEach((fn) => fn(key));
}

/** React hook that stays in sync with a persisted collection. */
export function useCollection(key) {
  const [value, setValue] = useState(() => read(key));
  useEffect(() => {
    const listener = (changedKey) => {
      if (changedKey === key) setValue(read(key));
    };
    listeners.add(listener);
    // Re-read on mount in case another tab changed it.
    setValue(read(key));
    return () => listeners.delete(listener);
  }, [key]);
  return value;
}

/** Simple visitor analytics derived from the stored feedback/visits (prototype). */
export function getDailyVisits(days = 14) {
  const out = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    // Deterministic pseudo-data for the prototype analytics dashboard.
    const seed = d.getDate() * 37 + (d.getMonth() + 1) * 11;
    out.push({ date: d.toISOString().slice(0, 10), visits: 120 + (seed % 180) });
  }
  return out;
}
