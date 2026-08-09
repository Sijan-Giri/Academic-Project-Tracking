import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Check, Inbox } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Skeleton, SkeletonCircle } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import { getNotificationIconSmall } from '@/utils/iconUtils';
import { NOTIFICATION_TYPE_FILTERS } from '@/constants/options';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [unreadOnly, setUnreadOnly] = useState(false);

  const {
    notifications,
    isLoading,
    markRead,
    markAllRead,
  } = useNotifications();

  const handleNotificationClick = (n: any) => {
    if (!n.isRead) markRead(n.id);

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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Notifications & Activity Log"
        subtitle="Stay updated with review stage deadlines, guide allocations, and team invitations."
        actions={
          <Button
            variant="outline"
            onClick={() => markAllRead()}
            className="btn-outline"
          >
            <Check className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" /> Mark All as Read
          </Button>
        }
      />

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-xs">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px] h-9 rounded-lg font-medium text-xs">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {NOTIFICATION_TYPE_FILTERS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="unread"
              checked={unreadOnly}
              onCheckedChange={(c) => setUnreadOnly(c as boolean)}
            />
            <label htmlFor="unread" className="text-xs font-semibold text-foreground cursor-pointer select-none">
              Unread only
            </label>
          </div>
        </div>

        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Showing {filtered.length} of {notifications.length}
        </span>
      </div>

      {/* Notifications Cards Container */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 rounded-xl border border-border bg-card shadow-xs flex gap-3.5 items-start">
                <SkeletonCircle size="w-8 h-8 shrink-0" />
                <div className="flex-1 space-y-2 py-0.5">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-48 rounded-xs" />
                    <Skeleton className="h-3 w-20 rounded-xs" />
                  </div>
                  <Skeleton className="h-3 w-full rounded-xs" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[35vh] border border-border bg-card shadow-xs rounded-xl p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center mb-3">
              <Inbox className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">No Notifications Found</h3>
            <p className="text-muted-foreground max-w-sm text-xs font-normal">
              You are all caught up! When updates or review announcements arrive, they will appear here.
            </p>
          </div>
        ) : (
          filtered.map((n: any) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={cn(
                'rounded-xl border p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex gap-3.5 items-start group',
                !n.isRead
                  ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 border-l-4 border-l-indigo-600 dark:border-l-indigo-500'
                  : 'bg-card border-border hover:bg-secondary/50'
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0">
                {getNotificationIconSmall(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <h4 className={cn(
                    'text-sm tracking-tight truncate pr-2',
                    !n.isRead ? 'font-semibold text-foreground' : 'font-medium text-foreground'
                  )}>
                    {n.title}
                  </h4>
                  <span className="text-[11px] font-normal text-muted-foreground shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </span>
                </div>

                <p className="text-muted-foreground text-xs font-normal leading-relaxed">
                  {n.message}
                </p>
              </div>

              {!n.isRead && (
                <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-500 shrink-0 self-center" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
