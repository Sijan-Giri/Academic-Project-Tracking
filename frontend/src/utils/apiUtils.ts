// ─────────────────────────────────────────────────────────────────────────────
// utils/apiUtils.ts
// Utility for safely unwrapping API response data from various response shapes.
//
// The backend can return data as:
//   { data: { items: T[] } }  — paginated list
//   { data: T[] }             — plain array
//   T[]                       — raw array
//   undefined/null            — empty
//
// These helpers eliminate the 8+ copy-pasted unwrapping blocks across the app.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Safely extracts a list from any known API response shape.
 * Returns an empty array if no data is found.
 */
export function unwrapList<T>(response: unknown): T[] {
  if (!response) return [];

  const res = response as Record<string, unknown>;

  // Shape: { data: { items: T[] } } — paginated
  if (res.data && typeof res.data === 'object') {
    const data = res.data as Record<string, unknown>;
    if (Array.isArray(data.items)) return data.items as T[];
    if (Array.isArray(data)) return data as T[];
  }

  // Shape: T[] — raw array
  if (Array.isArray(response)) return response as T[];

  return [];
}

/**
 * Safely extracts a single data item from { data: T } response shape.
 * Returns undefined if no data is found.
 */
export function unwrapData<T>(response: unknown): T | undefined {
  if (!response) return undefined;

  const res = response as Record<string, unknown>;
  if (res.data !== undefined) return res.data as T;

  return response as T;
}
