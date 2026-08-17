import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '@/lib/constants';
import { useAuthStore } from '@/store';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const api = axiosInstance;

let isHandlingSessionExpired = false;

export function handleSessionExpired(notifyUser = true) {
  const isAlreadyOnLogin = window.location.pathname === '/login';

  if (!isHandlingSessionExpired) {
    isHandlingSessionExpired = true;

    useAuthStore.getState().clearAuth();

    if (notifyUser && !isAlreadyOnLogin) {
      toast.error('Your session has expired. Please sign in again to continue.', {
        id: 'session-expired',
        duration: 5000,
      });
    }

    if (!isAlreadyOnLogin) {
      window.location.href = '/login?reason=expired';
    }

    setTimeout(() => {
      isHandlingSessionExpired = false;
    }, 3000);
  }
}

axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !isAuthRoute) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
          const newAccessToken = res.data?.accessToken;
          if (newAccessToken) {
            useAuthStore.getState().setAccessToken(newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosInstance(originalRequest);
          } else {
            handleSessionExpired();
          }
        } catch (refreshErr) {
          handleSessionExpired();
          return Promise.reject(refreshErr);
        }
      } else {
        handleSessionExpired();
      }
    }
    return Promise.reject(error);
  }
);
