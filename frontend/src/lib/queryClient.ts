import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // 30 seconds: data is considered fresh for 30s after fetching.
      // Prevents re-hitting the API on every component mount and route change.
      // Hooks that need fresher data (e.g. notifications) can override this locally.
      staleTime: 30_000,
      // Keep unused data in memory for 5 minutes before garbage-collecting it.
      gcTime: 5 * 60 * 1000,
      // Don't refetch just because the user switched browser tabs and came back.
      refetchOnWindowFocus: false,
    },
  },
});
