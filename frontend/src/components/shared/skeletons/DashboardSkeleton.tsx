import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonCircle, SkeletonRow } from '@/components/ui/skeleton';
import { PageHeaderSkeleton } from './PageHeaderSkeleton';

/** Dashboard skeleton matching StudentDashboard, CoordinatorDashboard, AdminDashboard, and FacultyDashboard. */
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
