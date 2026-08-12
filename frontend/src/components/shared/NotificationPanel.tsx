import { Bell, AlertCircle, MessageSquare, Megaphone, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Notification } from '@/types';
import { Button, ScrollArea, Skeleton, SkeletonBadge, SkeletonCircle } from '@/components/ui';



import { cn } from '@/lib';

interface NotificationPanelProps {
  notifications: Notification[];
  unreadCount: number;
  isLoading?: boolean;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'DEADLINE_REMINDER':
      return (
        <div className="w-8 h-8 rounded-full bg-warning-subtle text-warning flex items-center justify-center shrink-0 border border-warning">
          <AlertCircle className="w-4 h-4" />
        </div>
      );
    case 'STATUS_CHANGE':
      return (
        <div className="w-8 h-8 rounded-full bg-brand-subtle text-brand flex items-center justify-center shrink-0 border border-brand">
          <Bell className="w-4 h-4" />
        </div>
      );
    case 'FEEDBACK':
      return (
        <div className="w-8 h-8 rounded-full bg-success-subtle text-success flex items-center justify-center shrink-0 border border-success">
          <MessageSquare className="w-4 h-4" />
        </div>
      );
    case 'ANNOUNCEMENT':
      return (
        <div className="w-8 h-8 rounded-full bg-purple-subtle text-purple flex items-center justify-center shrink-0 border border-purple">
          <Megaphone className="w-4 h-4" />
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 rounded-full bg-info-subtle text-info flex items-center justify-center shrink-0 border border-info">
          <Bell className="w-4 h-4" />
        </div>
      );
  }
};

export default function NotificationPanel({ notifications, unreadCount, isLoading = false, onMarkAllRead, onMarkRead }: NotificationPanelProps) {
  return (
    <div className="w-80 sm:w-96 bg-card border border-border rounded-xl shadow-xl overflow-hidden text-foreground">
      <div className="flex items-center justify-between border-b border-border p-4 bg-card">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-foreground text-base">Notifications</h4>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-brand-subtle text-brand border border-brand text-xs font-semibold">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onMarkAllRead} className="h-7 px-2 text-xs text-brand hover:bg-secondary">
            <CheckCheck className="w-3.5 h-3.5 mr-1" /> Mark all read
          </Button>
        )}
      </div>

      <ScrollArea className="h-96">
        {isLoading ? (
          <div className="p-4 space-y-4 divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3.5 pt-3.5 first:pt-0">
                <SkeletonCircle size="w-8 h-8 shrink-0" />
                <div className="flex-1 space-y-2 py-0.5">
                  <Skeleton className="h-3.5 w-3/4 rounded-sm" />
                  <Skeleton className="h-3 w-full rounded-xs" />
                  <div className="flex items-center justify-between pt-1">
                    <Skeleton className="h-2.5 w-20 rounded-xs" />
                    <SkeletonBadge width="w-12" className="h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            <Bell className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="font-semibold text-foreground">No notifications</p>
            <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  'flex items-start gap-3.5 p-4 transition-all hover:bg-secondary/50 cursor-pointer relative group',
                  !notif.isRead && 'bg-brand-subtle'
                )}
                onClick={() => !notif.isRead && onMarkRead(notif.id)}
              >
                {getIcon(notif.type)}
                <div className="flex-1 min-w-0">
                  <p className={cn('text-xs leading-snug', !notif.isRead ? 'text-foreground font-bold' : 'text-foreground/90 font-medium')}>
                    {notif.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed font-normal">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-muted-foreground mt-1.5 block font-medium">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                  </span>
                </div>
                {!notif.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-brand shrink-0 mt-1.5 ring-4 ring-indigo-500/20" />
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
