import { Card, CardContent, CardHeader, Skeleton, SkeletonCircle, SkeletonRow } from '@/components/ui';

import { PageHeaderSkeleton } from './PageHeaderSkeleton';

export function PageSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6 transition-opacity duration-300 animate-in fade-in-50">
      <PageHeaderSkeleton />

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4 bg-card/60 border-border">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-3 w-28 rounded-xs" />
              <SkeletonCircle size="w-7 h-7" />
            </div>
            <Skeleton className="h-7 w-20 rounded-md mb-2" />
            <Skeleton className="h-3 w-32 rounded-xs" />
          </Card>
        ))}
      </div>

      {}
      <Card className="bg-card/60 border-border">
        <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
          <Skeleton className="h-5 w-48 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </CardHeader>
        <CardContent className="p-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonRow key={i} cols={4} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default PageSkeleton;
