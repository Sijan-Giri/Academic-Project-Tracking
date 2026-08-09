import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(5).max(200),
  abstract: z.string().min(50).optional(),
  domain: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  teamId: z.string().min(1, 'Team ID is required'),
  semesterId: z.string().optional(),
  githubLink: z.string().url().optional().or(z.literal('')),
});

export const updateProjectSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  abstract: z.string().min(50).optional(),
  domain: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  githubLink: z.string().url().optional().or(z.literal('')),
});

export const reviewAbstractSchema = z.object({
  status: z.enum(['ABSTRACT_APPROVED', 'ABSTRACT_REJECTED', 'REVISION_NEEDED']),
  comments: z.string().min(5),
});

export const abstractReviewStatusSchema = z.object({
  status: z.enum(['ABSTRACT_APPROVED', 'ABSTRACT_REJECTED']),
  comments: z.string(),
});
