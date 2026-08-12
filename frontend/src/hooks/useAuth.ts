// ─────────────────────────────────────────────────────────────────────────────
// hooks/useAuth.ts
// Convenience hook to access authenticated user state from the auth store.
// Provides typed selectors to avoid accessing the store directly in components.
// ─────────────────────────────────────────────────────────────────────────────

import { useAuthStore } from '@/store/auth.store';
import type { User } from '@/types';

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  clearAuth: () => void;
}

/**
 * Hook to access current auth state.
 * @returns { user, isAuthenticated, isLoading, clearAuth }
 */
export function useAuth(): UseAuthReturn {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return { user, isAuthenticated, isLoading, clearAuth };
}
