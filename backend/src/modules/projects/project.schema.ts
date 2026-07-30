import { z } from 'zod';
import { ProjectStatus } from '@prisma/client';

export const createProjectSchema = z.object({
  title: z.string().min(5).max(200),
  abstract: z.string().min(50).optional(),
  domain: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  teamId: z.string().uuid(),
  semesterId: z.string().uuid(),
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
