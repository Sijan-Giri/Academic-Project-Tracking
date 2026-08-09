// ─────────────────────────────────────────────
// Project, Team, Milestone & Submission types
// ─────────────────────────────────────────────

import type { User, StudentProfile, FacultyProfile } from './user.types';

export type ProjectStatus =
  | 'DRAFT'
  | 'ABSTRACT_SUBMITTED'
  | 'ABSTRACT_APPROVED'
  | 'ABSTRACT_REJECTED'
  | 'IN_PROGRESS'
  | 'UNDER_REVIEW'
  | 'COMPLETED'
  | 'CANCELLED';

export type MilestoneStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'REVISION_NEEDED';

export type TeamStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// ── File / Submission ─────────────────────────

export interface FileRecord {
  id: string;
  originalName: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface Submission {
  id: string;
  milestoneId: string;
  submittedById: string;
  submittedAt: string;
  notes?: string;
  version: number;
  files?: FileRecord[];
}

export interface Milestone {
  id: string;
  projectId: string;
  reviewStageId?: string;
  name: string;
  description?: string;
  deadline?: string;
  status: MilestoneStatus;
  requiredDocuments: string[];
  order: number;
  submissions?: Submission[];
}

// ── Guide ─────────────────────────────────────

export interface GuideAssignment {
  id: string;
  projectId: string;
  facultyProfileId: string;
  assignedAt: string;
  isActive: boolean;
  facultyProfile?: FacultyProfile & { user: User };
}



// ── Team / Project ────────────────────────────

export interface TeamMember {
  id: string;
  teamId: string;
  studentProfileId: string;
  isLeader: boolean;
  studentProfile?: StudentProfile & { user: User };
}

export interface Team {
  id: string;
  name: string;
  semesterId: string;
  status: TeamStatus;
  approvedById?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  members?: TeamMember[];
  project?: Project;
}

export interface Project {
  id: string;
  title: string;
  abstract?: string;
  domain?: string;
  keywords: string[];
  status: ProjectStatus;
  semesterId: string;
  teamId: string;
  githubLink?: string;
  plagiarismScore?: number;
  createdAt: string;
  updatedAt: string;
  team?: Team;
  guideAssignment?: GuideAssignment;
  milestones?: Milestone[];
}
