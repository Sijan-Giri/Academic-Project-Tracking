import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationDropdownSkeleton } from '@/components/shared/Skeletons';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types/notification.types';
import { useNotifications } from '@/hooks/useNotifications';
import { getNotificationIcon } from '@/utils/iconUtils';

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    isLoading,
    markRead: markReadMut,
    markAllRead: markAllReadMut,
  } = useNotifications({ enabled: open });

  const filteredNotifications = filter === 'UNREAD'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const handleItemClick = (notif: Notification) => {
    if (!notif.isRead) {
      markReadMut(notif.id);
    }
    setOpen(false);

    if (notif.type === 'ANNOUNCEMENT' || notif.title.toLowerCase().includes('announcement')) {
      navigate('/announcements');
    } else if (notif.title.toLowerCase().includes('team') || notif.title.toLowerCase().includes('invitation')) {
      navigate('/my-team');
    } else if (notif.title.toLowerCase().includes('project') || notif.title.toLowerCase().includes('abstract') || notif.title.toLowerCase().includes('guide')) {
      navigate('/my-project');
    } else {
      navigate('/notifications');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-foreground hover:bg-secondary/60 transition-colors rounded-lg">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex min-w-[18px] h-[18px] px-1 items-center justify-center rounded-full bg-danger-solid text-[10px] font-extrabold text-white shadow-xs ring-2 ring-background animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 sm:w-96 p-0 bg-card border-border text-foreground shadow-xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-foreground text-base">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-brand-subtle text-brand border border-brand text-xs font-semibold">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllReadMut()}
              className="text-xs text-brand hover:bg-secondary h-8 px-2"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1" /> Mark all read
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-border bg-secondary/30 px-3 py-1.5 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilter('ALL')}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-semibold transition-colors',
              filter === 'ALL'
                ? 'bg-brand-subtle text-brand border border-brand'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilter('UNREAD')}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-semibold transition-colors',
              filter === 'UNREAD'
                ? 'bg-brand-subtle text-brand border border-brand'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Unread ({unreadCount})
          </Button>
        </div>

        {/* Notification Items List */}
        <ScrollArea className="h-96">
          {isLoading ? (
            <NotificationDropdownSkeleton count={4} />
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Bell className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="font-semibold text-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={cn(
                    'flex items-start gap-3.5 p-4 transition-all hover:bg-secondary/50 cursor-pointer relative group',
                    !notif.isRead && 'bg-brand-subtle'
                  )}
                >
                  {getNotificationIcon(notif.type)}
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

        {/* Footer */}
        <div className="p-3 border-t border-border bg-secondary/30 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setOpen(false);
              navigate('/notifications');
            }}
            className="w-full text-xs text-brand hover:bg-secondary"
          >
            See all notifications <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
