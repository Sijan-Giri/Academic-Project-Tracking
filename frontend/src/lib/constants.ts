export const API_BASE_URL = 'http://localhost:4000/api';

export const PROJECT_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: 'Draft', color: 'text-white', bg: 'bg-gray-500/20' },
  ABSTRACT_SUBMITTED: { label: 'Abstract Submitted', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  ABSTRACT_APPROVED: { label: 'Abstract Approved', color: 'text-green-400', bg: 'bg-green-500/20' },
  ABSTRACT_REJECTED: { label: 'Abstract Rejected', color: 'text-red-400', bg: 'bg-red-500/20' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
  UNDER_REVIEW: { label: 'Under Review', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  COMPLETED: { label: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  CANCELLED: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/20' },
};

export const MILESTONE_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  NOT_STARTED: { label: 'Not Started', color: 'text-gray-400' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-blue-400' },
  SUBMITTED: { label: 'Submitted', color: 'text-indigo-400' },
  UNDER_REVIEW: { label: 'Under Review', color: 'text-yellow-400' },
  APPROVED: { label: 'Approved', color: 'text-green-400' },
  REJECTED: { label: 'Rejected', color: 'text-red-400' },
  REVISION_NEEDED: { label: 'Revision Needed', color: 'text-orange-400' },
};

export const TEAM_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pending Approval', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  APPROVED: { label: 'Approved', color: 'text-green-400', bg: 'bg-green-500/20' },
  REJECTED: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-500/20' },
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
