import { z } from 'zod';

export const assignGuideSchema = z.object({
  projectId: z.string().uuid(),
  facultyProfileId: z.string().uuid(),
});
