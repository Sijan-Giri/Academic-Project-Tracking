import { Card, CardContent, Skeleton, SkeletonBadge, SkeletonRow } from '@/components/ui';

import { PageHeaderSkeleton } from './PageHeaderSkeleton';

export function SubmissionsSkeleton() {
  return (
    <div className="space-y-6 transition-opacity duration-200 animate-in fade-in-50">
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
