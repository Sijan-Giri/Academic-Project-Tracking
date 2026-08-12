import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store';
import type { Role } from '@/types';
import { refreshToken, getMe } from '@/api/auth.api';
import { handleSessionExpired } from '@/api/client';

interface RoleGuardProps {
  allowedRoles?: Role[];
}

export default function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { isAuthenticated, user, accessToken, isLoading, setAuth, setAccessToken, setLoading, clearAuth } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      
      if (isAuthenticated && user && accessToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        
        const refreshData = await refreshToken();
        const newAccessToken = refreshData?.accessToken;

        if (!newAccessToken) {
          if (isMounted) {
            clearAuth();
          }
          return;
        }

        setAccessToken(newAccessToken);

        const meData: any = await getMe();
        const userObj = meData?.user || meData?.data || meData;

        if (isMounted) {
          if (userObj && userObj.id) {
            setAuth(userObj, newAccessToken);
          } else {
            handleSessionExpired();
          }
        }
      } catch (error) {
        
        if (isMounted) {
          handleSessionExpired();
        }
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
