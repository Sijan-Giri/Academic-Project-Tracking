import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import AuthLayout from '@/layouts/AuthLayout';
import RoleGuard from '@/layouts/RoleGuard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

// Lazy load ALL pages
const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const DashboardIndex = lazy(() => import('@/features/dashboard/DashboardIndex'));

// Admin pages
const DepartmentsPage = lazy(() => import('@/features/admin/DepartmentsPage'));
const AcademicYearsPage = lazy(() => import('@/features/admin/AcademicYearsPage'));
const BatchesPage = lazy(() => import('@/features/admin/BatchesPage'));
const SemestersPage = lazy(() => import('@/features/admin/SemestersPage'));
const UsersPage = lazy(() => import('@/features/admin/UsersPage'));
const ReviewTemplatesPage = lazy(() => import('@/features/admin/ReviewTemplatesPage'));
const SettingsPage = lazy(() => import('@/features/admin/SettingsPage'));
const AuditLogPage = lazy(() => import('@/features/admin/AuditLogPage'));

// Coordinator pages
const CoordProjectsPage = lazy(() => import('@/features/coordinator/ProjectsPage'));
const CoordProjectDetailPage = lazy(() => import('@/features/coordinator/ProjectDetailPage'));
const TeamApprovalsPage = lazy(() => import('@/features/coordinator/TeamApprovalsPage'));
const GuideAllocationPage = lazy(() => import('@/features/coordinator/GuideAllocationPage'));
const ReviewStagesPage = lazy(() => import('@/features/coordinator/ReviewStagesPage'));
const SchedulesPage = lazy(() => import('@/features/coordinator/SchedulesPage'));
const CoordAnnouncementsPage = lazy(() => import('@/features/coordinator/AnnouncementsPage'));

// Faculty pages
const GuidedProjectsPage = lazy(() => import('@/features/faculty/GuidedProjectsPage'));

// Student pages
const MyProjectPage = lazy(() => import('@/features/student/MyProjectPage'));
const CreateProjectPage = lazy(() => import('@/features/student/CreateProjectPage'));
const MyTeamPage = lazy(() => import('@/features/student/MyTeamPage'));
const AbstractPage = lazy(() => import('@/features/student/AbstractPage'));
const MilestonesPage = lazy(() => import('@/features/student/MilestonesPage'));
const StudentSubmissionsPage = lazy(() => import('@/features/student/SubmissionsPage'));

// Shared pages
const MySchedulesPage = lazy(() => import('@/features/evaluations/MySchedulesPage'));
const EvaluationFormPage = lazy(() => import('@/features/evaluations/EvaluationFormPage'));
const NotificationsPage = lazy(() => import('@/features/notifications/NotificationsPage'));
const AnnouncementsPage = lazy(() => import('@/features/notifications/AnnouncementsPage'));
const ReportsPage = lazy(() => import('@/features/reports/ReportsPage'));
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage'));
const NotFoundPage = lazy(() => import('@/features/NotFoundPage'));

const wrap = (component: React.ReactNode) => (
  <Suspense fallback={<LoadingSpinner className="min-h-[50vh]" />}>{component}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <AuthLayout>{wrap(<LoginPage />)}</AuthLayout>,
  },
  {
    element: <RoleGuard />,
    children: [{
      element: <DashboardLayout />,
      children: [
        { path: '/dashboard', element: wrap(<DashboardIndex />) },
        { path: '/profile', element: wrap(<ProfilePage />) },
        { path: '/notifications', element: wrap(<NotificationsPage />) },
        { path: '/announcements', element: wrap(<AnnouncementsPage />) },
        { path: '/reports', element: wrap(<ReportsPage />) },
        // Admin
        { element: <RoleGuard allowedRoles={['ADMIN']} />, children: [
          { path: '/admin/departments', element: wrap(<DepartmentsPage />) },
          { path: '/admin/academic-years', element: wrap(<AcademicYearsPage />) },
          { path: '/admin/batches', element: wrap(<BatchesPage />) },
          { path: '/admin/semesters', element: wrap(<SemestersPage />) },
          { path: '/admin/users', element: wrap(<UsersPage />) },
          { path: '/admin/review-templates', element: wrap(<ReviewTemplatesPage />) },
          { path: '/admin/settings', element: wrap(<SettingsPage />) },
          { path: '/admin/audit', element: wrap(<AuditLogPage />) },
        ]},
        // Coordinator
        { element: <RoleGuard allowedRoles={['COORDINATOR', 'ADMIN']} />, children: [
          { path: '/coordinator/projects', element: wrap(<CoordProjectsPage />) },
          { path: '/coordinator/projects/:id', element: wrap(<CoordProjectDetailPage />) },
          { path: '/coordinator/teams', element: wrap(<TeamApprovalsPage />) },
          { path: '/coordinator/guides', element: wrap(<GuideAllocationPage />) },
          { path: '/coordinator/review-stages', element: wrap(<ReviewStagesPage />) },
          { path: '/coordinator/schedules', element: wrap(<SchedulesPage />) },
          { path: '/coordinator/announcements', element: wrap(<CoordAnnouncementsPage />) },
        ]},
        // Faculty
        { element: <RoleGuard allowedRoles={['FACULTY', 'ADMIN']} />, children: [
          { path: '/faculty/projects', element: wrap(<GuidedProjectsPage />) },
        ]},
        // Panel + Faculty schedules
        { element: <RoleGuard allowedRoles={['PANEL', 'FACULTY', 'ADMIN']} />, children: [
          { path: '/my-schedules', element: wrap(<MySchedulesPage />) },
          { path: '/evaluations/:scheduleId', element: wrap(<EvaluationFormPage />) },
        ]},
        // Student
        { element: <RoleGuard allowedRoles={['STUDENT']} />, children: [
          { path: '/my-project', element: wrap(<MyProjectPage />) },
          { path: '/my-project/create', element: wrap(<CreateProjectPage />) },
          { path: '/my-team', element: wrap(<MyTeamPage />) },
          { path: '/my-project/abstract', element: wrap(<AbstractPage />) },
          { path: '/my-project/milestones', element: wrap(<MilestonesPage />) },
          { path: '/my-project/submissions', element: wrap(<StudentSubmissionsPage />) },
        ]},
      ],
    }],
  },
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '*', element: wrap(<NotFoundPage />) },
]);
