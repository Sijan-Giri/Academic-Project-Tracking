import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 0, // Always consider queries stale so components fetch fresh data on mount
      refetchOnMount: 'always', // Always refetch when page/component mounts
      refetchOnWindowFocus: false,
    },
  },
});
