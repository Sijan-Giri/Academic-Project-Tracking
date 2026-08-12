import React from 'react';
import { Card, CardContent, Skeleton, SkeletonBadge, SkeletonBlock, SkeletonRow } from '@/components/ui';

import { PageHeaderSkeleton } from './PageHeaderSkeleton';

/** DataTable skeleton matching ProjectsPage, UsersPage, TeamApprovalsPage, etc. */
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-6 transition-opacity duration-200 animate-in fade-in-50">
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
