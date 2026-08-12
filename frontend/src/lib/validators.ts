import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string().min(8),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const projectSchema = z.object({
  title: z.string().min(5),
  abstract: z.string().min(50),
  domain: z.string().min(1),
  keywords: z.array(z.string()).min(1),
});

export const teamSchema = z.object({
  name: z.string().min(3),
});

export const milestoneSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  deadline: z.string(),
  requiredDocuments: z.array(z.string()),
  order: z.number(),
});

export const reviewStageSchema = z.object({
  name: z.string(),
  type: z.enum(['ABSTRACT_REVIEW', 'REVIEW_1', 'REVIEW_2', 'REVIEW_3', 'PRE_SUBMISSION', 'FINAL_SUBMISSION']),
  description: z.string().optional(),
  order: z.number(),
  deadline: z.string().optional(),
});

export const evaluationCriteriaSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  maxMarks: z.number().min(1),
});

export const evaluationSubmitSchema = z.object({
  scores: z.array(z.object({
    criteriaId: z.string(),
    marks: z.number(),
    remarks: z.string().optional(),
  })),
  feedback: z.string().optional(),
});

export const announcementSchema = z.object({
  title: z.string(),
  content: z.string(),
  departmentIds: z.array(z.string()).optional(),
  batchIds: z.array(z.string()).optional(),
  semesterIds: z.array(z.string()).optional(),
});

export const userCreateSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['ADMIN', 'COORDINATOR', 'FACULTY', 'PANEL', 'STUDENT']),
  departmentId: z.string().optional(),
  batchId: z.string().optional(),
  studentId: z.string().optional(),
  facultyId: z.string().optional(),
  phone: z.string().optional(),
});

export const scheduleSchema = z.object({
  reviewStageId: z.string(),
  projectId: z.string(),
  scheduledAt: z.string(),
  venue: z.string().optional(),
  mode: z.enum(['ONLINE', 'OFFLINE']),
  notes: z.string().optional(),
});
