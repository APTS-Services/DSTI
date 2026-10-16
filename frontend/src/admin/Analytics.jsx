import React, { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Analytics() {
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { api('/api/admin/analytics').then(setD).catch((e) => setErr(e.message)); }, []);
  if (err) return <div className="alert alert-danger">{err}</div>;
  if (!d) return <div className="skeleton" style={{ height: 300 }} />;

  // Fill missing days so the chart shows a continuous 30-day range.
  const byDate = Object.fromEntries(d.days.map((x) => [x.date, x.visitors]));
  const days = Array.from({ length: 30 }, (_, i) => {
    const dt = new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10);
    return { date: dt, visitors: byDate[dt] || 0 };
  });
  const max = Math.max(1, ...days.map((x) => x.visitors));
  const sum30 = days.reduce((a, b) => a + b.visitors, 0);

  return (
    <>
      <h1 className="h3 fw-bold mb-3">Visitor statistics</h1>
      <div className="row g-3 mb-4">
        {[['Total visitors', d.totals.visitors], ['Total page views', d.totals.pageViews], ['Visitors (last 30 days)', sum30]].map(([l, v]) => (
          <div className="col-md-4" key={l}><div className="admin-card kpi"><div className="v">{v.toLocaleString('en-IN')}</div><div className="l">{l}</div></div></div>
        ))}
      </div>
      <div className="row g-4">
        <div className="col-xl-8">
          <div className="admin-card p-4">
            <h2 className="h6 fw-bold">Daily visitors — last 30 days</h2>
            <div className="bar-chart mt-3" role="img" aria-label={`Daily visitors, highest ${max}`}>
              {days.map((x) => <div key={x.date} className="bar" style={{ height: `${(x.visitors / max) * 100}%` }} title={`${x.date}: ${x.visitors}`} />)}
            </div>
            <div className="d-flex justify-content-between small text-muted-2 mt-1"><span>{days[0].date}</span><span>{days[29].date}</span></div>
            <details className="mt-3"><summary className="small">Show as table</summary>
              <table className="table table-sm mt-2"><thead><tr><th>Date</th><th className="text-end">Visitors</th></tr></thead><tbody>{days.map((x) => <tr key={x.date}><td>{x.date}</td><td className="text-end">{x.visitors}</td></tr>)}</tbody></table>
            </details>
          </div>
        </div>
        <div className="col-xl-4">
          <div className="admin-card p-4">
            <h2 className="h6 fw-bold">Most visited pages (30 days)</h2>
            <table className="table table-sm mb-0"><tbody>{d.pages.map((p) => <tr key={p.path}><td className="font-monospace small">{p.path}</td><td className="text-end">{p.hits}</td></tr>)}</tbody></table>
          </div>
        </div>
      </div>
      <p className="small text-muted-2 mt-3">Statistics are anonymous: no cookies are set and no IP addresses are stored.</p>
    </>
  );
}
