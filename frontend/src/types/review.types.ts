
import type { User, FacultyProfile } from './user.types';
import type { Project } from './project.types';
import type { ScheduleMode } from './system.types';

export type ReviewStageType =
  | 'ABSTRACT_REVIEW'
  | 'REVIEW_1'
  | 'REVIEW_2'
  | 'REVIEW_3'
  | 'PRE_SUBMISSION'
  | 'FINAL_SUBMISSION';

export interface EvaluationCriteria {
  id: string;
  reviewStageId: string;
  name: string;
  description?: string;
  maxMarks: number;
  order: number;
}

export interface EvaluationScore {
  id: string;
  evaluationId: string;
  criteriaId: string;
  marks: number;
  remarks?: string;
  criteria?: EvaluationCriteria;
}

export interface Evaluation {
  id: string;
  projectId: string;
  reviewStageId: string;
  evaluatorId: string;
  totalMarks?: number;
  grade?: string;
  feedback?: string;
  isLocked: boolean;
  lockedAt?: string;
  createdAt: string;
  scores?: EvaluationScore[];
}

export interface ReviewStageTemplate {
  id: string;
  name: string;
  type: ReviewStageType;
  description?: string;
  order: number;
  isDefault: boolean;
  departmentId?: string;
}

export interface ReviewStage {
  id: string;
  templateId: string;
  semesterId: string;
  departmentId: string;
  name: string;
  type: ReviewStageType;
  order: number;
  deadline?: string;
  isActive: boolean;
  criteria?: EvaluationCriteria[];
}

export interface PanelAssignment {
  id: string;
  scheduleId: string;
  facultyProfileId: string;
  isPresent?: boolean;
  facultyProfile?: FacultyProfile & { user: User };
}

export interface ReviewSchedule {
  id: string;
  reviewStageId: string;
  projectId: string;
  scheduledAt: string;
  venue?: string;
  mode: ScheduleMode;
  notes?: string;
  isCompleted: boolean;
  panelAssignments?: PanelAssignment[];
  project?: Project;
  reviewStage?: ReviewStage;
}
