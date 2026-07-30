import { z } from 'zod';
import { Role } from '@prisma/client';

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.nativeEnum(Role),
  phone: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  batchId: z.string().uuid().optional(),
  studentId: z.string().optional(),
  facultyId: z.string().optional(),
  designation: z.string().optional(),
  specialization: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  designation: z.string().optional(),
  specialization: z.string().optional(),
});
