// ─────────────────────────────────────────────────────────────────────────────
// components/shared/Skeletons.tsx — Backward-compatible re-export shim
//
// All skeleton components have been split into individual files under:
//   components/shared/skeletons/
//
// This file remains for backward compatibility with existing imports.
// Prefer importing directly: import { DashboardSkeleton } from '@/components/shared/skeletons'
// ─────────────────────────────────────────────────────────────────────────────

export { PageHeaderSkeleton } from './skeletons/PageHeaderSkeleton';
export { DashboardSkeleton } from './skeletons/DashboardSkeleton';
export { TableSkeleton } from './skeletons/TableSkeleton';
export { ProjectDetailSkeleton } from './skeletons/ProjectDetailSkeleton';
export { CardsGridSkeleton } from './skeletons/CardsGridSkeleton';
export { FormSkeleton } from './skeletons/FormSkeleton';
export { MyTeamSkeleton } from './skeletons/MyTeamSkeleton';
export { AbstractSkeleton } from './skeletons/AbstractSkeleton';
export { MilestonesSkeleton } from './skeletons/MilestonesSkeleton';
export { SubmissionsSkeleton } from './skeletons/SubmissionsSkeleton';
export { PageSkeleton } from './skeletons/PageSkeleton';
export { SchedulesSkeleton } from './skeletons/SchedulesSkeleton';
export { ReviewStagesSkeleton } from './skeletons/ReviewStagesSkeleton';
export { SettingsSkeleton } from './skeletons/SettingsSkeleton';

