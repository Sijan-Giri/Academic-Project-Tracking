
import { useThemeStore } from '@/store/theme.store';

export interface UseThemeReturn {
  theme: 'light' | 'dark';
  isDark: boolean;
  toggleTheme: () => void;
}

export function useTheme(): UseThemeReturn {
  const { theme, toggleTheme } = useThemeStore();
  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
  };
}
