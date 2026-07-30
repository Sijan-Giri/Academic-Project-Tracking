import { api } from './client';
import { Submission, ApiResponse, PaginatedResponse } from '@/types';

export const createSubmission = async (formData: FormData) => (await api.post<ApiResponse<Submission>>('/submissions', formData)).data;
export const getSubmissions = async (params?: any) => (await api.get<ApiResponse<PaginatedResponse<Submission>>>('/submissions', { params })).data;
export const getSubmission = async (id: string) => (await api.get<ApiResponse<Submission>>(`/submissions/${id}`)).data;
export const downloadFile = async (fileId: string) => {
  const response = await api.get(`/submissions/files/${fileId}/download`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'file'); // Replace with proper filename if available in headers
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
export const deleteFile = async (fileId: string) => (await api.delete<ApiResponse<void>>(`/submissions/files/${fileId}`)).data;
