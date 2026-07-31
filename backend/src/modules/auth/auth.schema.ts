import { z } from 'zod';
import { Role } from '@prisma/client';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(Role).default(Role.STUDENT),
  departmentId: z.string().optional(),
  batchId: z.string().optional(),
  studentId: z.string().optional(),
  facultyId: z.string().optional(),
  phone: z.string().optional(),
  designation: z.string().optional(),
  specialization: z.string().optional(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).transform(data => ({
  oldPassword: data.oldPassword || data.currentPassword || '',
  newPassword: data.newPassword,
}));
