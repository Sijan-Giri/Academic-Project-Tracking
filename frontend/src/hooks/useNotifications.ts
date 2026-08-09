// ─────────────────────────────────────────────────────────────────────────────
// hooks/useNotifications.ts
// Custom hook to fetch and manage the current user's notifications.
// Encapsulates query key, query function, count, and read-state mutations.
// Used in: NotificationDropdown, NotificationsPage
// ─────────────────────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
} from '@/api/notifications.api';
import type { Notification } from '@/types/notification.types';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const;
export const UNREAD_COUNT_QUERY_KEY = ['notifications-unread-count'] as const;

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

/**
 * Hook to fetch notifications and expose read-state mutation helpers.
 * Accepts options.enabled (default true) to conditionally trigger API calls only when needed.
 */
export function useNotifications(options?: { enabled?: boolean }): UseNotificationsReturn {
  const queryClient = useQueryClient();
  const enabled = options?.enabled ?? true;

  const { data: rawNotifications = [], isLoading } = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: () => getMyNotifications({ limit: 20 }),
    enabled,
  });

  const { data: unreadCountData } = useQuery({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: getUnreadCount,
    enabled,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
  };

  const { mutate: markAsRead } = useMutation({
    mutationFn: markRead,
    onSuccess: invalidate,
  });

  const { mutate: markAllAsRead } = useMutation({
    mutationFn: markAllRead,
    onSuccess: invalidate,
  });

  const notifications = Array.isArray(rawNotifications) ? rawNotifications : [];
  const unreadCount = typeof unreadCountData === 'number' ? unreadCountData : 0;

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    markRead: markAsRead,
    markAllRead: markAllAsRead,
  };
}
