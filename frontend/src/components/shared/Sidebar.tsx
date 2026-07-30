import { NavLink } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, Building2, Calendar, Users, Settings, FileText, ClipboardList, BookOpen, Clock, Bell, UserCircle2, LogOut, Megaphone } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { logout as logoutApi } from '@/api/auth.api';
import { cn } from '@/lib/utils';
import { Role } from '@/types';

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
    
    { label: 'Projects', icon: BookOpen, path: '/coordinator/projects', roles: ['COORDINATOR'] },
    { label: 'Teams', icon: Users, path: '/coordinator/teams', roles: ['COORDINATOR'] },
    { label: 'Guide Allocation', icon: UserCircle2, path: '/coordinator/guides', roles: ['COORDINATOR'] },
    { label: 'Review Stages', icon: ClipboardList, path: '/coordinator/review-stages', roles: ['COORDINATOR'] },
    { label: 'Schedules', icon: Clock, path: '/coordinator/schedules', roles: ['COORDINATOR'] },
    { label: 'Announcements', icon: Megaphone, path: '/coordinator/announcements', roles: ['COORDINATOR'] },

    { label: 'Guided Projects', icon: BookOpen, path: '/faculty/projects', roles: ['FACULTY'] },

    { label: 'My Schedules', icon: Clock, path: '/my-schedules', roles: ['FACULTY', 'PANEL'] },
    
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
    <aside className={cn('flex flex-col bg-[#1e1e2e] border-r border-white/10', className)}>
      <div className="flex h-16 shrink-0 items-center px-4 overflow-hidden">
        <div className="flex items-center space-x-3 text-indigo-400">
          <GraduationCap className="h-8 w-8 shrink-0" />
          <span className="text-xl font-bold tracking-tight text-white lg:opacity-0 lg:group-hover:opacity-100 transition-opacity whitespace-nowrap">APTS</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4">
        <nav className="space-y-1 px-2">
          {allowedItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity whitespace-nowrap">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-white/10 p-4 shrink-0 overflow-hidden">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 font-semibold">
            {user?.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
            <p className="truncate text-sm font-medium text-white">{user?.name}</p>
            <p className="truncate text-xs text-gray-400">{user?.role}</p>
          </div>
          <button
            onClick={async () => {
              try { await logoutApi(); } catch (_) {}
              clearAuth();
              window.location.href = '/login';
            }}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors lg:opacity-0 lg:group-hover:opacity-100"
          >
            <LogOut className="h-5 w-5 shrink-0" />
          </button>
        </div>
      </div>
    </aside>
  );
}
