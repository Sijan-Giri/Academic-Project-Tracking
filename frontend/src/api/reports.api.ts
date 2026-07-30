import { api } from './client';

const downloadBlob = (response: any, filename: string) => {
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadDeptSummary = async (params?: any) => {
  const response = await api.get('/reports/department-summary', { params, responseType: 'blob' });
  downloadBlob(response, 'department-summary.pdf');
};

export const downloadProjectStatus = async (params?: any) => {
  const response = await api.get('/reports/project-status', { params, responseType: 'blob' });
  downloadBlob(response, 'project-status.xlsx');
};

export const downloadDefaulters = async (params?: any) => {
  const response = await api.get('/reports/defaulters', { params, responseType: 'blob' });
  downloadBlob(response, 'defaulters.pdf');
};

export const downloadEvaluationMarks = async (params?: any) => {
  const response = await api.get('/reports/evaluation-marks', { params, responseType: 'blob' });
  downloadBlob(response, 'evaluation-marks.xlsx');
};

export const downloadAuditLog = async (params?: any) => {
  const response = await api.get('/reports/audit-log', { params, responseType: 'blob' });
  downloadBlob(response, 'audit-log.csv');
};
