import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    <div className={cn('relative flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-card/40 my-4 transition-all', className)}>
      {/* Decorative Icon Container */}
      <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-100 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shadow-sm shrink-0">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 blur-xl -z-10" />
        <Icon className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
      </div>

      {/* Title & Description */}
      <h3 className="mb-2 text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mb-6 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400 font-normal">
        {description}
      </p>

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold shadow-md shadow-indigo-500/20 text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
