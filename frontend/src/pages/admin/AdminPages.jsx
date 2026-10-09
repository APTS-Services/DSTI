// src/pages/admin/AdminPages.jsx — CMS functional pages (frontend-prototype, store-backed).
import React, { useMemo, useState } from 'react';
import {
  BarChart3, CalendarDays, ExternalLink, FileText, Inbox, Pencil, Plus, RotateCcw, Trash2, Users, X,
} from 'lucide-react';
import { addFeedback, deleteItem, getDailyVisits, markFeedbackRead, resetCollection, saveItem, useCollection } from '../../data/store';
import { policies } from '../../data/policies';
import { documents as seedDocs } from '../../data/documents';

/* ------------------------------------------------------------------ */
/* Shared UI                                                           */
/* ------------------------------------------------------------------ */

function PageTitle({ title, subtitle, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-extrabold text-neutral-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-sm text-neutral-500 dark:text-neutral-300">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function Field({ field, value, onChange }) {
  if (field.type === 'bilingual') {
    const v = typeof value === 'object' && value ? value : { en: '', te: '' };
    return (
      <div>
        <label className="label-style">{field.label}</label>
        <input className="input-style" placeholder="English" value={v.en || ''} onChange={(e) => onChange({ ...v, en: e.target.value })} />
        <input className="input-style mt-2" placeholder="తెలుగు" value={v.te || ''} onChange={(e) => onChange({ ...v, te: e.target.value })} />
      </div>
    );
  }
  if (field.type === 'select') {
    return (
      <div>
        <label className="label-style">{field.label}</label>
        <select className="input-style" value={value || ''} onChange={(e) => onChange(e.target.value)}>
          {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }
  return (
    <div>
      <label className="label-style">{field.label}</label>
      <input type={field.type || 'text'} className="input-style" value={value || ''} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function RecordModal({ title, fields, value, onClose, onSave }) {
  const [draft, setDraft] = useState(value);
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-neutral-950/60 p-4 py-10" role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {fields.map((f) => (
            <Field key={f.name} field={f} value={draft[f.name]} onChange={(val) => setDraft((d) => ({ ...d, [f.name]: val }))} />
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          <button type="button" onClick={() => onSave(draft)} className="btn-primary">Save</button>
        </div>
      </div>
    </div>
  );
}

function ManageTable({ collectionKey, title, subtitle, fields, columns, blank }) {
  const rows = useCollection(collectionKey);
  const [editing, setEditing] = useState(null);

  const save = (draft) => {
    saveItem(collectionKey, draft);
    setEditing(null);
  };

  return (
    <div>
      <PageTitle
        title={title}
        subtitle={subtitle}
        action={
          <div className="flex gap-2">
            <button type="button" onClick={() => { if (confirm('Reset to original content?')) resetCollection(collectionKey); }} className="btn-outline">
              <RotateCcw size={15} aria-hidden="true" /> Reset
            </button>
            <button type="button" onClick={() => setEditing({ ...blank })} className="btn-primary">
              <Plus size={15} aria-hidden="true" /> Add
            </button>
          </div>
        }
      />
      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
        <table className="dst-table">
          <thead>
            <tr>
              {columns.map((c) => <th key={c.key} scope="col">{c.label}</th>)}
              <th scope="col" className="w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={columns.length + 1} className="py-8 text-center text-neutral-500 dark:text-neutral-300">No records</td></tr>}
            {rows.map((r) => (
              <tr key={r.id}>
                {columns.map((c) => (
                  <td key={c.key}>
                    {c.render ? c.render(r) : typeof r[c.key] === 'object' ? (r[c.key]?.en ?? '') : String(r[c.key] ?? '')}
                  </td>
                ))}
                <td className="text-right">
                  <button type="button" onClick={() => setEditing(r)} aria-label="Edit" className="rounded p-1.5 text-primary-700 hover:bg-primary-50 dark:hover:bg-neutral-800">
                    <Pencil size={15} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => { if (confirm('Delete this record?')) deleteItem(collectionKey, r.id); }} aria-label="Delete" className="rounded p-1.5 text-danger-600 hover:bg-danger-50 dark:hover:bg-neutral-800">
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && <RecordModal title={`${title} — record`} fields={fields} value={editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pages                                                               */
/* ------------------------------------------------------------------ */

export function AdminDashboard() {
  const feedback = useCollection('feedback');
  const tenders = useCollection('tenders');
  const docs = useCollection('documents');
  const cards = [
    { label: 'Tenders', value: tenders.length, icon: FileText, color: 'from-neutral-800 to-primary-700' },
    { label: 'Documents', value: docs.length, icon: FileText, color: 'from-primary-700 to-neutral-800' },
    { label: 'Policies', value: policies.length, icon: BarChart3, color: 'from-secondary-500 to-secondary-700' },
    { label: 'Feedback', value: feedback.length, icon: Inbox, color: 'from-neutral-900 to-neutral-700' },
  ];
  return (
    <div>
      <PageTitle title="Dashboard" subtitle="Overview of published content and citizen feedback." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="dst-card flex items-center gap-4 p-5">
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${c.color} text-white`}>
                <Icon size={22} aria-hidden="true" />
              </span>
              <div>
                <p className="text-2xl font-extrabold text-neutral-900 dark:text-white">{c.value}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-300">{c.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="font-bold text-neutral-900 dark:text-white">Latest feedback</h2>
        <ul className="mt-3 divide-y divide-neutral-100 dark:divide-neutral-800">
          {feedback.slice(0, 5).map((f) => (
            <li key={f.id} className="flex items-start justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{f.subject}</p>
                <p className="truncate text-xs text-neutral-500 dark:text-neutral-300">{f.name} · {f.email}</p>
              </div>
              <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase ${f.status === 'new' ? 'bg-danger-100 text-danger-700' : 'bg-primary-100 text-primary-700'}`}>{f.status}</span>
            </li>
          ))}
          {feedback.length === 0 && <li className="py-4 text-sm text-neutral-500 dark:text-neutral-300">No feedback yet.</li>}
        </ul>
      </div>
    </div>
  );
}

export function ManageTenders() {
  const fields = [
    { name: 'tenderNo', label: 'Tender No.' },
    { name: 'title', label: 'Title', type: 'bilingual' },
    { name: 'department', label: 'Department' },
    { name: 'publishedDate', label: 'Published date', type: 'date' },
    { name: 'closingDate', label: 'Closing date', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', options: ['open', 'closed'] },
    { name: 'emd', label: 'EMD' },
  ];
  return (
    <ManageTable
      collectionKey="tenders"
      title="Tenders"
      subtitle="Publish and update tender notices with open / closed status."
      fields={fields}
      columns={[
        { key: 'tenderNo', label: 'No.' },
        { key: 'title', label: 'Title' },
        { key: 'department', label: 'Dept.' },
        { key: 'closingDate', label: 'Closing' },
        { key: 'status', label: 'Status', render: (r) => <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase ${r.status === 'open' ? 'bg-primary-100 text-primary-700' : 'bg-neutral-200 text-neutral-600'}`}>{r.status}</span> },
      ]}
      blank={{ tenderNo: '', title: { en: '', te: '' }, department: '', publishedDate: '', closingDate: '', status: 'open', emd: '', documents: [] }}
    />
  );
}

export function ManageDocuments() {
  const fields = [
    { name: 'number', label: 'Number' },
    { name: 'title', label: 'Title', type: 'bilingual' },
    { name: 'type', label: 'Type', type: 'select', options: ['go', 'notification', 'circular', 'act', 'rule', 'guideline'] },
    { name: 'department', label: 'Department' },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'file', label: 'File URL' },
    { name: 'size', label: 'File size' },
  ];
  return (
    <ManageTable
      collectionKey="documents"
      title="Documents"
      subtitle="Government orders, notifications, circulars, acts, rules and guidelines."
      fields={fields}
      columns={[
        { key: 'number', label: 'No.' },
        { key: 'title', label: 'Title' },
        { key: 'type', label: 'Type' },
        { key: 'date', label: 'Date' },
      ]}
      blank={{ number: '', title: { en: '', te: '' }, type: 'go', department: '', date: '', file: '#', size: '' }}
    />
  );
}

export function ManageNews() {
  const fields = [
    { name: 'title', label: 'Title', type: 'bilingual' },
    { name: 'category', label: 'Category' },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'link', label: 'Link' },
  ];
  return (
    <ManageTable
      collectionKey="news"
      title="News & Updates"
      subtitle="Items shown in the home page news ticker."
      fields={fields}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'category', label: 'Category' },
        { key: 'date', label: 'Date' },
      ]}
      blank={{ title: { en: '', te: '' }, category: 'Update', date: '', link: '/', isNew: true }}
    />
  );
}

export function ManageEvents() {
  const fields = [
    { name: 'title', label: 'Title', type: 'bilingual' },
    { name: 'summary', label: 'Summary', type: 'bilingual' },
    { name: 'date', label: 'Start date', type: 'date' },
    { name: 'endDate', label: 'End date', type: 'date' },
    { name: 'location', label: 'Location', type: 'bilingual' },
    { name: 'category', label: 'Category' },
    { name: 'status', label: 'Status', type: 'select', options: ['upcoming', 'past'] },
  ];
  return (
    <ManageTable
      collectionKey="events"
      title="Events"
      subtitle="Science fairs, conclaves, workshops and observances."
      fields={fields}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'date', label: 'Date' },
        { key: 'category', label: 'Category' },
        { key: 'status', label: 'Status' },
      ]}
      blank={{ title: { en: '', te: '' }, summary: { en: '', te: '' }, date: '', endDate: '', location: { en: '', te: '' }, category: '', status: 'upcoming', district: 'ntr' }}
    />
  );
}

export function AdminFeedbackInbox() {
  const feedback = useCollection('feedback');
  return (
    <div>
      <PageTitle title="Feedback Inbox" subtitle="Messages submitted through the public Feedback form." action={
        <span className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-300"><Inbox size={15} aria-hidden="true" /> {feedback.length} messages</span>
      } />
      <div className="space-y-3">
        {feedback.length === 0 && <p className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-neutral-500 dark:text-neutral-300 dark:border-neutral-700 dark:bg-neutral-900">No feedback received yet. Submit one from the Contact page to see it here.</p>}
        {feedback.map((f) => (
          <article key={f.id} className={`rounded-xl border bg-white p-5 dark:bg-neutral-900 ${f.status === 'new' ? 'border-secondary-400' : 'border-neutral-200 dark:border-neutral-700'}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-neutral-900 dark:text-white">{f.subject}</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-300">{f.name} · {f.email}{f.phone ? ` · ${f.phone}` : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                {f.status === 'new' && <span className="rounded-full bg-danger-100 px-2 py-0.5 text-[0.65rem] font-bold uppercase text-danger-700">New</span>}
                {f.status === 'new' && (
                  <button type="button" onClick={() => markFeedbackRead(f.id)} className="btn-outline text-xs">Mark read</button>
                )}
                <a href={`mailto:${f.email}`} className="btn-outline text-xs"><ExternalLink size={13} aria-hidden="true" /> Reply</a>
              </div>
            </div>
            <p className="mt-3 border-t border-neutral-100 pt-3 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-200">{f.message}</p>
            <p className="mt-2 text-[0.7rem] text-neutral-500 dark:text-neutral-300">{new Date(f.date).toLocaleString('en-IN')}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export function AdminAnalytics() {
  const data = useMemo(() => getDailyVisits(14), []);
  const totalVisits = data.reduce((s, d) => s + d.visits, 0);
  return (
    <div>
      <PageTitle title="Visitor Analytics" subtitle="Website visitor statistics over the last 14 days." />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="dst-card p-5">
          <Users size={20} className="text-primary-600" aria-hidden="true" />
          <p className="mt-2 text-2xl font-extrabold text-neutral-900 dark:text-white">{totalVisits.toLocaleString('en-IN')}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-300">Total visits (14 days)</p>
        </div>
        <div className="dst-card p-5">
          <CalendarDays size={20} className="text-primary-600" aria-hidden="true" />
          <p className="mt-2 text-2xl font-extrabold text-neutral-900 dark:text-white">{Math.round(totalVisits / 14).toLocaleString('en-IN')}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-300">Average per day</p>
        </div>
        <div className="dst-card p-5">
          <BarChart3 size={20} className="text-primary-600" aria-hidden="true" />
          <p className="mt-2 text-2xl font-extrabold text-neutral-900 dark:text-white">{Math.max(...data.map((d) => d.visits)).toLocaleString('en-IN')}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-300">Peak day</p>
        </div>
      </div>
      {/* Dependency-free bar chart */}
      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex h-56 items-end gap-1.5">
          {data.map((d) => {
            const max = Math.max(...data.map((x) => x.visits));
            const h = Math.round((d.visits / max) * 100);
            return (
              <div key={d.date} className="group flex flex-1 flex-col items-center justify-end gap-1" title={`${d.date}: ${d.visits} visits`}>
                <span className="text-[0.6rem] font-semibold text-neutral-500 dark:text-neutral-300 opacity-0 transition-opacity group-hover:opacity-100">{d.visits}</span>
                <div
                  className="w-full rounded-t bg-gradient-to-t from-primary-700 to-primary-400 transition-all group-hover:from-secondary-600 group-hover:to-secondary-400"
                  style={{ height: `${h}%`, minHeight: 4 }}
                />
                <span className="text-[0.6rem] text-neutral-500 dark:text-neutral-300">{d.date.slice(8)}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-center text-xs text-neutral-500 dark:text-neutral-300">Daily visits · last 14 days</p>
      </div>
      <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-300">
        Prototype analytics. When the backend is connected this reads the server-side page-view tracking endpoint.
      </p>
    </div>
  );
}
