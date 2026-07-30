import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(10),
  departmentIds: z.array(z.string()).optional(),
  batchIds: z.array(z.string()).optional(),
  semesterIds: z.array(z.string()).optional(),
});
