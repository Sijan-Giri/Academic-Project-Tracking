import { api } from './client';
import { Evaluation, ApiResponse, PaginatedResponse } from '@/types';

export const submitEvaluation = async (data: Partial<Evaluation>) => (await api.post<ApiResponse<Evaluation>>('/evaluations', data)).data;
export const createEvaluation = submitEvaluation;
export const getEvaluations = async (params?: any) => (await api.get<ApiResponse<PaginatedResponse<Evaluation>>>('/evaluations', { params })).data;
export const getEvaluation = async (id: string) => (await api.get<ApiResponse<Evaluation>>(`/evaluations/${id}`)).data;
export const updateEvaluation = async (id: string, data: Partial<Evaluation>) => (await api.put<ApiResponse<Evaluation>>(`/evaluations/${id}`, data)).data;
export const lockEvaluation = async (id: string) => (await api.post<ApiResponse<Evaluation>>(`/evaluations/${id}/lock`)).data;
export const getProjectEvaluationSummary = async (projectId: string) => (await api.get<ApiResponse<any>>(`/evaluations/project/${projectId}/summary`)).data;
