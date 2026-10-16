// Icon registry: CMS content refers to icons by name.
import {
  Atom, Briefcase, Building2, CalendarDays, Cpu, FileText, FlaskConical, Globe, GraduationCap, Landmark,
  Lightbulb, MapPinned, Rocket, Satellite, ScrollText, ShieldCheck, Sprout, Users,
} from 'lucide-react';

const ICONS = { Atom, Briefcase, Building2, CalendarDays, Cpu, FileText, FlaskConical, Globe, GraduationCap, Landmark, Lightbulb, MapPinned, Rocket, Satellite, ScrollText, ShieldCheck, Sprout, Users };

export const iconFor = (name) => ICONS[name] || Landmark;
