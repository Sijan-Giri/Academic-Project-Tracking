
import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';

import { cn } from '@/lib';

interface StatsCardProps {
  
  label?: string;
  
  title?: string;
  
  value: React.ReactNode;
  
  subtitle?: string;
  
  trend?: 'up' | 'down';
  
  trendLabel?: string;
  
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
