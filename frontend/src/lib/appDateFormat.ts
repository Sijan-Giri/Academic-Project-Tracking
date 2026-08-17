import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export function formatDate(date: string | Date | null | undefined, pattern = 'PPP'): string {
  if (!date) return '-';
  try {
    return format(new Date(date), pattern);
  } catch (_) {
    return '-';
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  try {
    return format(new Date(date), 'MMM d, yyyy HH:mm');
  } catch (_) {
    return '-';
  }
}

export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch (_) {
    return '-';
  }
}

export function formatMessageTime(dateStr: string | Date): string {
  try {
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return `Yesterday ${format(date, 'HH:mm')}`;
    return format(date, 'MMM d, HH:mm');
  } catch (_) {
    return '';
  }
}
