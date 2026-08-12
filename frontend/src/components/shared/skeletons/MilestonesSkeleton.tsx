import React from 'react';
import { Card, Skeleton, SkeletonBadge, SkeletonBlock, SkeletonCircle } from '@/components/ui';

import { PageHeaderSkeleton } from './PageHeaderSkeleton';

/** Milestones page skeleton matching MilestonesPage layout exactly. */
export function MilestonesSkeleton() {
  return (
    <div className="space-y-6 transition-opacity duration-200 animate-in fade-in-50">
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
