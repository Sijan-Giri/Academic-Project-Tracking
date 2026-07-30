import { z } from 'zod';

export const createBatchSchema = z.object({
  departmentId: z.string().uuid(),
  academicYearId: z.string().uuid(),
  name: z.string().min(2),
  isActive: z.boolean().optional().default(true),
});

export const updateBatchSchema = createBatchSchema.partial();
