
export function unwrapList<T>(response: unknown): T[] {
  if (!response) return [];

  const res = response as Record<string, unknown>;

  if (res.data && typeof res.data === 'object') {
    const data = res.data as Record<string, unknown>;
    if (Array.isArray(data.items)) return data.items as T[];
    if (Array.isArray(data)) return data as T[];
  }

  if (Array.isArray(response)) return response as T[];

  return [];
}

export function unwrapData<T>(response: unknown): T | undefined {
  if (!response) return undefined;

  const res = response as Record<string, unknown>;
  if (res.data !== undefined) return res.data as T;

  return response as T;
}
