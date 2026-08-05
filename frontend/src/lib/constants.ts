export const API_BASE_URL = 'http://localhost:4000/api';

export const PROJECT_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border?: string }> = {
  DRAFT: { label: 'Draft', color: 'dark:text-slate-300 text-slate-700', bg: 'dark:bg-slate-500/20 bg-slate-100', border: 'dark:border-slate-500/30 border-slate-200' },
  ABSTRACT_SUBMITTED: { label: 'Abstract Submitted', color: 'dark:text-blue-400 text-blue-700', bg: 'dark:bg-blue-500/20 bg-blue-50', border: 'dark:border-blue-500/30 border-blue-200' },
  ABSTRACT_APPROVED: { label: 'Abstract Approved', color: 'dark:text-emerald-400 text-emerald-700', bg: 'dark:bg-emerald-500/20 bg-emerald-50', border: 'dark:border-emerald-500/30 border-emerald-200' },
  ABSTRACT_REJECTED: { label: 'Abstract Rejected', color: 'dark:text-rose-400 text-rose-700', bg: 'dark:bg-rose-500/20 bg-rose-50', border: 'dark:border-rose-500/30 border-rose-200' },
  IN_PROGRESS: { label: 'In Progress', color: 'dark:text-indigo-400 text-indigo-700', bg: 'dark:bg-indigo-500/20 bg-indigo-50', border: 'dark:border-indigo-500/30 border-indigo-200' },
  UNDER_REVIEW: { label: 'Under Review', color: 'dark:text-amber-400 text-amber-700', bg: 'dark:bg-amber-500/20 bg-amber-50', border: 'dark:border-amber-500/30 border-amber-200' },
  COMPLETED: { label: 'Completed', color: 'dark:text-emerald-400 text-emerald-700', bg: 'dark:bg-emerald-500/20 bg-emerald-50', border: 'dark:border-emerald-500/30 border-emerald-200' },
  CANCELLED: { label: 'Cancelled', color: 'dark:text-rose-400 text-rose-700', bg: 'dark:bg-rose-500/20 bg-rose-50', border: 'dark:border-rose-500/30 border-rose-200' },
};

export const MILESTONE_STATUS_CONFIG: Record<string, { label: string; color: string; bg?: string; border?: string }> = {
  NOT_STARTED: { label: 'Not Started', color: 'dark:text-slate-400 text-slate-600', bg: 'dark:bg-slate-500/20 bg-slate-100', border: 'dark:border-slate-500/30 border-slate-200' },
  IN_PROGRESS: { label: 'In Progress', color: 'dark:text-blue-400 text-blue-700', bg: 'dark:bg-blue-500/20 bg-blue-50', border: 'dark:border-blue-500/30 border-blue-200' },
  SUBMITTED: { label: 'Submitted', color: 'dark:text-indigo-400 text-indigo-700', bg: 'dark:bg-indigo-500/20 bg-indigo-50', border: 'dark:border-indigo-500/30 border-indigo-200' },
  UNDER_REVIEW: { label: 'Under Review', color: 'dark:text-amber-400 text-amber-700', bg: 'dark:bg-amber-500/20 bg-amber-50', border: 'dark:border-amber-500/30 border-amber-200' },
  APPROVED: { label: 'Approved', color: 'dark:text-emerald-400 text-emerald-700', bg: 'dark:bg-emerald-500/20 bg-emerald-50', border: 'dark:border-emerald-500/30 border-emerald-200' },
  REJECTED: { label: 'Rejected', color: 'dark:text-rose-400 text-rose-700', bg: 'dark:bg-rose-500/20 bg-rose-50', border: 'dark:border-rose-500/30 border-rose-200' },
  REVISION_NEEDED: { label: 'Revision Needed', color: 'dark:text-orange-400 text-orange-700', bg: 'dark:bg-orange-500/20 bg-orange-50', border: 'dark:border-orange-500/30 border-orange-200' },
};

export const TEAM_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border?: string }> = {
  PENDING: { label: 'Pending Approval', color: 'dark:text-amber-400 text-amber-700', bg: 'dark:bg-amber-500/20 bg-amber-50', border: 'dark:border-amber-500/30 border-amber-200' },
  APPROVED: { label: 'Approved', color: 'dark:text-emerald-400 text-emerald-700', bg: 'dark:bg-emerald-500/20 bg-emerald-50', border: 'dark:border-emerald-500/30 border-emerald-200' },
  REJECTED: { label: 'Rejected', color: 'dark:text-rose-400 text-rose-700', bg: 'dark:bg-rose-500/20 bg-rose-50', border: 'dark:border-rose-500/30 border-rose-200' },
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
