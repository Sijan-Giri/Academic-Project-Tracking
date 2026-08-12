import { PROJECT_STATUS_CONFIG, MILESTONE_STATUS_CONFIG, TEAM_STATUS_CONFIG, cn } from '@/lib';
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
    <span className={cn('badge-pill', (config as any).className || 'badge-muted', className)}>
      {config.label}
    </span>
  );
}
