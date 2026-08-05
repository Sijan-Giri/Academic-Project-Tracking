// ─────────────────────────────────────────────────────────────────────────────
// components/shared/index.ts
// Barrel re-export for all shared business components.
// Usage: import { StatsCard, StatusBadge, PageHeader } from '@/components/shared';
// ─────────────────────────────────────────────────────────────────────────────

export { default as ConfirmDialog } from './ConfirmDialog';
export { default as DataTable } from './DataTable';
export { default as EmptyState } from './EmptyState';
export { default as FileUploadZone } from './FileUploadZone';
export { default as Header } from './Header';
export { default as LoadingSpinner } from './LoadingSpinner';
export { default as NotificationDropdown } from './NotificationDropdown';
export { default as NotificationPanel } from './NotificationPanel';
export { default as PageHeader } from './PageHeader';
export { default as StatsCard } from './StatsCard';
export { default as StatusBadge } from './StatusBadge';
export { default as Sidebar } from './Sidebar';
export { default as SocketProvider } from './SocketProvider';

// Skeleton families
export * from './skeletons/index';
