import { api } from './client';
import { loginSchema } from '../lib/validators';
import { z } from 'zod';
import { User } from '../types';

export const login = async (data: z.infer<typeof loginSchema>) => {
  const res = await api.post<{ user: User; token: string }>('/auth/login', data);
  return res.data;
};

export const logout = async () => {
  await api.post('/auth/logout');
};

export const getMe = async () => {
  const res = await api.get<User>('/auth/me');
  return res.data;
};
