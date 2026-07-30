import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { Role } from '@/types';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

interface RoleGuardProps { allowedRoles?: Role[]; }

export default function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  if (isLoading) return <LoadingSpinner className="min-h-screen" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
