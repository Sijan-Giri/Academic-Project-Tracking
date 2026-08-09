import { NavLink } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, Building2, Calendar, Users, Settings, FileText, ClipboardList, BookOpen, Clock, Bell, UserCircle2, LogOut, Megaphone } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { logout as logoutApi } from '@/api/auth.api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Role } from '@/types/user.types';

interface SidebarProps { className?: string; }

export default function Sidebar({ className }: SidebarProps) {
  const { user, clearAuth } = useAuthStore();

  const NAV_ITEMS = [
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

  const allowedItems = NAV_ITEMS.filter(item => user && item.roles.includes(user.role as Role));

  return (
    <aside className={cn('flex flex-col bg-card border-r border-border text-foreground shadow-xs', className)}>
      <div className="flex h-16 shrink-0 items-center px-4 overflow-hidden border-b border-border">
        <div className="flex items-center space-x-3 text-indigo-600 dark:text-indigo-400">
          <GraduationCap className="h-7 w-7 shrink-0" />
          <span className="text-lg font-extrabold tracking-tight text-foreground lg:opacity-0 lg:group-hover:opacity-100 transition-opacity whitespace-nowrap">APTS</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3">
        <nav className="space-y-1 px-2">
          {allowedItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/my-project' || item.path === '/dashboard'}
              className={({ isActive }) =>
                cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-semibold border-l-2 border-indigo-600 dark:border-indigo-500'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )
              }
            >
              <item.icon className="h-4 h-4 shrink-0" />
              <span className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity whitespace-nowrap">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-border p-3 shrink-0 overflow-hidden">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
            <p className="truncate text-sm font-semibold text-foreground">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.role}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              try { await logoutApi(); } catch (_) {}
              clearAuth();
              window.location.href = '/login';
            }}
            className="p-1.5 h-8 w-8 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 transition-colors lg:opacity-0 lg:group-hover:opacity-100 rounded-md"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
