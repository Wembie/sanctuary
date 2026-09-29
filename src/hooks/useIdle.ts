import { useEffect, useState } from 'react';

const ACTIVITY_EVENTS = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'] as const;

/** True after `ms` without any input. Resets on the next touch, key or movement. */
export function useIdle(ms: number, enabled: boolean): boolean {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    // Every (re)start begins awake; a stale "idle" from before must not carry over.
    const wake = window.setTimeout(() => setIdle(false), 0);
    let timer = window.setTimeout(() => setIdle(true), ms);
    let lastReset = 0;
    const onActivity = () => {
      const now = performance.now();
      // pointermove fires constantly; resetting a timer ten times a second is plenty.
      if (now - lastReset < 100) return;
      lastReset = now;
      setIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), ms);
    };
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    return () => {
      window.clearTimeout(wake);
      window.clearTimeout(timer);
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, [ms, enabled]);

  return enabled && idle;
}
