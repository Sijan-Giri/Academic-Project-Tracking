// ─────────────────────────────────────────────────────────────────────────────
// lib/index.ts
// Central barrel re-export for all helpers, socket, queryClient, validators & constants.
// Usage: import { cn, queryClient, connectSocket, loginSchema } from '@/lib';
// ─────────────────────────────────────────────────────────────────────────────

export * from './utils';
export * from './queryClient';
export * from './socket';
export * from './validators';
export * from './constants';
