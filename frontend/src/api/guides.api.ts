import { api } from './client';
import type { GuidePreference, GuideAssignment } from '@/types/project.types';
import type { ApiResponse } from '@/types/api.types';

export const submitGuidePreferences = async (data: any) => (await api.post<ApiResponse<GuidePreference[]>>('/guides/preferences', data)).data;
export const getGuidePreferences = async (projectId: string) => (await api.get<ApiResponse<GuidePreference[]>>(`/guides/preferences/${projectId}`)).data;
export const getAllGuidePreferences = async () => (await api.get<ApiResponse<GuidePreference[]>>('/guides/preferences/all')).data;
export const getGuideAssignments = async () => (await api.get<ApiResponse<GuideAssignment[]>>('/guides/assignments')).data;
export const approvePreference = async (preferenceId: string) => (await api.patch<ApiResponse<GuidePreference>>(`/guides/preferences/${preferenceId}/approve`)).data;
export const rejectPreference = async (preferenceId: string, note?: string) => (await api.patch<ApiResponse<GuidePreference>>(`/guides/preferences/${preferenceId}/reject`, { note })).data;
export const assignGuide = async (data: any) => (await api.post<ApiResponse<GuideAssignment>>('/guides/assign', data)).data;
export const removeGuideAssignment = async (assignmentId: string) => (await api.delete<ApiResponse<void>>(`/guides/assign/${assignmentId}`)).data;

export const getAvailableGuides = async () => {
  const res = await api.get('/guides/available');
  const data = res.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};
