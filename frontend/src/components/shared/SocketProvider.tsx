import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { connectSocket } from '@/lib/socket';

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { isAuthenticated, accessToken } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const socket = connectSocket(accessToken);

    // ── Real-Time Notification Listeners ────────────────────────────────────
    const handleNewNotification = (data: any) => {
      toast(data.title || 'New Notification', {
        icon: '🔔',
        style: { background: '#1e1e2e', color: '#cdd6f4', border: '1px solid rgba(99,102,241,0.3)' },
      });

      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    const handleUnreadCount = (data: { count: number }) => {
      queryClient.setQueryData(['unread-count'], data.count);
    };

    // ── Real-Time Announcement Listeners ────────────────────────────────────
    const handleNewAnnouncement = (data: any) => {
      toast(`Announcement: ${data.title}`, {
        icon: '📢',
        style: { background: '#1e1e2e', color: '#cdd6f4', border: '1px solid rgba(139,92,246,0.3)' },
      });

      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['coordinator-announcements'] });
    };

    // ── Real-Time Team & Invitation Listeners ────────────────────────────────
    const handleTeamUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['my-team'] });
      queryClient.invalidateQueries({ queryKey: ['teams-list'] });
      queryClient.invalidateQueries({ queryKey: ['teams-pending-approval'] });
    };

    const handleNewInvitation = () => {
      toast('You received a new team invitation!', {
        icon: '✉️',
        style: { background: '#1e1e2e', color: '#cdd6f4', border: '1px solid rgba(99,102,241,0.3)' },
      });

      queryClient.invalidateQueries({ queryKey: ['my-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['my-team'] });
    };

    // ── Real-Time Project Status Listeners ──────────────────────────────────
    const handleProjectUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
      queryClient.invalidateQueries({ queryKey: ['coordinator-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-list'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
    };

    const handleAnnouncementDeleted = () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['coordinator-announcements'] });
    };

    // Register event listeners
    socket.on('notification:new', handleNewNotification);
    socket.on('notification:unread_count', handleUnreadCount);
    socket.on('announcement:new', handleNewAnnouncement);
    socket.on('announcement:deleted', handleAnnouncementDeleted);
    socket.on('team:updated', handleTeamUpdated);
    socket.on('invitation:new', handleNewInvitation);
    socket.on('project:updated', handleProjectUpdated);

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('notification:unread_count', handleUnreadCount);
      socket.off('announcement:new', handleNewAnnouncement);
      socket.off('announcement:deleted', handleAnnouncementDeleted);
      socket.off('team:updated', handleTeamUpdated);
      socket.off('invitation:new', handleNewInvitation);
      socket.off('project:updated', handleProjectUpdated);
    };
  }, [isAuthenticated, accessToken, queryClient]);

  return <>{children}</>;
}
