// ─────────────────────────────────────────────────────────────────────────────
// components/shared/StatsCard.tsx
// Unified stats/metric card used across all dashboards.
//
// Supports two usage patterns:
//   1. Icon as LucideIcon component (AdminDashboard pattern):
//      <StatsCard label="Total Students" value={42} icon={GraduationCap} />
//
//   2. Icon as ReactNode / JSX element (StudentDashboard pattern):
//      <StatsCard title="Team Name" value="Phoenix" icon={<Users className="w-4 h-4" />} />
//
// Props `label` and `title` are interchangeable — `label` takes precedence.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib';

interface StatsCardProps {
  /** Card label — shown above the value in uppercase tracking. */
  label?: string;
  /** Alias for label — use either, not both. */
  title?: string;
  /** The primary metric value. Can be a string, number, or JSX element. */
  value: React.ReactNode;
  /** Optional secondary descriptor below the value. */
  subtitle?: string;
  /** Optional trend direction (shows arrow + label). */
  trend?: 'up' | 'down';
  /** Optional label for the trend (e.g. "12% this week"). */
  trendLabel?: string;
  /**
   * Icon to display in the top-right corner.
   * Accepts either a LucideIcon component reference or a ReactNode (JSX element).
   */
  icon?: LucideIcon | React.ReactNode;
  className?: string;
}

function renderIcon(iconItem: unknown) {
  if (!iconItem) return null;
  if (React.isValidElement(iconItem)) {
    return iconItem;
  }
  const IconComp = iconItem as React.ComponentType<{ className?: string }>;
  return <IconComp className="h-4 w-4 text-brand" />;
}

export default function StatsCard({
  label,
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon,
  className,
}: StatsCardProps) {
  const heading = label ?? title ?? '';

  const iconContent = icon ? (
    <div className="w-7 h-7 rounded-md bg-secondary border border-border flex items-center justify-center shrink-0">
      {renderIcon(icon)}
    </div>
  ) : null;

  return (
    <Card className={cn('overflow-hidden hover:shadow-md transition-all duration-200', className)}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {heading}
          </span>
          {iconContent}
        </div>

        <div className="text-xl font-bold text-foreground tracking-tight leading-snug">
          {value}
        </div>

        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}

        {trend && trendLabel && (
          <div className="mt-3 flex items-center text-sm">
            <span
              className={cn(
                'font-semibold',
                trend === 'up'
                  ? 'text-success'
                  : 'text-danger'
              )}
            >
              {trend === 'up' ? '↑' : '↓'} {trendLabel}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
