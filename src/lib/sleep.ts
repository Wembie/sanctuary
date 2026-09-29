import { clamp, easeInOutSine } from './math';

export interface SleepFade {
  /** Scene brightness, 1 → almost black. */
  intensity: number;
  /** Master volume multiplier, 1 → silence. */
  volume: number;
}

const OPEN_ENDED_SETTLE_MS = 20 * 60_000;
const FLOOR = 0.03;

/**
 * How the world fades during sleep. The screen dims gradually from the start;
 * sound holds steady and only slips away at the very end.
 */
export function sleepFade(elapsedMs: number, durationMs: number | null): SleepFade {
  if (durationMs === null) {
    const p = clamp(elapsedMs / OPEN_ENDED_SETTLE_MS, 0, 1);
    return { intensity: 1 - 0.6 * easeInOutSine(p), volume: 1 };
  }
  const p = clamp(elapsedMs / durationMs, 0, 1);
  const intensity =
    p < 0.75
      ? 1 - 0.5 * easeInOutSine(p / 0.75)
      : 0.5 - (0.5 - FLOOR) * easeInOutSine((p - 0.75) / 0.25);
  const volume = p < 0.7 ? 1 : 1 - easeInOutSine((p - 0.7) / 0.3);
  return { intensity, volume };
}
