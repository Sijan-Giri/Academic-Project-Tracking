import { Skeleton } from '@/components/ui/skeleton';

export function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-64" />
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5 flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
