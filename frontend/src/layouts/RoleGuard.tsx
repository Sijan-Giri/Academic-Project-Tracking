import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import type { Role } from '@/types/user.types';
import { PageSkeleton } from '@/components/shared/Skeletons';
import { refreshToken, getMe } from '@/api/auth.api';

interface RoleGuardProps {
  allowedRoles?: Role[];
}

export default function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { isAuthenticated, user, accessToken, isLoading, setAuth, setAccessToken, setLoading, clearAuth } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      // If we already have in-memory auth state, finish loading
      if (isAuthenticated && user && accessToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        // Step 1: Call refresh token API
        const refreshData = await refreshToken();
        const newAccessToken = refreshData?.accessToken;

        // Step 2: Check if there is accessToken
        if (!newAccessToken) {
          if (isMounted) clearAuth();
          return;
        }

        // Step 3: Save token in memory
        setAccessToken(newAccessToken);

        // Step 4: Call getMe API
        const meData: any = await getMe();
        const userObj = meData?.user || meData?.data || meData;

        if (isMounted) {
          if (userObj && userObj.id) {
            setAuth(userObj, newAccessToken);
          } else {
            clearAuth();
          }
        }
      } catch (error) {
        // If refresh fails or 401, clear auth state and redirect to login
        if (isMounted) clearAuth();
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
