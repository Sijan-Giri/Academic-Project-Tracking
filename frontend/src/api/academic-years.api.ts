import { api } from './client';
import type { AcademicYear } from '@/types/system.types';
import type { ApiResponse } from '@/types/api.types';

export const getAcademicYears = async () => (await api.get<ApiResponse<AcademicYear[]>>('/academic-years')).data;
export const getAcademicYear = async (id: string) => (await api.get<ApiResponse<AcademicYear>>(`/academic-years/${id}`)).data;
export const createAcademicYear = async (data: Partial<AcademicYear>) => (await api.post<ApiResponse<AcademicYear>>('/academic-years', data)).data;
export const updateAcademicYear = async (id: string, data: Partial<AcademicYear>) => (await api.put<ApiResponse<AcademicYear>>(`/academic-years/${id}`, data)).data;
export const deleteAcademicYear = async (id: string) => (await api.delete<ApiResponse<void>>(`/academic-years/${id}`)).data;
