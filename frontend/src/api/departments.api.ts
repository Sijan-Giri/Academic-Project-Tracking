import { api } from './client';
import type { ApiResponse, Department } from '@/types';

export const getDepartments = async () => (await api.get<ApiResponse<Department[]>>('/departments')).data;
export const getDepartment = async (id: string) => (await api.get<ApiResponse<Department>>(`/departments/${id}`)).data;
export const createDepartment = async (data: Partial<Department>) => (await api.post<ApiResponse<Department>>('/departments', data)).data;
export const updateDepartment = async (id: string, data: Partial<Department>) => (await api.put<ApiResponse<Department>>(`/departments/${id}`, data)).data;
export const deleteDepartment = async (id: string) => (await api.delete<ApiResponse<void>>(`/departments/${id}`)).data;
export const getDepartmentFaculty = async (id: string) => (await api.get<ApiResponse<any[]>>(`/departments/${id}/faculty`)).data;
export const getDepartmentBatches = async (id: string) => (await api.get<ApiResponse<any[]>>(`/departments/${id}/batches`)).data;
