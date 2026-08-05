import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton, SkeletonText, SkeletonCircle, SkeletonBadge, SkeletonBlock, SkeletonRow } from '@/components/ui/skeleton';

/**
 * Skeleton matching PageHeader component.
 */
export function PageHeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56 rounded-md" />
        <Skeleton className="h-4 w-96 rounded-md" />
      </div>
      <SkeletonBlock height="h-9" width="w-36" radius="rounded-lg" />
    </div>
  );
}

/**
 * Dashboard Skeleton matching StudentDashboard, CoordinatorDashboard, AdminDashboard, and FacultyDashboard.
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto transition-opacity duration-200 animate-in fade-in-50">
      <PageHeaderSkeleton />

      {/* Stats Cards Grid (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-3 w-28 rounded-xs" />
              <SkeletonCircle size="w-7 h-7" />
            </div>
            <Skeleton className="h-7 w-20 rounded-md mb-2" />
            <Skeleton className="h-3 w-32 rounded-xs" />
          </Card>
        ))}
      </div>

      {/* Analytics / Charts Row (3 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="border-b border-border pb-3">
              <Skeleton className="h-5 w-40 rounded-md" />
            </CardHeader>
            <CardContent className="h-64 pt-4 flex flex-col justify-end gap-3">
              <div className="flex items-end gap-3 h-48 w-full justify-around pt-6">
                <Skeleton className="w-10 h-[60%] rounded-t-md" />
                <Skeleton className="w-10 h-[85%] rounded-t-md" />
                <Skeleton className="w-10 h-[45%] rounded-t-md" />
                <Skeleton className="w-10 h-[70%] rounded-t-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Table / Activity Card */}
      <Card>
        <CardHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
          <Skeleton className="h-5 w-48 rounded-md" />
          <Skeleton className="h-4 w-20 rounded-md" />
        </CardHeader>
        <CardContent className="p-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} cols={4} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * DataTable Skeleton matching ProjectsPage, UsersPage, TeamApprovalsPage, etc.
 */
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto transition-opacity duration-200 animate-in fade-in-50">
      <PageHeaderSkeleton />

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-border shadow-xs">
        <SkeletonBlock height="h-10" width="w-full" className="flex-1" />
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBadge key={i} width="w-24" className="h-8" />
          ))}
        </div>
      </div>

      {/* Table Container */}
      <Card>
        <div className="p-4 border-b border-border bg-secondary/40 flex items-center justify-between">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>
        <CardContent className="p-0">
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} cols={cols} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Project Detail & My Project Page Skeleton matching ProjectDetailPage and MyProjectPage.
 */
export function ProjectDetailSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto transition-opacity duration-200 animate-in fade-in-50">
      <Skeleton className="h-5 w-28 rounded-md" />

      {/* Header Banner Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <SkeletonBadge width="w-20" />
              <SkeletonBadge width="w-28" />
            </div>
            <Skeleton className="h-7 w-96 rounded-md" />
          </div>
          <div className="flex items-center gap-3">
            <SkeletonBlock height="h-9" width="w-36" />
            <SkeletonBlock height="h-9" width="w-28" />
          </div>
        </div>
      </Card>

      {/* Tabs Navigation Bar */}
      <Card className="p-1">
        <div className="flex items-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} height="h-8" width="w-28" radius="rounded-lg" />
          ))}
        </div>
      </Card>

      {/* 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 space-y-4">
          <Skeleton className="h-5 w-36 rounded-md" />
          <SkeletonText lines={6} lineHeight="h-4" />
          <div className="flex gap-2 pt-4 border-t border-border">
            <SkeletonBadge width="w-16" />
            <SkeletonBadge width="w-20" />
            <SkeletonBadge width="w-24" />
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5 space-y-3">
            <Skeleton className="h-5 w-32 rounded-md" />
            <div className="space-y-2 pt-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-36 rounded-xs" />
                  <SkeletonBadge width="w-12" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <Skeleton className="h-5 w-36 rounded-md" />
            <div className="flex items-center gap-3">
              <SkeletonCircle size="w-10 h-10" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32 rounded-xs" />
                <Skeleton className="h-3 w-24 rounded-xs" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/**
 * Grid Cards Skeleton matching GuidedProjectsPage, AnnouncementsPage, MyTeamPage.
 */
export function CardsGridSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto transition-opacity duration-200 animate-in fade-in-50">
      <PageHeaderSkeleton />

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-border shadow-xs">
        <SkeletonBlock height="h-10" width="w-full" className="flex-1" />
        <SkeletonBlock height="h-10" width="w-48" />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: cards }).map((_, i) => (
          <Card key={i} className="p-5 space-y-4">
            <div className="flex justify-between items-center">
              <SkeletonBadge width="w-20" />
              <SkeletonBadge width="w-24" />
            </div>
            <Skeleton className="h-5 w-4/5 rounded-md" />
            <SkeletonText lines={3} lineHeight="h-3.5" />
            <div className="pt-3 border-t border-border flex justify-between items-center">
              <Skeleton className="h-4 w-28 rounded-xs" />
              <SkeletonBlock height="h-8" width="w-20" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Form Skeleton matching CreateProjectPage, ProfilePage, EvaluationFormPage.
 */
export function FormSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto transition-opacity duration-200 animate-in fade-in-50">
      <PageHeaderSkeleton />

      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 rounded-xs" />
          <SkeletonBlock height="h-10" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded-xs" />
            <SkeletonBlock height="h-10" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 rounded-xs" />
            <SkeletonBlock height="h-10" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded-xs" />
          <SkeletonBlock height="h-32" />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <SkeletonBlock height="h-10" width="w-24" />
          <SkeletonBlock height="h-10" width="w-36" />
        </div>
      </Card>
    </div>
  );
}

