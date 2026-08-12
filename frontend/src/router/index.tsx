import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import AuthLayout from '@/layouts/AuthLayout';
import RoleGuard from '@/layouts/RoleGuard';

import { DashboardSkeleton, TableSkeleton, ProjectDetailSkeleton, FormSkeleton, MyTeamSkeleton, AbstractSkeleton, MilestonesSkeleton, SubmissionsSkeleton, SchedulesSkeleton, ReviewStagesSkeleton, SettingsSkeleton, PageSkeleton, CardsGridSkeleton } from '@/components';

import LoginPage from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';

const DashboardIndex = lazy(() => import('@/features/dashboard/DashboardIndex'));

const DepartmentsPage = lazy(() => import('@/features/admin/DepartmentsPage'));
const AcademicYearsPage = lazy(() => import('@/features/admin/AcademicYearsPage'));
const BatchesPage = lazy(() => import('@/features/admin/BatchesPage'));
const SemestersPage = lazy(() => import('@/features/admin/SemestersPage'));
const UsersPage = lazy(() => import('@/features/admin/UsersPage'));
const ReviewTemplatesPage = lazy(() => import('@/features/admin/ReviewTemplatesPage'));
const SettingsPage = lazy(() => import('@/features/admin/SettingsPage'));
const AuditLogPage = lazy(() => import('@/features/admin/AuditLogPage'));

const CoordProjectsPage = lazy(() => import('@/features/coordinator/ProjectsPage'));
const CoordProjectDetailPage = lazy(() => import('@/features/coordinator/ProjectDetailPage'));
const TeamApprovalsPage = lazy(() => import('@/features/coordinator/TeamApprovalsPage'));
const GuideAllocationPage = lazy(() => import('@/features/coordinator/GuideAllocationPage'));
const ReviewStagesPage = lazy(() => import('@/features/coordinator/ReviewStagesPage'));
const SchedulesPage = lazy(() => import('@/features/coordinator/SchedulesPage'));
const CoordAnnouncementsPage = lazy(() => import('@/features/coordinator/AnnouncementsPage'));

const GuidedProjectsPage = lazy(() => import('@/features/faculty/GuidedProjectsPage'));

const MyProjectPage = lazy(() => import('@/features/student/MyProjectPage'));
const CreateProjectPage = lazy(() => import('@/features/student/CreateProjectPage'));
const MyTeamPage = lazy(() => import('@/features/student/MyTeamPage'));
const AbstractPage = lazy(() => import('@/features/student/AbstractPage'));
const MilestonesPage = lazy(() => import('@/features/student/MilestonesPage'));
const StudentSubmissionsPage = lazy(() => import('@/features/student/SubmissionsPage'));

const MySchedulesPage = lazy(() => import('@/features/evaluations/MySchedulesPage'));
const EvaluationFormPage = lazy(() => import('@/features/evaluations/EvaluationFormPage'));
const NotificationsPage = lazy(() => import('@/features/notifications/NotificationsPage'));
const AnnouncementsPage = lazy(() => import('@/features/notifications/AnnouncementsPage'));
const ReportsPage = lazy(() => import('@/features/reports/ReportsPage'));
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage'));
const NotFoundPage = lazy(() => import('@/features/NotFoundPage'));

