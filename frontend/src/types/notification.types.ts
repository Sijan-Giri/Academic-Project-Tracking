// ─────────────────────────────────────────────
// Notification & Announcement types
// ─────────────────────────────────────────────

export type NotificationType =
  | 'DEADLINE_REMINDER'
  | 'STATUS_CHANGE'
  | 'FEEDBACK'
  | 'ANNOUNCEMENT'
  | 'GENERAL';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedProjectId?: string;
  createdAt: string;
}

export interface AnnouncementTarget {
  id: string;
  announcementId: string;
  departmentId?: string;
  batchId?: string;
  semesterId?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdById: string;
  createdAt: string;
  targets?: AnnouncementTarget[];
}
