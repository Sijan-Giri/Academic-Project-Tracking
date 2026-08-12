
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';

export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '—';
  try {
    return format(new Date(date), 'MMM d, yyyy');
  } catch {
    return '—';
  }
}

export function formatDateTime(date: string | Date | undefined | null): string {
  if (!date) return 'TBD';
  try {
    return format(new Date(date), 'MMM d, h:mm a');
  } catch {
    return 'TBD';
  }
}

export function formatRelativeTime(date: string | Date | undefined | null): string {
  if (!date) return '';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return '';
  }
}

export function getDaysUntil(deadline: string | Date): number {
  return differenceInDays(new Date(deadline), new Date());
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function slugToLabel(slug: string): string {
  return slug
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
