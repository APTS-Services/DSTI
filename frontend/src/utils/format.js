export function formatDate(value, lang = 'en') {
  if (!value) return '';
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(lang === 'te' ? 'te-IN' : 'en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const byDateDesc = (field = 'date') => (a, b) => String(b[field] || '').localeCompare(String(a[field] || ''));

/** Only allow links the CMS validator accepts (defence in depth). */
export const isExternal = (url) => /^https?:\/\//i.test(url || '');
export const safeHref = (url) => (/^(https?:\/\/|\/(?!\/)|mailto:|tel:)/i.test(url || '') ? url : '#');
