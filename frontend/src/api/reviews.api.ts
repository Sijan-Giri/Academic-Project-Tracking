import {api} from './client';
import type { ReviewStageTemplate, ReviewStage, EvaluationCriteria } from '@/types/review.types';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

export const getTemplates = async () => (await api.get<ApiResponse<ReviewStageTemplate[]>>('/reviews/templates')).data;
export const createTemplate = async (data: Partial<ReviewStageTemplate>) => (await api.post<ApiResponse<ReviewStageTemplate>>('/reviews/templates', data)).data;
export const updateTemplate = async (id: string, data: Partial<ReviewStageTemplate>) => (await api.put<ApiResponse<ReviewStageTemplate>>(`/reviews/templates/${id}`, data)).data;
export const deleteTemplate = async (id: string) => (await api.delete<ApiResponse<void>>(`/reviews/templates/${id}`)).data;
export const getReviewStages = async (params?: any) => (await api.get<ApiResponse<PaginatedResponse<ReviewStage>>>('/reviews/stages', { params })).data;
export const createReviewStage = async (data: Partial<ReviewStage>) => (await api.post<ApiResponse<ReviewStage>>('/reviews/stages', data)).data;
export const updateReviewStage = async (id: string, data: Partial<ReviewStage>) => (await api.put<ApiResponse<ReviewStage>>(`/reviews/stages/${id}`, data)).data;
export const deleteReviewStage = async (id: string) => (await api.delete<ApiResponse<void>>(`/reviews/stages/${id}`)).data;
export const getStageCriteria = async (stageId: string) => (await api.get<ApiResponse<EvaluationCriteria[]>>(`/reviews/stages/${stageId}/criteria`)).data;
export const addCriteria = async (stageId: string, data: Partial<EvaluationCriteria>) => (await api.post<ApiResponse<EvaluationCriteria>>(`/reviews/stages/${stageId}/criteria`, data)).data;
export const updateCriteria = async (stageId: string, criteriaId: string, data: Partial<EvaluationCriteria>) => (await api.put<ApiResponse<EvaluationCriteria>>(`/reviews/stages/${stageId}/criteria/${criteriaId}`, data)).data;
export const deleteCriteria = async (stageId: string, criteriaId: string) => (await api.delete<ApiResponse<void>>(`/reviews/stages/${stageId}/criteria/${criteriaId}`)).data;
