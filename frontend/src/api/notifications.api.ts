import { api } from './client';
import { Notification, ApiResponse, PaginatedResponse } from '@/types';

export const getMyNotifications = async (params?: any) => (await api.get<ApiResponse<PaginatedResponse<Notification>>>('/notifications', { params })).data;
export const getNotifications = getMyNotifications;
export const markRead = async (id: string) => (await api.post<ApiResponse<Notification>>(`/notifications/${id}/read`)).data;
export const markAllRead = async () => (await api.post<ApiResponse<void>>('/notifications/read-all')).data;
export const getUnreadCount = async () => (await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count')).data;
