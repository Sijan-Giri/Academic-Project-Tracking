export const API_BASE_URL = 'http://localhost:4000/api';

export const PROJECT_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'badge-muted' },
  ABSTRACT_SUBMITTED: { label: 'Pending Review (Submitted)', className: 'badge-info' },
  ABSTRACT_APPROVED: { label: 'Abstract Approved', className: 'badge-success' },
  ABSTRACT_REJECTED: { label: 'Abstract Rejected', className: 'badge-danger' },
  IN_PROGRESS: { label: 'In Progress', className: 'badge-brand' },
  UNDER_REVIEW: { label: 'Pending Evaluation (In Review)', className: 'badge-warning' },
  COMPLETED: { label: 'Completed', className: 'badge-success' },
  CANCELLED: { label: 'Cancelled', className: 'badge-danger' },
};

export const MILESTONE_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  NOT_STARTED: { label: 'Not Started', className: 'badge-muted' },
  IN_PROGRESS: { label: 'In Progress', className: 'badge-info' },
  SUBMITTED: { label: 'Submitted', className: 'badge-brand' },
  UNDER_REVIEW: { label: 'Under Review', className: 'badge-warning' },
  APPROVED: { label: 'Approved', className: 'badge-success' },
  REJECTED: { label: 'Rejected', className: 'badge-danger' },
  REVISION_NEEDED: { label: 'Revision Needed', className: 'badge-warning' },
};

export const TEAM_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pending Approval', className: 'badge-warning' },
  APPROVED: { label: 'Approved', className: 'badge-success' },
  REJECTED: { label: 'Rejected', className: 'badge-danger' },
};

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  COORDINATOR: 'Coordinator / HOD',
  FACULTY: 'Faculty / Guide',
  PANEL: 'Panel / Evaluator',
  STUDENT: 'Student',
};

export const REVIEW_STAGE_LABELS: Record<string, string> = {
  ABSTRACT_REVIEW: 'Abstract Review',
  REVIEW_1: 'Review 1',
  REVIEW_2: 'Review 2',
  REVIEW_3: 'Review 3',
  PRE_SUBMISSION: 'Pre-Submission',
  FINAL_SUBMISSION: 'Final Submission',
};

export const LIFECYCLE_STAGES = [
  'Abstract Submission',
  'Abstract Approved',
  'Review 1',
  'Review 2',
  'Review 3',
  'Pre-Submission',
  'Final Submission',
];

export const PROJECT_LIFECYCLE_STAGE_MAP: Record<string, number> = {
  DRAFT: 0,
  ABSTRACT_SUBMITTED: 1,
  ABSTRACT_APPROVED: 2,
  ABSTRACT_REJECTED: 1,
  IN_PROGRESS: 3,
  UNDER_REVIEW: 4,
  COMPLETED: 5,
  CANCELLED: 0,
};
