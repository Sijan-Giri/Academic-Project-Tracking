import { lazy } from 'react';
import type { Role } from '@/types';

// Lazy-loaded page components
const DashboardIndex = lazy(() => import('@/features/dashboard/DashboardIndex'));
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage'));
const NotificationsPage = lazy(() => import('@/features/notifications/NotificationsPage'));
const AnnouncementsPage = lazy(() => import('@/features/notifications/AnnouncementsPage'));
const ReportsPage = lazy(() => import('@/features/reports/ReportsPage'));
const ChatPage = lazy(() => import('@/features/chat/ChatPage'));

// Admin Pages
const DepartmentsPage = lazy(() => import('@/features/admin/DepartmentsPage'));
const AcademicYearsPage = lazy(() => import('@/features/admin/AcademicYearsPage'));
const BatchesPage = lazy(() => import('@/features/admin/BatchesPage'));
const SemestersPage = lazy(() => import('@/features/admin/SemestersPage'));
const UsersPage = lazy(() => import('@/features/admin/UsersPage'));
const ReviewTemplatesPage = lazy(() => import('@/features/admin/ReviewTemplatesPage'));
const SettingsPage = lazy(() => import('@/features/admin/SettingsPage'));
const AuditLogPage = lazy(() => import('@/features/admin/AuditLogPage'));

// Coordinator Pages
const CoordProjectsPage = lazy(() => import('@/features/coordinator/ProjectsPage'));
const CoordProjectDetailPage = lazy(() => import('@/features/coordinator/ProjectDetailPage'));
const TeamApprovalsPage = lazy(() => import('@/features/coordinator/TeamApprovalsPage'));
const GuideAllocationPage = lazy(() => import('@/features/coordinator/GuideAllocationPage'));
const ReviewStagesPage = lazy(() => import('@/features/coordinator/ReviewStagesPage'));
const SchedulesPage = lazy(() => import('@/features/coordinator/SchedulesPage'));
const CoordAnnouncementsPage = lazy(() => import('@/features/coordinator/AnnouncementsPage'));

// Faculty Pages
const GuidedProjectsPage = lazy(() => import('@/features/faculty/GuidedProjectsPage'));

// Student Pages
const MyProjectPage = lazy(() => import('@/features/student/MyProjectPage'));
const CreateProjectPage = lazy(() => import('@/features/student/CreateProjectPage'));
const MyTeamPage = lazy(() => import('@/features/student/MyTeamPage'));
const AbstractPage = lazy(() => import('@/features/student/AbstractPage'));
const MilestonesPage = lazy(() => import('@/features/student/MilestonesPage'));
const StudentSubmissionsPage = lazy(() => import('@/features/student/SubmissionsPage'));

// Evaluation Pages
const MySchedulesPage = lazy(() => import('@/features/evaluations/MySchedulesPage'));
const EvaluationFormPage = lazy(() => import('@/features/evaluations/EvaluationFormPage'));

export interface AppRouteItem {
  path: string;
  component: React.ComponentType<any>;
  roles?: Role[];
  title?: string;
  exact?: boolean;
}

export const generalRoutes: AppRouteItem[] = [
  { path: '/dashboard', component: DashboardIndex, title: 'Dashboard' },
  { path: '/profile', component: ProfilePage, title: 'Profile' },
  { path: '/notifications', component: NotificationsPage, title: 'Notifications' },
  { path: '/announcements', component: AnnouncementsPage, title: 'Announcements' },
  { path: '/reports', component: ReportsPage, roles: ['ADMIN', 'COORDINATOR'], title: 'Reports' },
  { path: '/chat', component: ChatPage, roles: ['COORDINATOR', 'FACULTY', 'PANEL', 'STUDENT'], title: 'Messages' },
  { path: '/chat/:conversationId', component: ChatPage, roles: ['COORDINATOR', 'FACULTY', 'PANEL', 'STUDENT'], title: 'Messages' },
];

export const adminRoutes: AppRouteItem[] = [
  { path: '/admin/departments', component: DepartmentsPage, roles: ['ADMIN'], title: 'Departments' },
  { path: '/admin/academic-years', component: AcademicYearsPage, roles: ['ADMIN'], title: 'Academic Years' },
  { path: '/admin/batches', component: BatchesPage, roles: ['ADMIN'], title: 'Batches' },
  { path: '/admin/semesters', component: SemestersPage, roles: ['ADMIN'], title: 'Semesters' },
  { path: '/admin/users', component: UsersPage, roles: ['ADMIN'], title: 'Users' },
  { path: '/admin/review-templates', component: ReviewTemplatesPage, roles: ['ADMIN'], title: 'Review Templates' },
  { path: '/admin/settings', component: SettingsPage, roles: ['ADMIN'], title: 'Settings' },
  { path: '/admin/audit', component: AuditLogPage, roles: ['ADMIN'], title: 'Audit Log' },
];

export const coordinatorRoutes: AppRouteItem[] = [
  { path: '/coordinator/projects', component: CoordProjectsPage, roles: ['COORDINATOR', 'ADMIN'], title: 'Projects' },
  { path: '/coordinator/projects/:id', component: CoordProjectDetailPage, roles: ['COORDINATOR', 'ADMIN'], title: 'Project Details' },
  { path: '/coordinator/teams', component: TeamApprovalsPage, roles: ['COORDINATOR', 'ADMIN'], title: 'Team Approvals' },
  { path: '/coordinator/guides', component: GuideAllocationPage, roles: ['COORDINATOR', 'ADMIN'], title: 'Guide Allocation' },
  { path: '/coordinator/review-stages', component: ReviewStagesPage, roles: ['COORDINATOR', 'ADMIN'], title: 'Review Stages' },
  { path: '/coordinator/schedules', component: SchedulesPage, roles: ['COORDINATOR', 'ADMIN'], title: 'Schedules' },
  { path: '/coordinator/announcements', component: CoordAnnouncementsPage, roles: ['COORDINATOR', 'ADMIN'], title: 'Coordinator Announcements' },
];

export const facultyRoutes: AppRouteItem[] = [
  { path: '/faculty/projects', component: GuidedProjectsPage, roles: ['FACULTY', 'ADMIN'], title: 'Guided Projects' },
];

export const evaluationRoutes: AppRouteItem[] = [
  { path: '/my-schedules', component: MySchedulesPage, roles: ['PANEL', 'FACULTY', 'ADMIN', 'STUDENT', 'COORDINATOR'], title: 'My Schedules' },
  { path: '/evaluations/:scheduleId', component: EvaluationFormPage, roles: ['PANEL', 'COORDINATOR', 'ADMIN'], title: 'Evaluation Form' },
];

export const studentRoutes: AppRouteItem[] = [
  { path: '/my-project', component: MyProjectPage, roles: ['STUDENT'], title: 'My Project' },
  { path: '/my-project/create', component: CreateProjectPage, roles: ['STUDENT'], title: 'Create Project' },
  { path: '/my-team', component: MyTeamPage, roles: ['STUDENT'], title: 'My Team' },
  { path: '/my-project/abstract', component: AbstractPage, roles: ['STUDENT'], title: 'Project Abstract' },
  { path: '/my-project/milestones', component: MilestonesPage, roles: ['STUDENT'], title: 'Milestones' },
  { path: '/my-project/submissions', component: StudentSubmissionsPage, roles: ['STUDENT'], title: 'Submissions' },
];

export const allAppRoutes: AppRouteItem[] = [
  ...generalRoutes,
  ...adminRoutes,
  ...coordinatorRoutes,
  ...facultyRoutes,
  ...evaluationRoutes,
  ...studentRoutes,
];
