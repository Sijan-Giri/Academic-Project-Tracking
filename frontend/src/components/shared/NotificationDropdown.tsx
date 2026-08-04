import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Bell, AlertTriangle, MessageSquare, Megaphone, CheckCheck, ChevronRight,
  ShieldCheck, Loader2, Info
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getMyNotifications, getUnreadCount, markRead, markAllRead } from '@/api/notifications.api';
import { cn } from '@/lib/utils';
import { Notification } from '@/types';

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: countData } = useQuery({
    queryKey: ['unread-count'],
    queryFn: getUnreadCount,
    refetchInterval: 30000,
  });

  const { data: notifData, isLoading } = useQuery({
    queryKey: ['my-notifications'],
    queryFn: () => getMyNotifications({ page: 1, limit: 15 }),
    enabled: open,
  });

  const markReadMut = useMutation({
    mutationFn: (id: string) => markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMut = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const rawCount = typeof countData === 'number' ? countData : ((countData as any)?.data?.count ?? (countData as any)?.count ?? (countData as any)?.data ?? 0);
  const unreadCount = typeof rawCount === 'number' ? rawCount : 0;
  const notifications: Notification[] = Array.isArray(notifData) ? notifData : ((notifData as any)?.data?.items ?? (notifData as any)?.items ?? (notifData as any)?.data ?? []);

  const filteredNotifications = filter === 'UNREAD'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const handleItemClick = (notif: Notification) => {
    if (!notif.isRead) {
      markReadMut.mutate(notif.id);
    }
    setOpen(false);

    // Smart navigation based on notification type / content
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DEADLINE_REMINDER':
        return (
          <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      case 'STATUS_CHANGE':
        return (
          <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
            <ShieldCheck className="w-4 h-4" />
          </div>
        );
      case 'FEEDBACK':
        return (
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <MessageSquare className="w-4 h-4" />
          </div>
        );
      case 'ANNOUNCEMENT':
        return (
          <div className="w-9 h-9 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
            <Megaphone className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
            <Info className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white transition-colors">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex min-w-[18px] h-[18px] px-1 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-[10px] font-extrabold text-white shadow-md shadow-red-500/50 ring-2 ring-[#0f1117] animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 sm:w-96 p-0 dark:bg-[#14161f] dark:border-white/10 dark:text-white bg-white border-slate-200 text-slate-900 shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b dark:border-white/10 border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold dark:text-white text-slate-900 text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30 bg-indigo-50 text-indigo-600 border border-indigo-200 text-xs font-semibold">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllReadMut.mutate()}
              disabled={markAllReadMut.isPending}
              className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-white/5 hover:bg-slate-100 h-8 px-2"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1" /> Mark all read
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b dark:border-white/10 dark:bg-black/20 border-slate-200 bg-slate-50 px-3 py-1.5 gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
              filter === 'ALL'
                ? 'dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30 bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold'
                : 'dark:text-gray-400 dark:hover:text-white text-slate-600 hover:text-slate-900'
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter('UNREAD')}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
              filter === 'UNREAD'
                ? 'dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30 bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold'
                : 'dark:text-gray-400 dark:hover:text-white text-slate-600 hover:text-slate-900'
            )}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* List */}
        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="p-4 space-y-3.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3.5 animate-pulse">
                  <div className="w-9 h-9 rounded-full dark:bg-white/10 bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-2 py-0.5">
                    <div className="h-3.5 dark:bg-white/10 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 dark:bg-white/5 bg-slate-100 rounded w-full" />
                    <div className="h-2.5 dark:bg-white/5 bg-slate-100 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-sm dark:text-gray-400 text-slate-500">
              <Bell className="w-8 h-8 dark:text-gray-600 text-slate-300 mx-auto mb-2 opacity-50" />
              <p className="font-medium dark:text-gray-300 text-slate-700">No notifications</p>
              <p className="text-xs dark:text-gray-500 text-slate-400 mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y dark:divide-white/5 divide-slate-100">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={cn(
                    'flex items-start gap-3.5 p-4 transition-all dark:hover:bg-white/5 hover:bg-slate-50 cursor-pointer relative group',
                    !notif.isRead && 'dark:bg-indigo-500/10 bg-indigo-50/60'
                  )}
                >
                  {getTypeIcon(notif.type)}
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium leading-snug', !notif.isRead ? 'dark:text-white text-slate-900 font-semibold' : 'dark:text-gray-300 text-slate-600')}>
                      {notif.title}
                    </p>
                    <p className="text-xs dark:text-gray-400 text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] dark:text-gray-500 text-slate-400 mt-1.5 block font-medium">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  {!notif.isRead && (
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 mt-1.5 ring-4 dark:ring-indigo-500/20 ring-indigo-500/30" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t dark:border-white/10 dark:bg-black/20 border-slate-200 bg-slate-50 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setOpen(false);
              navigate('/notifications');
            }}
            className="w-full text-xs text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-white/5 hover:bg-slate-200/60"
          >
            See all notifications <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
