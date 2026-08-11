import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton, SkeletonText, SkeletonBadge, SkeletonBlock } from '@/components/ui/skeleton';
import { PageHeaderSkeleton } from './PageHeaderSkeleton';

/** Cards grid skeleton matching GuidedProjectsPage, AnnouncementsPage, MyTeamPage. */
export function CardsGridSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="space-y-6 transition-opacity duration-200 animate-in fade-in-50">
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
