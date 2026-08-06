import { z } from 'zod';
import { ReviewStageType } from '@prisma/client';

export const createTemplateSchema = z.object({
  name: z.string().min(3),
  type: z.nativeEnum(ReviewStageType),
  description: z.string().optional(),
  order: z.number().int().min(1),
  isDefault: z.boolean().default(false),
  departmentId: z.string().uuid().optional(),
});

export const updateTemplateSchema = createTemplateSchema.partial();

export const createReviewStageSchema = z.object({
  templateId: z.string().optional().nullable(),
  semesterId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  name: z.string().min(2),
  type: z.nativeEnum(ReviewStageType),
  order: z.number().int().min(1),
  deadline: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateReviewStageSchema = createReviewStageSchema.partial();

export const createCriteriaSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  maxMarks: z.number().positive(),
  order: z.number().int().min(1),
});

export const updateCriteriaSchema = createCriteriaSchema.partial();
