import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

/**
 * Base Skeleton component with high-performance linear shimmer animation.
 */
function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-md bg-secondary/80',
        shimmer ? 'animate-shimmer' : 'animate-pulse bg-secondary',
        className
      )}
      {...props}
    />
  );
}

/**
 * Realistic Text Skeleton that mimics multi-line paragraphs or titles with varying line widths.
 */
export function SkeletonText({
  lines = 3,
  className,
  lineHeight = 'h-3.5',
}: {
  lines?: number;
  className?: string;
  lineHeight?: string;
}) {
  const widths = ['w-full', 'w-[88%]', 'w-[94%]', 'w-[72%]', 'w-[60%]'];
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(lineHeight, widths[i % widths.length])}
        />
      ))}
    </div>
  );
}

/**
 * Circle Skeleton for user avatars, icon badges, and status dots.
 */
export function SkeletonCircle({ size = 'w-9 h-9', className }: { size?: string; className?: string }) {
  return <Skeleton className={cn('rounded-full shrink-0', size, className)} />;
}

/**
 * Pill/Badge Skeleton matching UI badges.
 */
export function SkeletonBadge({ width = 'w-20', className }: { width?: string; className?: string }) {
  return <Skeleton className={cn('h-5 rounded-md shrink-0', width, className)} />;
}

/**
 * Rectangular Block Skeleton for cards, buttons, and input fields.
 */
export function SkeletonBlock({
  height = 'h-10',
  width = 'w-full',
  radius = 'rounded-lg',
  className,
}: {
  height?: string;
  width?: string;
  radius?: string;
  className?: string;
}) {
  return <Skeleton className={cn(height, width, radius, className)} />;
}

/**
 * Table Row Skeleton matching real data table rows.
 */
export function SkeletonRow({ cols = 4, className }: { cols?: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-4 py-3.5 px-4 border-b border-border/60', className)}>
      <SkeletonCircle size="w-7 h-7" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-4 w-[45%]" />
        <Skeleton className="h-3 w-[25%]" />
      </div>
      {Array.from({ length: cols - 1 }).map((_, i) => (
        <SkeletonBadge key={i} width={i % 2 === 0 ? 'w-16' : 'w-24'} />
      ))}
    </div>
  );
}

export { Skeleton };
