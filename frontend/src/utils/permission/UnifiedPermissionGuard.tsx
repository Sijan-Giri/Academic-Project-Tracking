import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store';
import type { Role } from '@/types';

interface UnifiedPermissionGuardProps {
  allowedRoles?: Role[];
  children?: React.ReactNode;
  fallbackPath?: string;
}

export function UnifiedPermissionGuard({
  allowedRoles,
  children,
  fallbackPath = '/dashboard',
}: UnifiedPermissionGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return null;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role as Role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

export default UnifiedPermissionGuard;
