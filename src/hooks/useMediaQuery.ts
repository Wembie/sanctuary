import { useSyncExternalStore } from 'react';

const query = (q: string): MediaQueryList | null =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(q)
    : null;

export function useMediaQuery(q: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = query(q);
      mql?.addEventListener('change', onChange);
      return () => mql?.removeEventListener('change', onChange);
    },
    () => query(q)?.matches ?? false,
    () => false,
  );
}
