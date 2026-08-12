// ─────────────────────────────────────────────────────────────────────────────
// constants/navigation.ts
// Sidebar navigation configurations and route maps.
// ─────────────────────────────────────────────────────────────────────────────

import {
  LayoutDashboard,
  Building2,
  Calendar,
  Users,
  Settings,
  FileText,
  ClipboardList,
  BookOpen,
  Clock,
  Bell,
  UserCircle2,
  Megaphone,
} from 'lucide-react';
import type { Role } from '@/types';

export interface NavItem {
  label: string;
  icon: any;
  path: string;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['ADMIN', 'COORDINATOR', 'FACULTY', 'PANEL', 'STUDENT'] },
  { label: 'Departments', icon: Building2, path: '/admin/departments', roles: ['ADMIN'] },
  { label: 'Academic Years', icon: Calendar, path: '/admin/academic-years', roles: ['ADMIN'] },
  { label: 'Batches', icon: Users, path: '/admin/batches', roles: ['ADMIN'] },
  { label: 'Semesters', icon: BookOpen, path: '/admin/semesters', roles: ['ADMIN'] },
  { label: 'Users', icon: UserCircle2, path: '/admin/users', roles: ['ADMIN'] },
  { label: 'Review Templates', icon: FileText, path: '/admin/review-templates', roles: ['ADMIN'] },

  { label: 'Projects', icon: BookOpen, path: '/coordinator/projects', roles: ['COORDINATOR', 'ADMIN'] },
  { label: 'Teams', icon: Users, path: '/coordinator/teams', roles: ['COORDINATOR', 'ADMIN'] },
  { label: 'Guide Allocation', icon: UserCircle2, path: '/coordinator/guides', roles: ['COORDINATOR', 'ADMIN'] },
  { label: 'Review Stages', icon: ClipboardList, path: '/coordinator/review-stages', roles: ['COORDINATOR', 'ADMIN'] },
  { label: 'Schedules', icon: Clock, path: '/coordinator/schedules', roles: ['COORDINATOR', 'ADMIN'] },
  { label: 'Announcements', icon: Megaphone, path: '/coordinator/announcements', roles: ['COORDINATOR', 'ADMIN'] },

  { label: 'Guided Projects', icon: BookOpen, path: '/faculty/projects', roles: ['FACULTY'] },

  { label: 'My Schedules & Links', icon: Clock, path: '/my-schedules', roles: ['FACULTY', 'PANEL', 'STUDENT'] },

  { label: 'My Project', icon: BookOpen, path: '/my-project', roles: ['STUDENT'] },
  { label: 'My Team', icon: Users, path: '/my-team', roles: ['STUDENT'] },
  { label: 'Abstract', icon: FileText, path: '/my-project/abstract', roles: ['STUDENT'] },
  { label: 'Milestones', icon: ClipboardList, path: '/my-project/milestones', roles: ['STUDENT'] },
  { label: 'Submissions', icon: ClipboardList, path: '/my-project/submissions', roles: ['STUDENT'] },

  { label: 'Notifications', icon: Bell, path: '/notifications', roles: ['FACULTY', 'PANEL', 'STUDENT'] },
  { label: 'Reports', icon: FileText, path: '/reports', roles: ['ADMIN', 'COORDINATOR'] },
  { label: 'Settings', icon: Settings, path: '/admin/settings', roles: ['ADMIN'] },
  { label: 'Audit Log', icon: ClipboardList, path: '/admin/audit', roles: ['ADMIN'] },
];
