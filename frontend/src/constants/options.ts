
export const DOMAINS = [
  'Web Development',
  'Mobile App',
  'Machine Learning',
  'IoT',
  'Cybersecurity',
  'Data Science',
  'Embedded Systems',
  'Cloud Computing',
  'Blockchain',
  'Other',
] as const;

export const AUDIT_ACTIONS = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'STATUS_CHANGE',
  'LOGIN',
  'LOGOUT',
  'FILE_UPLOAD',
  'MARKS_LOCK',
  'MARKS_ENTRY',
] as const;

export const ACTION_COLORS: Record<string, string> = {
  CREATE: 'badge-success',
  UPDATE: 'badge-info',
  DELETE: 'badge-danger',
  STATUS_CHANGE: 'badge-warning',
  LOGIN: 'badge-brand',
  LOGOUT: 'badge-muted',
  FILE_UPLOAD: 'badge-brand',
  MARKS_LOCK: 'badge-warning',
  MARKS_ENTRY: 'badge-info',
};

export const REVIEW_STAGE_TYPES = [
  'ABSTRACT_REVIEW',
  'REVIEW_1',
  'REVIEW_2',
  'REVIEW_3',
  'PRE_SUBMISSION',
  'FINAL_SUBMISSION',
] as const;

export const ROLE_OPTIONS = [
  { label: 'All Roles', value: 'ALL' },
  { label: 'Student', value: 'STUDENT' },
  { label: 'Faculty / Guide', value: 'FACULTY' },
  { label: 'Coordinator / HOD', value: 'COORDINATOR' },
  { label: 'Panel / Evaluator', value: 'PANEL' },
  { label: 'Administrator', value: 'ADMIN' },
] as const;

export const PROJECT_STATUS_TABS = [
  { label: 'All Projects', value: 'ALL' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Abstract Submitted', value: 'ABSTRACT_SUBMITTED' },
  { label: 'Abstract Approved', value: 'ABSTRACT_APPROVED' },
  { label: 'Abstract Rejected', value: 'ABSTRACT_REJECTED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Under Review', value: 'UNDER_REVIEW' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
] as const;

export const TEAM_STATUS_TABS = [
  { label: 'All Teams', value: 'ALL' },
  { label: 'Pending Approval', value: 'PENDING' },
  { label: 'Approved Teams', value: 'APPROVED' },
  { label: 'Rejected Teams', value: 'REJECTED' },
] as const;

export const ANNOUNCEMENT_TARGETS = [
  { label: 'All Users', value: 'ALL' },
  { label: 'Students Only', value: 'STUDENTS' },
  { label: 'Faculty Only', value: 'FACULTY' },
  { label: 'Coordinators Only', value: 'COORDINATOR' },
] as const;

export const REPORT_TYPES = [
  { id: 'dept-summary', label: 'Department Summary Report', description: 'Comprehensive department-wide project statistics & metrics.' },
  { id: 'project-status', label: 'Project Status Report', description: 'Complete roster of active projects and current lifecycle stages.' },
  { id: 'defaulters', label: 'Defaulters & Pending Submissions Report', description: 'List of teams with overdue milestone deliverables.' },
  { id: 'evaluations', label: 'Evaluation Marks Sheet', description: 'Final marks compilation across all review stages.' },
  { id: 'audit-log', label: 'System Audit Log Export', description: 'Complete security audit trails and administrative actions.' },
] as const;

export const NOTIFICATION_TYPE_FILTERS = [
  { label: 'All Activity Types', value: 'ALL' },
  { label: 'Deadlines & Milestones', value: 'DEADLINE_REMINDER' },
  { label: 'Status Updates', value: 'STATUS_CHANGE' },
  { label: 'Reviews & Feedback', value: 'FEEDBACK' },
  { label: 'Announcements', value: 'ANNOUNCEMENT' },
  { label: 'General Notifications', value: 'GENERAL' },
] as const;