/**
 * MyTeam Skeleton matching MyTeamPage layout exactly.
 */
export function MyTeamSkeleton() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto transition-opacity duration-200 animate-in fade-in-50">
      <PageHeaderSkeleton />

      {/* Top Banner Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-7 w-48 rounded-md" />
              <SkeletonBadge width="w-24" />
            </div>
            <Skeleton className="h-4 w-64 rounded-md" />
          </div>
          <SkeletonBlock height="h-9" width="w-32" />
        </div>
      </Card>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-border">
            <Skeleton className="h-5 w-40 rounded-md" />
            <SkeletonBadge width="w-20" />
          </div>
          <div className="space-y-3 pt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 rounded-lg bg-secondary/40 border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SkeletonCircle size="w-9 h-9" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-36 rounded-xs" />
                      {i === 0 && <SkeletonBadge width="w-14" />}
                    </div>
                    <Skeleton className="h-3 w-48 rounded-xs" />
                  </div>
                </div>
                <Skeleton className="h-4 w-20 rounded-xs font-mono" />
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5 space-y-4">
            <Skeleton className="h-5 w-36 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-28 rounded-xs" />
              <SkeletonBlock height="h-10" />
            </div>
            <SkeletonBlock height="h-10" width="w-full" />
          </Card>
        </div>
      </div>
    </div>
  );
}

/**
 * Abstract Page Skeleton matching AbstractPage layout exactly.
 */
export function AbstractSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto transition-opacity duration-200 animate-in fade-in-50">
      <PageHeaderSkeleton />

      {/* Status & Actions Banner Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <SkeletonBadge width="w-28" />
              <Skeleton className="h-4 w-36 rounded-md" />
            </div>
            <Skeleton className="h-6 w-80 rounded-md" />
          </div>
          <div className="flex items-center gap-3">
            <SkeletonBlock height="h-9" width="w-32" />
            <SkeletonBlock height="h-9" width="w-36" />
          </div>
        </div>
      </Card>

      {/* Main Abstract Proposal Card */}
      <Card className="p-6 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-border">
          <Skeleton className="h-5 w-44 rounded-md" />
          <SkeletonBadge width="w-20" />
        </div>
        <SkeletonText lines={8} lineHeight="h-4" />
        <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
          <SkeletonBadge width="w-20" />
          <SkeletonBadge width="w-24" />
          <SkeletonBadge width="w-16" />
          <SkeletonBadge width="w-28" />
        </div>
      </Card>
    </div>
  );
}

/**
 * Milestones Page Skeleton matching MilestonesPage layout exactly.
 */
export function MilestonesSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto transition-opacity duration-200 animate-in fade-in-50">
      <PageHeaderSkeleton />

      {/* Milestones Card Container */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <SkeletonCircle size="w-9 h-9" />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-48 rounded-md" />
                    <SkeletonBadge width="w-24" />
                  </div>
                  <Skeleton className="h-3.5 w-80 rounded-xs" />
                  <Skeleton className="h-3 w-40 rounded-xs" />
                </div>
              </div>
              <SkeletonBlock height="h-9" width="w-32" className="shrink-0" />
            </div>

            {/* Checklist items */}
            <div className="p-4 rounded-lg bg-secondary/30 border border-border space-y-2">
              <Skeleton className="h-3 w-36 rounded-xs" />
              <div className="flex flex-wrap gap-4">
                <SkeletonBadge width="w-36" />
                <SkeletonBadge width="w-44" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Submissions Page Skeleton matching SubmissionsPage layout exactly.
 */
export function SubmissionsSkeleton() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto transition-opacity duration-200 animate-in fade-in-50">
      <PageHeaderSkeleton />

      <Card>
        <div className="p-5 border-b border-border flex items-center justify-between">
          <Skeleton className="h-5 w-56 rounded-md" />
          <SkeletonBadge width="w-24" />
        </div>
        <CardContent className="p-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} cols={4} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
