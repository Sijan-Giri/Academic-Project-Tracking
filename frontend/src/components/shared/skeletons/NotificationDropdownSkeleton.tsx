import { Skeleton, SkeletonCircle, SkeletonBadge } from '@/components/ui/skeleton';

export function NotificationDropdownSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="p-4 space-y-4 divide-y divide-border">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3.5 pt-3.5 first:pt-0">
          <SkeletonCircle size="w-9 h-9 shrink-0" />
          <div className="flex-1 space-y-2 py-0.5">
            <Skeleton className="h-3.5 w-3/4 rounded-sm" />
            <Skeleton className="h-3 w-full rounded-xs" />
            <div className="flex items-center justify-between pt-1">
              <Skeleton className="h-2.5 w-20 rounded-xs" />
              <SkeletonBadge width="w-12" className="h-4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
