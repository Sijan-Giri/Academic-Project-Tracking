import { api } from './client';
import type { ApiResponse, PaginatedResponse, Submission } from '@/types';

export const createSubmission = async (formData: FormData) =>
  (await api.post<ApiResponse<Submission>>('/submissions', formData)).data;

export const getSubmissions = async (params?: any) =>
  (await api.get<ApiResponse<PaginatedResponse<Submission>>>('/submissions', { params })).data;

export const getSubmission = async (id: string) =>
  (await api.get<ApiResponse<Submission>>(`/submissions/${id}`)).data;

export const downloadFile = async (fileId: string, fallbackName?: string) => {
  const response = await api.get(`/files/${fileId}/download`, { responseType: 'blob' });

  const disposition = response.headers['content-disposition'];
  let filename = fallbackName || 'download';
  if (disposition) {
    const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (match && match[1]) {
      filename = match[1].replace(/['"]/g, '');
    }
  }

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const deleteFile = async (fileId: string) =>
  (await api.delete<ApiResponse<void>>(`/files/${fileId}`)).data;
