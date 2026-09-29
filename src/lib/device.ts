interface NavigatorHints {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

/** Best-effort guess from the hints browsers expose. The engine also adapts at runtime. */
export function detectLowPowerDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const hints = navigator as Navigator & NavigatorHints;
  if (hints.connection?.saveData) return true;
  if (typeof hints.deviceMemory === 'number' && hints.deviceMemory <= 2) return true;
  const cores = navigator.hardwareConcurrency;
  return typeof cores === 'number' && cores > 0 && cores <= 2;
}

export const canHover = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export const supportsFullscreen = (): boolean =>
  typeof document !== 'undefined' &&
  typeof document.documentElement.requestFullscreen === 'function';

export async function toggleFullscreen(): Promise<void> {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
  } catch {
    /* not allowed here: nothing to do */
  }
}
