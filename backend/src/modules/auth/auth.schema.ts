import { z } from 'zod';
import { Role } from '@prisma/client';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(Role),
  departmentId: z.string().uuid().optional(),
  batchId: z.string().uuid().optional(),
  studentId: z.string().optional(),
  facultyId: z.string().optional(),
  phone: z.string().optional(),
  designation: z.string().optional(),
  specialization: z.string().optional(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string().min(8),
});
