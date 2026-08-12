import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui';

import { cn } from '@/lib';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <div className={cn('relative flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border bg-slate-50/50 dark:bg-card/40 my-4 transition-all', className)}>
      {/* Decorative Icon Container */}
      <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-subtle border border-brand text-brand shadow-sm shrink-0">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 blur-xl -z-10" />
        <Icon className="h-10 w-10 text-brand" />
      </div>

      {/* Title & Description */}
      <h3 className="mb-2 text-lg sm:text-xl font-bold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mb-6 max-w-md text-sm leading-relaxed text-neutral-sm font-normal">
        {description}
      </p>

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="gradient-brand gradient-brand-hover text-white font-semibold shadow-md shadow-indigo-500/20 text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
