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
    <div className={cn('flex flex-col items-center justify-center p-12 text-center', className)}>
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5 mb-6">
        <Icon className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-gray-400">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
