import { z } from 'zod';
import { MilestoneStatus } from '@prisma/client';

export const createMilestoneSchema = z.object({
  projectId: z.string().uuid(),
  reviewStageId: z.string().uuid().optional(),
  name: z.string().min(3),
  description: z.string().optional(),
  deadline: z.string().datetime(),
  requiredDocuments: z.array(z.string()).default([]),
  order: z.number().int().min(1),
});

export const updateMilestoneSchema = createMilestoneSchema.omit({ projectId: true }).partial();

export const updateMilestoneStatusSchema = z.object({
  status: z.nativeEnum(MilestoneStatus),
});
