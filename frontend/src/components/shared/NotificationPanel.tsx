import { Bell, AlertCircle, MessageSquare, Megaphone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NotificationPanelProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'DEADLINE_REMINDER': return <AlertCircle className="h-5 w-5 text-red-400" />;
    case 'STATUS_CHANGE': return <Bell className="h-5 w-5 text-indigo-400" />;
    case 'FEEDBACK': return <MessageSquare className="h-5 w-5 text-emerald-400" />;
    case 'ANNOUNCEMENT': return <Megaphone className="h-5 w-5 text-yellow-400" />;
    default: return <Bell className="h-5 w-5 text-blue-400" />;
  }
};

export default function NotificationPanel({ notifications, unreadCount, onMarkAllRead, onMarkRead }: NotificationPanelProps) {
  return (
    <div className="w-80">
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <h4 className="font-semibold text-white">Notifications</h4>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onMarkAllRead} className="h-auto px-2 py-1 text-xs text-indigo-400">
            Mark all read
          </Button>
        )}
      </div>
      <ScrollArea className="h-96">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No notifications</div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={cn('flex items-start gap-3 border-b border-white/5 p-4 transition-colors hover:bg-white/5 cursor-pointer', !notif.isRead && 'bg-indigo-500/5')}
                onClick={() => !notif.isRead && onMarkRead(notif.id)}
              >
                <div className="mt-1 shrink-0">{getIcon(notif.type)}</div>
                <div className="flex-1 space-y-1">
                  <p className={cn('text-sm font-medium leading-none', !notif.isRead ? 'text-white' : 'text-gray-300')}>{notif.title}</p>
                  <p className="text-xs text-gray-400 line-clamp-2">{notif.message}</p>
                  <p className="text-[10px] text-gray-500">{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</p>
                </div>
                {!notif.isRead && <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
