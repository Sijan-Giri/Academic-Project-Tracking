import { api } from './client';
import { loginSchema } from '../lib/validators';
import { z } from 'zod';
import type { User } from '@/types/user.types';

export const login = async (data: z.infer<typeof loginSchema>) => {
  const res = await api.post<{ user: User; accessToken: string; refreshToken: string }>('/auth/login', data);
  return res.data;
};

export const signup = async (data: any) => {
  const res = await api.post<{ user: User; accessToken: string; refreshToken: string }>('/auth/signup', data);
  return res.data;
};

export const refreshToken = async () => {
  const res = await api.post<{ accessToken: string }>('/auth/refresh');
  return res.data;
};

export const logout = async () => {
  await api.post('/auth/logout');
};

export const getMe = async () => {
  const res = await api.get<User>('/auth/me');
  return res.data;
};

export const changePassword = async (data: any) => {
  const payload = {
    oldPassword: data.oldPassword || data.currentPassword,
    currentPassword: data.currentPassword || data.oldPassword,
    newPassword: data.newPassword,
  };
  const res = await api.put('/auth/change-password', payload);
  return res.data;
};

export const updateProfile = async (data: any) => {
  const res = await api.put('/users/profile', data);
  return res.data;
};
