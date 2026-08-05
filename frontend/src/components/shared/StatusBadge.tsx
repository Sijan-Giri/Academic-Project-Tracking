import { PROJECT_STATUS_CONFIG, MILESTONE_STATUS_CONFIG, TEAM_STATUS_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
  type: 'project' | 'milestone' | 'team';
  className?: string;
}

export default function StatusBadge({ status, type, className }: StatusBadgeProps) {
  let config;
  if (type === 'project') config = PROJECT_STATUS_CONFIG[status];
  else if (type === 'milestone') config = MILESTONE_STATUS_CONFIG[status];
  else if (type === 'team') config = TEAM_STATUS_CONFIG[status];

  if (!config) return <Badge variant="outline" className={className}>{status}</Badge>;

  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border', (config as any).bg || 'dark:bg-white/10 bg-slate-100', (config as any).border || 'dark:border-white/10 border-slate-200', config.color || 'dark:text-white text-slate-800', className)}>
      {config.label}
    </span>
  );
}
