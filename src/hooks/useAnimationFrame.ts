import { useEffect, useRef } from 'react';

/**
 * Runs `callback` every frame while `active`. The callback can change between
 * renders without restarting the loop. Browsers pause rAF in hidden tabs for free.
 */
export function useAnimationFrame(callback: (now: number) => void, active = true): void {
  const ref = useRef(callback);
  useEffect(() => {
    ref.current = callback;
  });

  useEffect(() => {
    if (!active) return;
    let id = 0;
    const loop = (now: number) => {
      ref.current(now);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [active]);
}
