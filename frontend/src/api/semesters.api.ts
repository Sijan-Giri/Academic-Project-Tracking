import { api } from './client';
import type { ApiResponse, PaginatedResponse, Semester } from '@/types';

export const getSemesters = async (params?: any) => (await api.get<ApiResponse<PaginatedResponse<Semester>>>('/semesters', { params })).data;
export const getSemester = async (id: string) => (await api.get<ApiResponse<Semester>>(`/semesters/${id}`)).data;
export const createSemester = async (data: Partial<Semester>) => (await api.post<ApiResponse<Semester>>('/semesters', data)).data;
export const updateSemester = async (id: string, data: Partial<Semester>) => (await api.put<ApiResponse<Semester>>(`/semesters/${id}`, data)).data;
export const deleteSemester = async (id: string) => (await api.delete<ApiResponse<void>>(`/semesters/${id}`)).data;
export const setCurrentSemester = async (id: string) => (await api.post<ApiResponse<Semester>>(`/semesters/${id}/set-current`)).data;