const wrap = (component: React.ReactNode, skeleton: React.ReactNode = <PageSkeleton />) => (
  <Suspense fallback={skeleton}>{component}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <AuthLayout><LoginPage /></AuthLayout>,
  },
  {
    path: '/register',
    element: <AuthLayout><RegisterPage /></AuthLayout>,
  },
  {
    path: '/signup',
    element: <AuthLayout><RegisterPage /></AuthLayout>,
  },
  {
    element: <RoleGuard />,
    children: [{
      element: <DashboardLayout />,
      children: [
        { path: '/dashboard', element: wrap(<DashboardIndex />, <DashboardSkeleton />) },
        { path: '/profile', element: wrap(<ProfilePage />, <FormSkeleton />) },
        { path: '/notifications', element: wrap(<NotificationsPage />, <TableSkeleton rows={6} cols={4} />) },
        { path: '/announcements', element: wrap(<AnnouncementsPage />, <CardsGridSkeleton />) },
        { path: '/reports', element: wrap(<ReportsPage />, <CardsGridSkeleton />) },
        
        { element: <RoleGuard allowedRoles={['ADMIN']} />, children: [
          { path: '/admin/departments', element: wrap(<DepartmentsPage />, <TableSkeleton rows={5} cols={4} />) },
          { path: '/admin/academic-years', element: wrap(<AcademicYearsPage />, <TableSkeleton rows={5} cols={4} />) },
          { path: '/admin/batches', element: wrap(<BatchesPage />, <TableSkeleton rows={5} cols={5} />) },
          { path: '/admin/semesters', element: wrap(<SemestersPage />, <TableSkeleton rows={5} cols={5} />) },
          { path: '/admin/users', element: wrap(<UsersPage />, <TableSkeleton rows={7} cols={5} />) },
          { path: '/admin/review-templates', element: wrap(<ReviewTemplatesPage />, <TableSkeleton rows={5} cols={4} />) },
          { path: '/admin/settings', element: wrap(<SettingsPage />, <SettingsSkeleton />) },
          { path: '/admin/audit', element: wrap(<AuditLogPage />, <TableSkeleton rows={8} cols={6} />) },
        ]},
        
        { element: <RoleGuard allowedRoles={['COORDINATOR', 'ADMIN']} />, children: [
          { path: '/coordinator/projects', element: wrap(<CoordProjectsPage />, <TableSkeleton rows={6} cols={5} />) },
          { path: '/coordinator/projects/:id', element: wrap(<CoordProjectDetailPage />, <ProjectDetailSkeleton />) },
          { path: '/coordinator/teams', element: wrap(<TeamApprovalsPage />, <TableSkeleton rows={6} cols={5} />) },
          { path: '/coordinator/guides', element: wrap(<GuideAllocationPage />, <TableSkeleton rows={6} cols={4} />) },
          { path: '/coordinator/review-stages', element: wrap(<ReviewStagesPage />, <ReviewStagesSkeleton />) },
          { path: '/coordinator/schedules', element: wrap(<SchedulesPage />, <SchedulesSkeleton />) },
          { path: '/coordinator/announcements', element: wrap(<CoordAnnouncementsPage />, <CardsGridSkeleton />) },
        ]},
        
        { element: <RoleGuard allowedRoles={['FACULTY', 'ADMIN']} />, children: [
          { path: '/faculty/projects', element: wrap(<GuidedProjectsPage />, <TableSkeleton rows={6} cols={4} />) },
        ]},
        
        { element: <RoleGuard allowedRoles={['PANEL', 'FACULTY', 'ADMIN', 'STUDENT', 'COORDINATOR']} />, children: [
          { path: '/my-schedules', element: wrap(<MySchedulesPage />, <SchedulesSkeleton />) },
          { path: '/evaluations/:scheduleId', element: wrap(<EvaluationFormPage />, <FormSkeleton />) },
        ]},
        
        { element: <RoleGuard allowedRoles={['STUDENT']} />, children: [
          { path: '/my-project', element: wrap(<MyProjectPage />, <ProjectDetailSkeleton />) },
          { path: '/my-project/create', element: wrap(<CreateProjectPage />, <FormSkeleton />) },
          { path: '/my-team', element: wrap(<MyTeamPage />, <MyTeamSkeleton />) },
          { path: '/my-project/abstract', element: wrap(<AbstractPage />, <AbstractSkeleton />) },
          { path: '/my-project/milestones', element: wrap(<MilestonesPage />, <MilestonesSkeleton />) },
          { path: '/my-project/submissions', element: wrap(<StudentSubmissionsPage />, <SubmissionsSkeleton />) },
        ]},
      ],
    }],
  },
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '*', element: wrap(<NotFoundPage />) },
]);
