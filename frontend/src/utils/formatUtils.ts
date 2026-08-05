// ─────────────────────────────────────────────────────────────────────────────
// utils/formatUtils.ts
// Date, number, and string formatting helpers used across the application.
// ─────────────────────────────────────────────────────────────────────────────

import { format, formatDistanceToNow, differenceInDays } from 'date-fns';

/**
 * Formats a date string to "Jan 5, 2025" display format.
 */
export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '—';
  try {
    return format(new Date(date), 'MMM d, yyyy');
  } catch {
    return '—';
  }
}

/**
 * Formats a date string to "Jan 5, 2:30 PM" display format.
 */
export function formatDateTime(date: string | Date | undefined | null): string {
  if (!date) return 'TBD';
  try {
    return format(new Date(date), 'MMM d, h:mm a');
  } catch {
    return 'TBD';
  }
}

/**
 * Returns a relative time string like "2 days ago" or "in 3 hours".
 */
export function formatRelativeTime(date: string | Date | undefined | null): string {
  if (!date) return '';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return '';
  }
}

/**
 * Returns the number of days between a deadline date and today.
 * Negative = overdue.
 */
export function getDaysUntil(deadline: string | Date): number {
  return differenceInDays(new Date(deadline), new Date());
}

/**
 * Formats a file size in bytes to human-readable string (e.g. "1.2 MB").
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Converts a kebab/snake_case slug into "Title Case" display label.
 * e.g. "abstract_submitted" → "Abstract Submitted"
 */
export function slugToLabel(slug: string): string {
  return slug
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
