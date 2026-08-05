// ─────────────────────────────────────────────────────────────────────────────
// types/index.ts — Central barrel re-export
//
// Import from domain files directly for tree-shaking:
//   import type { Project } from '@/types/project.types'
//
// Or use this barrel for convenience:
//   import type { Project, User } from '@/types'
// ─────────────────────────────────────────────────────────────────────────────

export type * from './api.types';
export type * from './system.types';
export type * from './user.types';
export type * from './project.types';
export type * from './review.types';
export type * from './notification.types';
