import React from 'react';
import { Skeleton } from '@/components/ui';


/** Skeleton matching the PageHeader component layout. */
export function PageHeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56 rounded-md" />
        <Skeleton className="h-4 w-96 rounded-md" />
      </div>
      <Skeleton className="h-9 w-36 rounded-lg" />
    </div>
  );
}
