import { NavLink } from 'react-router-dom';
import { GraduationCap, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store';
import { cn } from '@/lib';
import { Button } from '@/components/ui';
import { NAV_ITEMS } from '@/constants';
import type { Role } from '@/types';
import { useSidebar } from '@/layouts/DashboardLayout';
import { logout as logoutApi } from '@/api';
import { useUnreadChatCount, useNotifications } from '@/hooks';

interface SidebarProps { className?: string; }

export default function Sidebar({ className }: SidebarProps) {
  const { user, clearAuth } = useAuthStore();
  const { close } = useSidebar();

  const isNonAdmin = user && user.role !== 'ADMIN';
  const { unreadCount: unreadChatCount } = useUnreadChatCount({ enabled: !!isNonAdmin });
  const { unreadCount: unreadNotifCount } = useNotifications({ enabled: !!isNonAdmin });

  const allowedItems = NAV_ITEMS.filter(item => user && item.roles.includes(user.role as Role));

  const getItemBadge = (path: string) => {
    if (path === '/chat' && unreadChatCount > 0) return unreadChatCount;
    if (path === '/notifications' && unreadNotifCount > 0) return unreadNotifCount;
    return 0;
  };

  return (
    <aside className={cn('flex flex-col bg-card border-r border-border text-foreground shadow-xs', className)}>
      <div className="flex h-16 shrink-0 items-center px-4 overflow-hidden border-b border-border">
        <div className="flex items-center space-x-3 text-brand">
          <GraduationCap className="h-7 w-7 shrink-0" />
          <span className="text-lg font-extrabold tracking-tight text-foreground lg:opacity-0 lg:group-hover:opacity-100 transition-opacity whitespace-nowrap">APTS</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3">
        <nav className="space-y-1 px-2">
          {allowedItems.map((item) => {
            const badgeCount = getItemBadge(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/my-project' || item.path === '/dashboard'}
                onClick={close}
                className={({ isActive }) =>
                  cn(
                    'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative group/item',
                    isActive
                      ? 'bg-brand-subtle text-brand font-semibold border-l-2 border-brand-strong'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )
                }
              >
                <div className="relative shrink-0 flex items-center justify-center">
                  <item.icon className="h-4 w-4 shrink-0" />
                  {badgeCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex min-w-[15px] h-[15px] px-1 items-center justify-center rounded-full bg-danger-solid text-[9px] font-extrabold text-white ring-2 ring-background lg:group-hover:hidden">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </div>
                <span className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity whitespace-nowrap flex-1 flex items-center justify-between">
                  <span>{item.label}</span>
                  {badgeCount > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full bg-danger-solid text-white text-[10px] font-extrabold shadow-xs">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-border p-3 shrink-0 overflow-hidden">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-subtle text-brand font-bold text-xs">
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
            className="p-1.5 h-8 w-8 text-muted-foreground hover:text-danger transition-colors lg:opacity-0 lg:group-hover:opacity-100 rounded-md"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
