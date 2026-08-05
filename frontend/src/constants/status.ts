// ─────────────────────────────────────────────────────────────────────────────
// constants/status.ts
// Project lifecycle stage ordering and status mapping constants.
// Extracted from inline definitions in StudentDashboard.
// ─────────────────────────────────────────────────────────────────────────────

import type { ProjectStatus } from '@/types/project.types';

/**
 * Ordered stages of the project lifecycle displayed in the timeline.
 */
export const LIFECYCLE_STAGES: string[] = [
  'Abstract Submission',
  'Abstract Approved',
  'Review 1',
  'Review 2',
  'Review 3',
  'Pre-Submission',
  'Final Submission',
];

/**
 * Maps a ProjectStatus to its corresponding lifecycle stage index.
 * Used to highlight the current/completed stage in the timeline.
 */
export const PROJECT_LIFECYCLE_STAGE_MAP: Record<ProjectStatus, number> = {
  DRAFT: 0,
  ABSTRACT_SUBMITTED: 0,
  ABSTRACT_APPROVED: 1,
  ABSTRACT_REJECTED: 0,
  IN_PROGRESS: 2,
  UNDER_REVIEW: 3,
  COMPLETED: 6,
  CANCELLED: 0,
};
