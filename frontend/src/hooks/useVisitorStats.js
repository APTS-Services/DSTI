// src/hooks/useVisitorStats.js
// Lightweight, privacy-respecting visitor counter.
// In this frontend-first prototype the count is maintained locally; when the
// backend is wired up this will read the server-side analytics endpoint instead.
import { useEffect, useState } from 'react';

const TOTAL_KEY = 'dsti.stats.total';
const TODAY_KEY = 'dsti.stats.today'; // JSON { date, count }
const SESSION_KEY = 'dsti.stats.counted'; // per-session guard

function readInt(key, fallback = 0) {
  const v = parseInt(localStorage.getItem(key) || '', 10);
  return Number.isNaN(v) ? fallback : v;
}

export default function useVisitorStats() {
  const [stats, setStats] = useState({ total: 0, today: 0 });

  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      let total = readInt(TOTAL_KEY, 0);
      let storedToday = { date: today, count: 0 };
      try {
        storedToday = JSON.parse(localStorage.getItem(TODAY_KEY) || '') || storedToday;
      } catch {
        storedToday = { date: today, count: 0 };
      }

      // Count this visit once per browser session.
      if (!sessionStorage.getItem(SESSION_KEY)) {
        sessionStorage.setItem(SESSION_KEY, '1');
        total += 1;
        if (storedToday.date === today) {
          storedToday.count += 1;
        } else {
          storedToday = { date: today, count: 1 };
        }
        localStorage.setItem(TOTAL_KEY, String(total));
        localStorage.setItem(TODAY_KEY, JSON.stringify(storedToday));
      } else if (storedToday.date !== today) {
        storedToday = { date: today, count: 0 };
        localStorage.setItem(TODAY_KEY, JSON.stringify(storedToday));
      }

      setStats({ total: Math.max(total, 1), today: Math.max(storedToday.count, 1) });
    } catch {
      setStats({ total: 1, today: 1 });
    }
  }, []);

  return stats;
}
