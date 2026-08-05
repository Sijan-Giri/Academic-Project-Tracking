import { create } from 'zustand';
import type { User } from '@/types/user.types';
import { queryClient } from '@/lib/queryClient';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User | null, accessToken: string | null) => void;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  setAuth: (user, accessToken) => {
    queryClient.clear();
    set({ user, accessToken, isAuthenticated: true, isLoading: false });
  },
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setLoading: (isLoading) => set({ isLoading }),
  clearAuth: () => {
    queryClient.clear();
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
  },
}));
