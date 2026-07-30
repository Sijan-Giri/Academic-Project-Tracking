import axios from 'axios';
import { API_BASE_URL } from '../lib/constants';
import { useAuthStore } from '../store/auth.store';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Attach in-memory Access Token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthenticated requests
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !isAuthRoute && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        const newAccessToken = res.data?.accessToken;
        if (newAccessToken) {
          useAuthStore.getState().setAccessToken(newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        useAuthStore.getState().clearAuth();
      }
    }
    return Promise.reject(error);
  }
);
