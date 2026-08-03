import { api } from './client';
import { Notification } from '@/types';

export const getMyNotifications = async (params?: any): Promise<Notification[]> => {
  const res = await api.get('/notifications', { params });
  const data = res.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

export const getNotifications = getMyNotifications;

export const markRead = async (id: string) => {
  const res = await api.post(`/notifications/${id}/read`);
  return res.data;
};

export const markAllRead = async () => {
  const res = await api.post('/notifications/read-all');
  return res.data;
};

export const getUnreadCount = async (): Promise<number> => {
  const res = await api.get('/notifications/unread-count');
  const data = res.data;
  if (typeof data?.data === 'number') return data.data;
  if (typeof data?.data?.count === 'number') return data.data.count;
  if (typeof data?.count === 'number') return data.count;
  if (typeof data === 'number') return data;
  return 0;
};
