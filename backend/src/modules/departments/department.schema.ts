import { z } from 'zod';
export const createDepartmentSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(10).toUpperCase(),
  description: z.string().optional(),
  hodId: z.string().uuid().optional(),
  isActive: z.boolean().optional().default(true),
});
export const updateDepartmentSchema = createDepartmentSchema.partial();
