import { api } from './client';
import type { ApiResponse, AuditLog, PaginatedResponse, User } from '@/types';

export const getUsers = async (params?: any) => (await api.get<ApiResponse<PaginatedResponse<User>>>('/users', { params })).data;
export const getUser = async (id: string) => (await api.get<ApiResponse<User>>(`/users/${id}`)).data;
export const createUser = async (data: Partial<User>) => (await api.post<ApiResponse<User>>('/users', data)).data;
export const updateUser = async (id: string, data: Partial<User>) => (await api.put<ApiResponse<User>>(`/users/${id}`, data)).data;
export const deleteUser = async (id: string) => (await api.delete<ApiResponse<void>>(`/users/${id}`)).data;
export const activateUser = async (id: string) => (await api.post<ApiResponse<User>>(`/users/${id}/activate`)).data;
export const deactivateUser = async (id: string) => (await api.post<ApiResponse<User>>(`/users/${id}/deactivate`)).data;
export const getUserActivity = async (id: string) => (await api.get<ApiResponse<AuditLog[]>>(`/users/${id}/activity`)).data;
export const bulkImportStudents = async (formData: FormData) => (await api.post<ApiResponse<any>>('/users/bulk-import/students', formData)).data;
export const bulkImportFaculty = async (formData: FormData) => (await api.post<ApiResponse<any>>('/users/bulk-import/faculty', formData)).data;
