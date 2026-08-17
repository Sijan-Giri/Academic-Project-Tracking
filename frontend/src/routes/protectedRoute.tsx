import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import type { Role } from '@/types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Role[];
  fallbackPath?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  fallbackPath = '/dashboard',
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return null;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role as Role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}

export { ProtectedRoute };
