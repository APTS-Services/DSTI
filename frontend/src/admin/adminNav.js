// How the CMS menu is organised. Sections follow the public website's own
// structure so editors find things where visitors see them. Any collection or
// setting not listed here still appears, under "Other".
import {
  BarChart3, Building2, DatabaseBackup, FileText, FolderOpen, History, Home, Image, Inbox, LayoutDashboard,
  MapPinned, Settings, UserCog,
} from 'lucide-react';

export const SECTIONS = [
  { id: 'home', label: 'Home page', icon: Home, items: [['c', 'heroSlides'], ['c', 'news'], ['c', 'services'], ['c', 'audiences'], ['c', 'storyChapters'], ['s', 'home']] },
  { id: 'dept', label: 'About & departments', icon: Building2, items: [['c', 'leaders'], ['s', 'about'], ['c', 'organisations'], ['c', 'officers'], ['c', 'awards'], ['c', 'egov'], ['c', 'projects'], ['c', 'policies'], ['s', 'investors'], ['c', 'investorIncentives']] },
  { id: 'citizen', label: 'Citizen services', icon: FileText, items: [['c', 'tenders'], ['c', 'documents'], ['c', 'faqs'], ['c', 'usefulLinks']] },
  { id: 'media', label: 'Media', icon: Image, items: [['c', 'gallery'], ['c', 'events'], ['c', 'scienceStories'], ['c', 'scienceDays'], ['c', 'thisDay']] },
  { id: 'districts', label: 'District explorer', icon: MapPinned, items: [['c', 'districts'], ['c', 'regions']] },
  { id: 'pages', label: 'Pages & menu', icon: LayoutDashboard, items: [['c', 'pages'], ['c', 'navigation']] },
  { id: 'settings', label: 'Site settings', icon: Settings, items: [['s', 'site'], ['s', 'contact'], ['s', 'system']] },
];

export const ADMIN_TOOLS = [
  { to: '/admin/media', label: 'Files & images', icon: FolderOpen },
  { to: '/admin/analytics', label: 'Visitor statistics', icon: BarChart3 },
  { to: '/admin/users', label: 'Users & roles', icon: UserCog, roles: ['Administrator'] },
  { to: '/admin/audit', label: 'Audit log', icon: History, roles: ['Administrator'] },
  { to: '/admin/backup', label: 'Backup & restore', icon: DatabaseBackup, roles: ['Administrator'] },
];

export const FEEDBACK_LINK = { to: '/admin/feedback', label: 'Feedback', icon: Inbox, roles: ['Administrator', 'Publisher', 'Viewer'] };

/** Resolves the sections against the schemas this user may see. */
export function buildSections(schemas) {
  if (!schemas) return [];
  const seen = new Set();
  const resolve = ([kind, key]) => {
    const schema = kind === 'c' ? schemas.collections?.[key] : schemas.settings?.[key];
    if (!schema) return null;
    seen.add(`${kind}:${key}`);
    return { key: `${kind}:${key}`, label: schema.label, to: kind === 'c' ? `/admin/c/${key}` : `/admin/settings/${key}`, collection: kind === 'c' ? key : null };
  };
  const sections = SECTIONS.map((s) => ({ ...s, items: s.items.map(resolve).filter(Boolean) }));
  const other = [
    ...Object.keys(schemas.collections || {}).map((k) => ['c', k]),
    ...Object.keys(schemas.settings || {}).map((k) => ['s', k]),
  ].filter(([kind, key]) => !seen.has(`${kind}:${key}`)).map(resolve).filter(Boolean);
  if (other.length) sections.push({ id: 'other', label: 'Other', icon: Settings, items: other });
  return sections.filter((s) => s.items.length);
}
