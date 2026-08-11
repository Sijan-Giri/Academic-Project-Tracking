import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton, SkeletonText, SkeletonBadge, SkeletonBlock } from '@/components/ui/skeleton';
import { PageHeaderSkeleton } from './PageHeaderSkeleton';

/** Abstract page skeleton matching AbstractPage layout exactly. */
export function AbstractSkeleton() {
  return (
    <div className="space-y-6 transition-opacity duration-200 animate-in fade-in-50">
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
