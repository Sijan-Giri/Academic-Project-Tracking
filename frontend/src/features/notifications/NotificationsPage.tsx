import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Bell, Clock, MessageSquare, Megaphone, Check, AlertTriangle, ShieldCheck, Inbox } from 'lucide-react';
import { getNotifications, markAllRead, markRead } from '@/api/notifications.api';
import PageHeader from '@/components/shared/PageHeader';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data: rawNotifs, isLoading } = useQuery({ queryKey: ['notifications'], queryFn: getNotifications });
  const notifications: any[] = Array.isArray(rawNotifs) ? rawNotifs : ((rawNotifs as any)?.items ?? (rawNotifs as any)?.data?.items ?? []);

  const markAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markReadMutation = useMutation({
    mutationFn: markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const handleNotificationClick = (n: any) => {
    if (!n.isRead) markReadMutation.mutate(n.id);

    if (n.type === 'ANNOUNCEMENT' || n.title.toLowerCase().includes('announcement')) {
      navigate('/announcements');
    } else if (n.title.toLowerCase().includes('team') || n.title.toLowerCase().includes('invitation')) {
      navigate('/my-team');
    } else if (n.title.toLowerCase().includes('project') || n.title.toLowerCase().includes('abstract') || n.title.toLowerCase().includes('guide')) {
      navigate('/my-project');
    }
  };

  const filtered = notifications.filter((n: any) => {
    if (typeFilter !== 'ALL' && n.type !== typeFilter) return false;
    if (unreadOnly && n.isRead) return false;
    return true;
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'DEADLINE_REMINDER':
        return (
          <div className="w-10 h-10 rounded-2xl dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30 bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        );
      case 'STATUS_CHANGE':
        return (
          <div className="w-10 h-10 rounded-2xl dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30 bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        );
      case 'FEEDBACK':
        return (
          <div className="w-10 h-10 rounded-2xl dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30 bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
        );
      case 'ANNOUNCEMENT':
        return (
          <div className="w-10 h-10 rounded-2xl dark:bg-violet-500/20 dark:text-violet-400 dark:border-violet-500/30 bg-violet-50 text-violet-600 border border-violet-200 flex items-center justify-center shrink-0">
            <Megaphone className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-2xl dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30 bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Notifications & Activity Log"
        subtitle="Stay updated with review stage deadlines, guide allocations, and team invitations."
        actions={
          <Button
            variant="outline"
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="dark:border-white/10 border-slate-300 dark:bg-white/5 bg-white hover:bg-slate-100 dark:hover:bg-white/10 dark:text-white text-slate-800 font-bold shrink-0 rounded-xl"
          >
            <Check className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" /> Mark All as Read
          </Button>
        }
      />

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[200px] h-10 rounded-xl font-semibold">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Activity Types</SelectItem>
              <SelectItem value="DEADLINE_REMINDER">Deadlines & Milestones</SelectItem>
              <SelectItem value="STATUS_CHANGE">Status Updates</SelectItem>
              <SelectItem value="FEEDBACK">Reviews & Feedback</SelectItem>
              <SelectItem value="ANNOUNCEMENT">Announcements</SelectItem>
              <SelectItem value="GENERAL">General Notifications</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2.5">
            <Checkbox
              id="unread"
              checked={unreadOnly}
              onCheckedChange={(c) => setUnreadOnly(c as boolean)}
              className="dark:border-white/20 border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
            />
            <label htmlFor="unread" className="text-sm font-bold dark:text-slate-300 text-slate-700 cursor-pointer select-none">
              Unread only
            </label>
          </div>
        </div>

        <span className="text-xs font-bold dark:text-gray-400 text-slate-500 uppercase tracking-wider">
          Showing {filtered.length} of {notifications.length}
        </span>
      </div>

      {/* Notifications Cards Container */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-6 rounded-3xl dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/80 shadow-sm flex gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-2xl dark:bg-white/10 bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-3 py-0.5">
                  <div className="flex justify-between items-center">
                    <div className="h-4 dark:bg-white/10 bg-slate-200 rounded w-1/3" />
                    <div className="h-3 dark:bg-white/5 bg-slate-100 rounded w-16" />
                  </div>
                  <div className="h-3.5 dark:bg-white/5 bg-slate-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/80 shadow-sm rounded-3xl p-8 text-center">
            <div className="w-20 h-20 dark:bg-indigo-500/20 bg-indigo-50 border dark:border-indigo-500/30 border-indigo-100 rounded-3xl flex items-center justify-center mb-6">
              <Inbox className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-2xl font-extrabold dark:text-white text-slate-900 mb-2">No Notifications Found</h3>
            <p className="dark:text-gray-400 text-slate-500 max-w-md text-sm font-medium">
              You are all caught up! When updates or review announcements arrive, they will appear here.
            </p>
          </div>
        ) : (
          filtered.map((n: any) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={cn(
                'rounded-3xl border p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex gap-4 items-start group',
                !n.isRead
                  ? 'dark:bg-indigo-500/10 dark:border-indigo-500/30 bg-indigo-50/50 border-indigo-200 border-l-4 border-l-indigo-600 dark:border-l-indigo-500'
                  : 'dark:bg-white/5 dark:border-white/10 bg-white border-slate-200/80 dark:hover:bg-white/[0.08] hover:bg-slate-50'
              )}
            >
              {getTypeBadge(n.type)}

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                  <h4 className={cn(
                    'text-base tracking-tight truncate pr-2',
                    !n.isRead
                      ? 'font-extrabold dark:text-white text-slate-900'
                      : 'font-bold dark:text-gray-300 text-slate-700'
                  )}>
                    {n.title}
                  </h4>
                  <span className="text-xs font-semibold text-slate-400 shrink-0 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </span>
                </div>

                <p className="dark:text-gray-300 text-slate-600 text-sm font-medium leading-relaxed">
                  {n.message}
                </p>
              </div>

              {!n.isRead && (
                <div className="w-3 h-3 rounded-full bg-indigo-600 dark:bg-indigo-500 shrink-0 self-center shadow-xs" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
