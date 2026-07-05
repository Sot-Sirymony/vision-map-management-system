import {
  CheckSquare,
  ClipboardList,
  Compass,
  FileSpreadsheet,
  Flag,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  Sparkles,
  TriangleAlert,
  Users,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vision-areas', label: 'Vision Areas', icon: Compass },
  { to: '/dreams', label: 'Dreams', icon: Sparkles },
  { to: '/goals', label: 'Goals', icon: Flag },
  { to: '/steps', label: 'Steps', icon: ListChecks },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/partners', label: 'Partners', icon: Users },
  { to: '/obstacles', label: 'Obstacles', icon: TriangleAlert },
  { to: '/communication', label: 'Communication', icon: MessageSquare },
  { to: '/reviews', label: 'Reviews', icon: ClipboardList },
  { to: '/import-export', label: 'Import / Export', icon: FileSpreadsheet },
];
