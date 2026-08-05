import { api } from './client';
import type { Announcement } from '@/types/notification.types';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

export const createAnnouncement = async (data: Partial<Announcement>) => (await api.post<ApiResponse<Announcement>>('/announcements', data)).data;
export const getAnnouncements = async (params?: any) => (await api.get<ApiResponse<PaginatedResponse<Announcement>>>('/announcements', { params })).data;
export const getAnnouncement = async (id: string) => (await api.get<ApiResponse<Announcement>>(`/announcements/${id}`)).data;
export const deleteAnnouncement = async (id: string) => (await api.delete<ApiResponse<void>>(`/announcements/${id}`)).data;
