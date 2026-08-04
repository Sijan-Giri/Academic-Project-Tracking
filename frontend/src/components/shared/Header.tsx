import { Menu, Sun, Moon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import NotificationDropdown from '@/components/shared/NotificationDropdown';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore } from '@/store/theme.store';
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
  const { theme, toggleTheme } = useThemeStore();
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
        <Button variant="ghost" size="icon" onClick={toggle} className="lg:hidden text-gray-400 hover:text-white dark:text-gray-400 dark:hover:text-white text-slate-600 hover:text-slate-900">
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold dark:text-white text-slate-900 hidden sm:block">{getPageTitle()}</h2>
      </div>

      <div className="flex items-center space-x-3">
        {/* Theme Switcher Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full text-gray-400 hover:text-white dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-amber-400 hover:text-amber-300 transition-transform duration-300 hover:rotate-45" />
          ) : (
            <Moon className="h-5 w-5 text-indigo-600 hover:text-indigo-700 transition-transform duration-300 hover:-rotate-12" />
          )}
        </Button>

        <NotificationDropdown />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8 ring-2 ring-indigo-500/20">
                <AvatarFallback className="bg-indigo-600 text-white font-bold">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 dark:bg-[#14161f] dark:border-white/10 dark:text-white bg-white border-slate-200 text-slate-900 shadow-xl" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none dark:text-white text-slate-900">{user?.name}</p>
                <p className="text-xs leading-none dark:text-gray-400 text-slate-500">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="dark:bg-white/10 bg-slate-200" />
            <DropdownMenuItem onClick={() => navigate('/profile')} className="dark:hover:bg-white/5 hover:bg-slate-100 cursor-pointer">
              Profile
            </DropdownMenuItem>
            {user?.role === 'ADMIN' && (
              <DropdownMenuItem onClick={() => navigate('/admin/settings')} className="dark:hover:bg-white/5 hover:bg-slate-100 cursor-pointer">
                Settings
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="dark:bg-white/10 bg-slate-200" />
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
