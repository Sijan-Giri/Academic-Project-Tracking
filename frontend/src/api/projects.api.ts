import { api } from './client';
import type { Project } from '@/types/project.types';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

export const createProject = async (data: any) => (await api.post<ApiResponse<Project>>('/projects', data)).data;
export const getProjects = async (params?: any) => (await api.get<ApiResponse<PaginatedResponse<Project>>>('/projects', { params })).data;
export const getProject = async (id: string) => (await api.get<ApiResponse<Project>>(`/projects/${id}`)).data;
export const updateProject = async (id: string, data: Partial<Project>) => (await api.put<ApiResponse<Project>>(`/projects/${id}`, data)).data;
export const deleteProject = async (id: string) => (await api.delete<ApiResponse<void>>(`/projects/${id}`)).data;
export const submitAbstract = async (id: string) => (await api.post<ApiResponse<Project>>(`/projects/${id}/abstract/submit`)).data;
export const reviewAbstract = async (id: string, data: { status: string, comments: string }) => (await api.post<ApiResponse<Project>>(`/projects/${id}/abstract/review`, data)).data;
export const getMyProjects = async () => (await api.get<ApiResponse<Project[]>>('/projects/my-projects')).data;
export const getGuidedProjects = async () => (await api.get<ApiResponse<Project[]>>('/projects/guided')).data;
export const updateProjectStatus = async (id: string, status: string) => (await api.patch<ApiResponse<Project>>(`/projects/${id}/status`, { status })).data;
