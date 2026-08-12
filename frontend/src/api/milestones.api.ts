import { api } from './client';
import type { ApiResponse, Milestone, PaginatedResponse } from '@/types';

export const getMilestones = async (params?: any) => (await api.get<ApiResponse<PaginatedResponse<Milestone>>>('/milestones', { params })).data;
export const getMilestone = async (id: string) => (await api.get<ApiResponse<Milestone>>(`/milestones/${id}`)).data;
export const createMilestone = async (data: Partial<Milestone>) => (await api.post<ApiResponse<Milestone>>('/milestones', data)).data;
export const updateMilestone = async (id: string, data: Partial<Milestone>) => (await api.put<ApiResponse<Milestone>>(`/milestones/${id}`, data)).data;
export const deleteMilestone = async (id: string) => (await api.delete<ApiResponse<void>>(`/milestones/${id}`)).data;
export const updateMilestoneStatus = async (id: string, status: string) => (await api.put<ApiResponse<Milestone>>(`/milestones/${id}/status`, { status })).data;
