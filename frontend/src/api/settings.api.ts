import { api } from './client';
import { Settings, ApiResponse } from '@/types';

export const getSettings = async () => (await api.get<ApiResponse<Settings[]>>('/settings')).data;
export const updateSetting = async (key: string, value: string) => (await api.put<ApiResponse<Settings>>(`/settings/${key}`, { value })).data;
export const getPublicSettings = async () => (await api.get<ApiResponse<Settings[]>>('/settings/public')).data;
