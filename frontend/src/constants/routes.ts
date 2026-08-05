// ─────────────────────────────────────────────────────────────────────────────
// constants/routes.ts
// All application route paths as typed constants.
// Usage: navigate(ROUTES.DASHBOARD)
// ─────────────────────────────────────────────────────────────────────────────

export const ROUTES = {
  // ── Auth ──────────────────────────────────────────────────────────────
  LOGIN: '/login',
  REGISTER: '/register',

  // ── Common ────────────────────────────────────────────────────────────
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  NOTIFICATIONS: '/notifications',
  ANNOUNCEMENTS: '/announcements',
  REPORTS: '/reports',

  // ── Student ───────────────────────────────────────────────────────────
  MY_PROJECT: '/my-project',
  MY_PROJECT_CREATE: '/my-project/create',
  MY_PROJECT_ABSTRACT: '/my-project/abstract',
  MY_PROJECT_MILESTONES: '/my-project/milestones',
  MY_PROJECT_SUBMISSIONS: '/my-project/submissions',
  MY_TEAM: '/my-team',

  // ── Faculty ───────────────────────────────────────────────────────────
  FACULTY_PROJECTS: '/faculty/projects',
  MY_SCHEDULES: '/my-schedules',
  EVALUATION: (scheduleId: string) => `/evaluations/${scheduleId}`,

  // ── Coordinator ───────────────────────────────────────────────────────
  COORDINATOR_PROJECTS: '/coordinator/projects',
  COORDINATOR_PROJECT_DETAIL: (id: string) => `/coordinator/projects/${id}`,
  COORDINATOR_TEAMS: '/coordinator/teams',
  COORDINATOR_GUIDES: '/coordinator/guides',
  COORDINATOR_REVIEW_STAGES: '/coordinator/review-stages',
  COORDINATOR_SCHEDULES: '/coordinator/schedules',
  COORDINATOR_ANNOUNCEMENTS: '/coordinator/announcements',

  // ── Admin ─────────────────────────────────────────────────────────────
  ADMIN_DEPARTMENTS: '/admin/departments',
  ADMIN_ACADEMIC_YEARS: '/admin/academic-years',
  ADMIN_BATCHES: '/admin/batches',
  ADMIN_SEMESTERS: '/admin/semesters',
  ADMIN_USERS: '/admin/users',
  ADMIN_REVIEW_TEMPLATES: '/admin/review-templates',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_AUDIT: '/admin/audit',
} as const;
