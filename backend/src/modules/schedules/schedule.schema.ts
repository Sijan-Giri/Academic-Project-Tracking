import { z } from 'zod';
import { ScheduleMode } from '@prisma/client';

export const createScheduleSchema = z.object({
  reviewStageId: z.string().uuid(),
  projectId: z.string().uuid(),
  scheduledAt: z.string().min(1, 'Scheduled date is required'),
  venue: z.string().optional(),
  mode: z.nativeEnum(ScheduleMode),
  notes: z.string().optional(),
  panelMemberIds: z.array(z.string().uuid()).optional(),
});

export const updateScheduleSchema = createScheduleSchema.partial();
export const addPanelSchema = z.object({ facultyProfileId: z.string().uuid() });
export const attendanceSchema = z.object({ isPresent: z.boolean() });
