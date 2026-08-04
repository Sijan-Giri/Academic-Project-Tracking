import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Bell, Clock, CheckCircle, MessageSquare, Megaphone, Check } from 'lucide-react';
import { getNotifications, markAllRead, markRead } from '@/api/notifications.api';
import { formatDistanceToNow } from 'date-fns';

const ICONS: Record<string, React.ReactNode> = {
  GENERAL: <Bell className="w-5 h-5 text-slate-400" />,
  DEADLINE_REMINDER: <Clock className="w-5 h-5 text-red-500 dark:text-red-400" />,
  STATUS_CHANGE: <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
  FEEDBACK: <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
  ANNOUNCEMENT: <Megaphone className="w-5 h-5 text-violet-600 dark:text-violet-400" />
};

const BG_COLORS: Record<string, string> = {
  GENERAL: 'bg-slate-100 dark:bg-slate-500/20',
  DEADLINE_REMINDER: 'bg-red-100 dark:bg-red-500/20',
  STATUS_CHANGE: 'bg-emerald-100 dark:bg-emerald-500/20',
  FEEDBACK: 'bg-blue-100 dark:bg-blue-500/20',
  ANNOUNCEMENT: 'bg-violet-100 dark:bg-violet-500/20'
};

export default function NotificationsPage() {
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

  const filtered = notifications.filter((n: any) => {
    if (typeFilter !== 'ALL' && n.type !== typeFilter) return false;
    if (unreadOnly && n.isRead) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600">
            Notifications
          </h1>
          <p className="dark:text-slate-400 text-slate-500 mt-1">Stay updated with your project activities.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => markAllMutation.mutate()}
          className="dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shrink-0"
        >
          <Check className="w-4 h-4 mr-2 text-indigo-500" /> Mark All Read
        </Button>
      </div>

      <div className="flex items-center gap-6 p-4 rounded-xl dark:bg-white/5 dark:border-white/10 bg-white border border-slate-200 shadow-sm">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="DEADLINE_REMINDER">Deadlines</SelectItem>
            <SelectItem value="STATUS_CHANGE">Status Changes</SelectItem>
            <SelectItem value="FEEDBACK">Feedback</SelectItem>
            <SelectItem value="ANNOUNCEMENT">Announcements</SelectItem>
            <SelectItem value="GENERAL">General</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="unread" 
            checked={unreadOnly} 
            onCheckedChange={(c) => setUnreadOnly(c as boolean)}
            className="dark:border-white/20 border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
          />
          <label htmlFor="unread" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-300 text-slate-700">
            Unread only
          </label>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 rounded-xl dark:bg-white/5 dark:border-white/10 bg-white border border-slate-200 shadow-sm flex gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full dark:bg-white/10 bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2.5 py-0.5">
                  <div className="flex justify-between items-center">
                    <div className="h-4 dark:bg-white/10 bg-slate-200 rounded w-1/3" />
                    <div className="h-3 dark:bg-white/5 bg-slate-100 rounded w-16" />
                  </div>
                  <div className="h-3.5 dark:bg-white/5 bg-slate-100 rounded w-full" />
                  <div className="h-3.5 dark:bg-white/5 bg-slate-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full dark:bg-white/5 bg-slate-100 flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 dark:text-slate-500 text-slate-400" />
            </div>
            <h3 className="text-xl font-medium dark:text-slate-300 text-slate-700">All caught up!</h3>
            <p className="dark:text-slate-500 text-slate-400 mt-2">No new notifications to show.</p>
          </div>
        ) : (
          filtered.map((n: any) => (
            <Card 
              key={n.id} 
              className={`cursor-pointer transition-all dark:hover:bg-white/10 hover:bg-slate-50 ${!n.isRead ? 'border-l-4 border-l-indigo-600 dark:bg-indigo-500/10 bg-indigo-50/40' : ''}`}
              onClick={() => {
                if (!n.isRead) markReadMutation.mutate(n.id);
              }}
            >
              <div className="p-4 flex gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${BG_COLORS[n.type] || BG_COLORS.GENERAL}`}>
                  {ICONS[n.type] || ICONS.GENERAL}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className={`text-base truncate ${!n.isRead ? 'font-bold dark:text-white text-slate-900' : 'font-medium dark:text-slate-300 text-slate-600'}`}>
                      {n.title}
                    </h4>
                    <span className="text-xs dark:text-slate-500 text-slate-400 shrink-0 whitespace-nowrap">
                      {formatDistanceToNow(new Date(n.createdAt))} ago
                    </span>
                  </div>
                  <p className={`text-sm mt-1 line-clamp-2 ${!n.isRead ? 'dark:text-slate-300 text-slate-700' : 'dark:text-slate-500 text-slate-500'}`}>
                    {n.message}
                  </p>
                  {n.projectId && (
                    <button className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs font-medium mt-2">
                      View Project
                    </button>
                  )}
                </div>
                {!n.isRead && (
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-500 self-center shrink-0" />
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
