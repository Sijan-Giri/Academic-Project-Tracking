
import { useQuery } from '@tanstack/react-query'; 
import { unwrapList } from '@/utils';
import type { Announcement } from '@/types';
import { getAnnouncements } from '@/api';

export const ANNOUNCEMENTS_QUERY_KEY = ['announcements'] as const;

export interface UseAnnouncementsReturn {
  announcements: Announcement[];
  isLoading: boolean;
  isError: boolean;
}

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
