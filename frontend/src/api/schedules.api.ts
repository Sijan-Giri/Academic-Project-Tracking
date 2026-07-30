import { api } from './client';
import { ReviewSchedule, ApiResponse, PaginatedResponse } from '@/types';

export const createSchedule = async (data: Partial<ReviewSchedule>) => (await api.post<ApiResponse<ReviewSchedule>>('/schedules', data)).data;
export const getSchedules = async (params?: any) => (await api.get<ApiResponse<PaginatedResponse<ReviewSchedule>>>('/schedules', { params })).data;
export const getSchedule = async (id: string) => (await api.get<ApiResponse<ReviewSchedule>>(`/schedules/${id}`)).data;
export const updateSchedule = async (id: string, data: Partial<ReviewSchedule>) => (await api.put<ApiResponse<ReviewSchedule>>(`/schedules/${id}`, data)).data;
export const deleteSchedule = async (id: string) => (await api.delete<ApiResponse<void>>(`/schedules/${id}`)).data;
export const assignPanelMember = async (scheduleId: string, facultyProfileId: string) => (await api.post<ApiResponse<any>>(`/schedules/${scheduleId}/panel`, { facultyProfileId })).data;
export const removePanelMember = async (scheduleId: string, facultyProfileId: string) => (await api.delete<ApiResponse<void>>(`/schedules/${scheduleId}/panel/${facultyProfileId}`)).data;
export const markAttendance = async (scheduleId: string, isPresent: boolean) => (await api.post<ApiResponse<any>>(`/schedules/${scheduleId}/attendance`, { isPresent })).data;
export const completeSchedule = async (scheduleId: string) => (await api.post<ApiResponse<any>>(`/schedules/${scheduleId}/complete`)).data;
export const getMySchedules = async () => (await api.get<ApiResponse<ReviewSchedule[]>>('/schedules/my-schedules')).data;
