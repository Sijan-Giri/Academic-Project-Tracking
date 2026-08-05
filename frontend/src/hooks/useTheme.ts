// ─────────────────────────────────────────────────────────────────────────────
// hooks/useTheme.ts
// Convenience hook to access and control the application theme.
// ─────────────────────────────────────────────────────────────────────────────

import { useThemeStore } from '@/store/theme.store';

export interface UseThemeReturn {
  theme: 'light' | 'dark';
  isDark: boolean;
  toggleTheme: () => void;
}

/**
 * Hook to access current theme state and toggle function.
 * @returns { theme, isDark, toggleTheme }
 */
export function useTheme(): UseThemeReturn {
  const { theme, toggleTheme } = useThemeStore();
  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
  };
}
