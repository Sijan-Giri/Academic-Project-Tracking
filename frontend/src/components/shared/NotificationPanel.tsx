import { Bell, AlertCircle, MessageSquare, Megaphone, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Notification } from '@/types/notification.types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Skeleton, SkeletonCircle, SkeletonBadge } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

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
        <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
          <AlertCircle className="w-4 h-4" />
        </div>
      );
    case 'STATUS_CHANGE':
      return (
        <div className="w-8 h-8 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
          <Bell className="w-4 h-4" />
        </div>
      );
    case 'FEEDBACK':
      return (
        <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
          <MessageSquare className="w-4 h-4" />
        </div>
      );
    case 'ANNOUNCEMENT':
      return (
        <div className="w-8 h-8 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
          <Megaphone className="w-4 h-4" />
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
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
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-xs font-semibold">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onMarkAllRead} className="h-7 px-2 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-secondary">
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
                  !notif.isRead && 'bg-indigo-50/40 dark:bg-indigo-500/10'
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
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0 mt-1.5 ring-4 ring-indigo-500/20" />
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
