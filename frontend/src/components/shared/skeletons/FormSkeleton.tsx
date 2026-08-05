import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton, SkeletonBlock } from '@/components/ui/skeleton';
import { PageHeaderSkeleton } from './PageHeaderSkeleton';

/** Form skeleton matching CreateProjectPage, ProfilePage, EvaluationFormPage. */
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
