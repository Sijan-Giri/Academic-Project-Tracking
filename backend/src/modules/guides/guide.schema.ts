import { z } from 'zod';

export const submitPreferencesSchema = z.object({
  projectId: z.string().uuid(),
  preferences: z.array(z.object({
    facultyProfileId: z.string().uuid(),
    rank: z.number().int().min(1).max(3),
  })).min(1).max(3),
});

export const assignGuideSchema = z.object({
  projectId: z.string().uuid(),
  facultyProfileId: z.string().uuid(),
});

export const rejectPreferenceSchema = z.object({
  note: z.string().optional(),
});
