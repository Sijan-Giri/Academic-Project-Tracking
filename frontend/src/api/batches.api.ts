import { api } from './client';
import { Batch, Semester, User, ApiResponse, PaginatedResponse } from '@/types';

export const getBatches = async (params?: any) => (await api.get<ApiResponse<PaginatedResponse<Batch>>>('/batches', { params })).data;
export const getBatch = async (id: string) => (await api.get<ApiResponse<Batch>>(`/batches/${id}`)).data;
export const createBatch = async (data: Partial<Batch>) => (await api.post<ApiResponse<Batch>>('/batches', data)).data;
export const updateBatch = async (id: string, data: Partial<Batch>) => (await api.put<ApiResponse<Batch>>(`/batches/${id}`, data)).data;
export const deleteBatch = async (id: string) => (await api.delete<ApiResponse<void>>(`/batches/${id}`)).data;
export const getBatchSemesters = async (id: string) => (await api.get<ApiResponse<Semester[]>>(`/batches/${id}/semesters`)).data;
export const getBatchStudents = async (id: string) => (await api.get<ApiResponse<User[]>>(`/batches/${id}/students`)).data;
