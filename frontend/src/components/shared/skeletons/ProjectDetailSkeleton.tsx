import { Card, Skeleton, SkeletonBadge, SkeletonBlock, SkeletonCircle, SkeletonText } from '@/components/ui';

export function ProjectDetailSkeleton() {
  return (
    <div className="space-y-6 transition-opacity duration-200 animate-in fade-in-50">
      <Skeleton className="h-5 w-28 rounded-md" />

      {}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <SkeletonBadge width="w-20" />
              <SkeletonBadge width="w-28" />
            </div>
            <Skeleton className="h-7 w-96 rounded-md" />
          </div>
          <div className="flex items-center gap-3">
            <SkeletonBlock height="h-9" width="w-36" />
            <SkeletonBlock height="h-9" width="w-28" />
          </div>
        </div>
      </Card>

      {}
      <Card className="p-1">
        <div className="flex items-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} height="h-8" width="w-28" radius="rounded-lg" />
          ))}
        </div>
      </Card>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 space-y-4">
          <Skeleton className="h-5 w-36 rounded-md" />
          <SkeletonText lines={6} lineHeight="h-4" />
          <div className="flex gap-2 pt-4 border-t border-border">
            <SkeletonBadge width="w-16" />
            <SkeletonBadge width="w-20" />
            <SkeletonBadge width="w-24" />
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5 space-y-3">
            <Skeleton className="h-5 w-32 rounded-md" />
            <div className="space-y-2 pt-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-36 rounded-xs" />
                  <SkeletonBadge width="w-12" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <Skeleton className="h-5 w-36 rounded-md" />
            <div className="flex items-center gap-3">
              <SkeletonCircle size="w-10 h-10" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32 rounded-xs" />
                <Skeleton className="h-3 w-24 rounded-xs" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
