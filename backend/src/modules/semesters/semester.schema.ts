import { z } from 'zod';

export const createSemesterSchema = z.object({
  batchId: z.string().uuid(),
  number: z.number().int().min(1).max(8),
  name: z.string().min(2),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isActive: z.boolean().optional().default(true),
});

export const updateSemesterSchema = createSemesterSchema.partial();
