import { AlertTriangle, ShieldCheck, MessageSquare, Megaphone, Info } from 'lucide-react';
import { ACTION_COLORS } from '@/constants';

export function getNotificationIcon(type: string) {
  switch (type) {
    case 'DEADLINE_REMINDER':
      return (
        <div className="w-9 h-9 rounded-full badge-warning flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
      );
    case 'STATUS_CHANGE':
      return (
        <div className="w-9 h-9 rounded-full badge-brand flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
      );
    case 'FEEDBACK':
      return (
        <div className="w-9 h-9 rounded-full badge-success flex items-center justify-center shrink-0">
          <MessageSquare className="w-4 h-4" />
        </div>
      );
    case 'ANNOUNCEMENT':
      return (
        <div className="w-9 h-9 rounded-full badge-brand flex items-center justify-center shrink-0">
          <Megaphone className="w-4 h-4" />
        </div>
      );
    default:
      return (
        <div className="w-9 h-9 rounded-full badge-info flex items-center justify-center shrink-0">
          <Info className="w-4 h-4" />
        </div>
      );
  }
}

export function getNotificationIconSmall(type: string) {
  switch (type) {
    case 'DEADLINE_REMINDER':
      return <AlertTriangle className="w-4 h-4 text-accent-danger" />;
    case 'STATUS_CHANGE':
      return <ShieldCheck className="w-4 h-4 text-accent-brand" />;
    case 'FEEDBACK':
      return <MessageSquare className="w-4 h-4 text-accent-success" />;
    case 'ANNOUNCEMENT':
      return <Megaphone className="w-4 h-4 text-accent-brand" />;
    default:
      return <Info className="w-4 h-4 text-muted-foreground" />;
  }
}

export function getAuditActionClass(action: string): string {
  return ACTION_COLORS[action] || 'badge-muted';
}
