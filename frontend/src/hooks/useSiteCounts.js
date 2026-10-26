// Counts of the records published on the website, read from the API
// (GET /api/public/counts runs COUNT(*) over the MySQL tables). Pages use these
// instead of any literal number. The last answer is cached for a few seconds so
// components share one request, but every mount revalidates — an edit made in
// the CMS shows up on the next page view without a hard reload.
import { useEffect, useState } from 'react';
import { apiUrl } from '../api/client';

const TTL_MS = 5000;

let cached = null;
let fetchedAt = 0;
let pending = null;

function load() {
  const fresh = cached && Date.now() - fetchedAt < TTL_MS;
  if (fresh) return Promise.resolve(cached);
  if (!pending) {
    pending = fetch(apiUrl('/api/public/counts'), { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json && Number.isFinite(Number(json.districts))) {
          cached = json;
          fetchedAt = Date.now();
        }
        return cached;
      })
      .catch(() => cached)
      .finally(() => {
        pending = null;
      });
  }
  return pending;
}

export default function useSiteCounts() {
  const [counts, setCounts] = useState(cached);
  useEffect(() => {
    let alive = true;
    load().then((json) => {
      if (alive && json) setCounts(json);
    });
    return () => {
      alive = false;
    };
  }, []);
  return counts;
}
