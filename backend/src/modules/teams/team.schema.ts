import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().min(3).max(100),
  semesterId: z.string().optional(),
});

export const inviteMemberSchema = z.object({
  studentId: z.string(),
});

export const rejectTeamSchema = z.object({
  rejectionReason: z.string().min(5),
});

export const updateTeamSchema = z.object({
  name: z.string().min(3).max(100),
});
