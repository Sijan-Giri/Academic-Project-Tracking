// ─────────────────────────────────────────────────────────────────────────────
// hooks/useAnnouncements.ts
// Custom hook to fetch announcements for dashboards and notification views.
// ─────────────────────────────────────────────────────────────────────────────

import { useQuery } from '@tanstack/react-query';
import { getAnnouncements } from '@/api/announcements.api';
import { unwrapList } from '@/utils/apiUtils';
import type { Announcement } from '@/types/notification.types';

export const ANNOUNCEMENTS_QUERY_KEY = ['announcements'] as const;

export interface UseAnnouncementsReturn {
  announcements: Announcement[];
  isLoading: boolean;
  isError: boolean;
}

/**
 * Hook to fetch and unwrap announcements list.
 */
export function useAnnouncements(params?: Record<string, unknown>): UseAnnouncementsReturn {
  const { data, isLoading, isError } = useQuery({
    queryKey: params ? [...ANNOUNCEMENTS_QUERY_KEY, params] : ANNOUNCEMENTS_QUERY_KEY,
    queryFn: () => getAnnouncements(params),
  });

  return {
    announcements: unwrapList<Announcement>(data),
    isLoading,
    isError,
  };
}
