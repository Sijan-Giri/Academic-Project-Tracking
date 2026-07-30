import { Menu, Bell } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUnreadCount } from '@/api/notifications.api';
import { useAuthStore } from '@/store/auth.store';
import { useSidebar } from '@/layouts/DashboardLayout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps { className?: string; }

export default function Header({ className }: HeaderProps) {
  const { toggle } = useSidebar();
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ['unread-count'],
    queryFn: getUnreadCount,
    refetchInterval: 30000,
  });

  const unreadCount = (data as any)?.data?.count || (data as any)?.count || 0;

  // Simple title generator based on path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path.includes('/my-project')) return 'My Project';
    if (path.includes('/coordinator/projects')) return 'Projects';
    const segments = path.split('/').filter(Boolean);
    const last = segments[segments.length - 1];
    if (!last) return 'Dashboard';
    return last.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  };

  return (
    <header className={cn('flex h-16 items-center justify-between px-4 lg:px-8', className)}>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={toggle} className="lg:hidden text-gray-400 hover:text-white">
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold text-white hidden sm:block">{getPageTitle()}</h2>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white" onClick={() => navigate('/notifications')}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#0f1117]" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-white">{user?.name}</p>
                <p className="text-xs leading-none text-gray-400">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              Profile
            </DropdownMenuItem>
            {user?.role === 'ADMIN' && (
              <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                Settings
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { logout(); navigate('/login'); }} className="text-red-400 focus:bg-red-500/10 focus:text-red-400">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
