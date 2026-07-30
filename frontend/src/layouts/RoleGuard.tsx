import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { Role } from '@/types';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { getMe } from '@/api/auth.api';

interface RoleGuardProps { allowedRoles?: Role[]; }

export default function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { isAuthenticated, user, isLoading, setUser, logout } = useAuthStore();

  useEffect(() => {
    // Validate session with backend on mount
    getMe()
      .then((data: any) => {
        const u = data?.user || data?.data?.user || data?.data || data;
        if (u && u.id) {
          setUser(u);
        }
      })
      .catch(() => {
        // If 401 or network error, logout
        logout();
      });
  }, []);

  if (isLoading) return <LoadingSpinner className="min-h-screen" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
