import { z } from 'zod';
export const submitEvaluationSchema = z.object({
  projectId: z.string().uuid(),
  reviewStageId: z.string().uuid(),
  scores: z.array(z.object({
    criteriaId: z.string().uuid(),
    marks: z.number().min(0),
    remarks: z.string().optional(),
  })).min(1),
  feedback: z.string().optional(),
});
export const updateEvaluationSchema = z.object({
  scores: z.array(z.object({
    criteriaId: z.string().uuid(),
    marks: z.number().min(0),
    remarks: z.string().optional(),
  })).optional(),
  feedback: z.string().optional(),
});
