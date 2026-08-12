
import { useAuthStore } from '@/store/auth.store';
import type { User } from '@/types';

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  clearAuth: () => void;
}

export function useAuth(): UseAuthReturn {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return { user, isAuthenticated, isLoading, clearAuth };
}
