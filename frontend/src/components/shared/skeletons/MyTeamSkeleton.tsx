import React from 'react';
import { Card, Skeleton, SkeletonBadge, SkeletonBlock, SkeletonCircle } from '@/components/ui';

import { PageHeaderSkeleton } from './PageHeaderSkeleton';

/** MyTeam page skeleton matching MyTeamPage layout exactly. */
export function MyTeamSkeleton() {
  return (
    <div className="space-y-6 transition-opacity duration-200 animate-in fade-in-50">
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
