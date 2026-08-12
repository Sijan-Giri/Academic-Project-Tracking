import { api } from './client';
import type { ApiResponse, GuideAssignment } from '@/types';

export const getGuideAssignments = async () => (await api.get<ApiResponse<GuideAssignment[]>>('/guides/assignments')).data;
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
