// ─────────────────────────────────────────────────────────────────────────────
// hooks/useDebounce.ts
// Debounce hook for search inputs and live-filter fields.
// Delays updating a value until the user has stopped typing for `delay` ms.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';

/**
 * Returns a debounced version of the provided value.
 * @param value  The value to debounce
 * @param delay  Delay in milliseconds (default: 300ms)
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
