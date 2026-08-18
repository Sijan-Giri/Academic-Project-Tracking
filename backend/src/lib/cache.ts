/**
 * Simple in-memory TTL cache for single-process Node.js deployments.
 * For multi-process/multi-instance deployments, replace with Redis.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class TTLCache {
  private store = new Map<string, CacheEntry<any>>();

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  invalidateByPrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  clear(): void {
    this.store.clear();
  }
}

export const cache = new TTLCache();
export default cache;
