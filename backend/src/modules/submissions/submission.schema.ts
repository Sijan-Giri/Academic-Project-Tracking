import { z } from 'zod';

export const createSubmissionSchema = z.object({
  milestoneId: z.string().uuid(),
  notes: z.string().optional(),
});
