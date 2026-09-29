import { useEffect } from 'react';
import { ScreenWakeLock } from '../lib/wakeLock';

/** Keeps the screen on while `active` (e.g. a breath is running), and lets it sleep otherwise. */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const lock = new ScreenWakeLock();
    if (!lock.supported) return;
    void lock.set(true);
    const onVisibility = () => void lock.resume();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      void lock.set(false);
    };
  }, [active]);
}
