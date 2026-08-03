import { Menu } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import NotificationDropdown from '@/components/shared/NotificationDropdown';
import { useAuthStore } from '@/store/auth.store';
import { logout as logoutApi } from '@/api/auth.api';
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
  const { user, clearAuth } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

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
        <NotificationDropdown />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-[#14161f] border-white/10 text-white" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-white">{user?.name}</p>
                <p className="text-xs leading-none text-gray-400">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem onClick={() => navigate('/profile')} className="hover:bg-white/5 cursor-pointer">
              Profile
            </DropdownMenuItem>
            {user?.role === 'ADMIN' && (
              <DropdownMenuItem onClick={() => navigate('/admin/settings')} className="hover:bg-white/5 cursor-pointer">
                Settings
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onClick={async () => {
                try { await logoutApi(); } catch (_) {}
                clearAuth();
                navigate('/login');
              }}
              className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
