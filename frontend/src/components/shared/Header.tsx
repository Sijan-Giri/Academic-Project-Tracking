import { Menu, Sun, Moon, User as UserIcon, Settings as SettingsIcon, LogOut as LogOutIcon } from 'lucide-react'; import { useLocation, useNavigate } from 'react-router-dom'; import NotificationDropdown from '@/components/shared/NotificationDropdown'; import { useAuthStore } from '@/store'; import { useTheme, useMyProjects, useMyTeam } from '@/hooks'; 
import { useSidebar } from '@/layouts/DashboardLayout';
import { Avatar, AvatarFallback, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui';



import { cn } from '@/lib';
import { ROUTES } from '@/constants';
import { getPageTitle } from '@/utils';
import { logout as logoutApi } from '@/api';

interface HeaderProps { className?: string; }

export default function Header({ className }: HeaderProps) {
  const { toggle } = useSidebar();
  const { user, clearAuth } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isStudent = user?.role === 'STUDENT';
  const { currentProject } = useMyProjects(isStudent);
  const { team: currentTeam } = useMyTeam(isStudent);

  const pageTitle = getPageTitle(location.pathname, user, currentProject?.title, currentTeam?.name);

  return (
    <header className={cn('flex h-16 items-center justify-between px-4 lg:px-8', className)}>
      <div className="flex items-center space-x-4 min-w-0">
        <Button variant="ghost" size="icon" onClick={toggle} className="lg:hidden text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white shrink-0">
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold dark:text-white text-slate-900 hidden sm:block tracking-tight truncate max-w-md" title={pageTitle}>
          {pageTitle}
        </h2>
      </div>

      <div className="flex items-center space-x-3 shrink-0">
        {/* Theme Switcher Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-amber-400 hover:text-amber-300 transition-transform duration-300 hover:rotate-45" />
          ) : (
            <Moon className="h-5 w-5 text-brand hover:text-indigo-700 transition-transform duration-300 hover:-rotate-12" />
          )}
        </Button>

        <NotificationDropdown />

        {/* User Profile Dropdown */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 border border-slate-200 dark:border-white/10">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="gradient-brand-br text-white font-bold text-xs">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56 p-1.5 rounded-2xl popover-dark dark:text-white bg-white border-slate-200 text-slate-900 shadow-2xl" align="end" forceMount>
            <DropdownMenuLabel className="font-normal px-3 py-2.5">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold leading-none dark:text-white text-slate-900">{user?.name}</p>
                <p className="text-xs font-medium leading-none dark:text-gray-400 text-slate-500 truncate">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator className="dark:bg-white/10 bg-slate-100" />
            
            <DropdownMenuItem onClick={() => navigate(ROUTES.PROFILE)} className="cursor-pointer font-bold">
              <UserIcon className="w-4 h-4 mr-2 text-brand" />
              View Profile
            </DropdownMenuItem>

            {user?.role === 'ADMIN' && (
              <DropdownMenuItem onClick={() => navigate(ROUTES.ADMIN_SETTINGS)} className="cursor-pointer font-bold">
                <SettingsIcon className="w-4 h-4 mr-2 text-brand" />
                System Settings
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator className="dark:bg-white/10 bg-slate-100" />

            <DropdownMenuItem
              onClick={async () => {
                try { await logoutApi(); } catch (_) {}
                clearAuth();
                navigate(ROUTES.LOGIN);
              }}
              className="text-danger focus:bg-rose-50 dark:focus:bg-rose-500/10 focus:text-rose-700 dark:focus:text-rose-300 font-bold cursor-pointer"
            >
              <LogOutIcon className="w-4 h-4 mr-2 text-danger" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
