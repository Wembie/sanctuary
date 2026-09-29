/**
 * A pausable clock with an injectable time source. Pure enough to test
 * and small enough to reason about.
 */
export class Stopwatch {
  private accumulated = 0;
  private startedAt: number | null = null;
  private readonly now: () => number;

  constructor(now: () => number = () => performance.now()) {
    this.now = now;
  }

  get running(): boolean {
    return this.startedAt !== null;
  }

  start(): void {
    if (this.startedAt === null) this.startedAt = this.now();
  }

  pause(): void {
    if (this.startedAt === null) return;
    this.accumulated += this.now() - this.startedAt;
    this.startedAt = null;
  }

  reset(): void {
    this.accumulated = 0;
    this.startedAt = null;
  }

  elapsed(): number {
    return this.accumulated + (this.startedAt === null ? 0 : this.now() - this.startedAt);
  }
}

export const remainingMs = (durationMs: number, elapsedMs: number): number =>
  Math.max(0, durationMs - elapsedMs);

export const sessionProgress = (durationMs: number, elapsedMs: number): number =>
  durationMs <= 0 ? 0 : Math.min(1, Math.max(0, elapsedMs / durationMs));

/** 83_000 → "01:23", 3_723_000 → "1:02:03". Rounds up so a countdown never shows 00:00 early. */
export function formatClock(ms: number, { roundUp = true } = {}): string {
  const totalSeconds = Math.max(0, roundUp ? Math.ceil(ms / 1000) : Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

export const minutes = (value: number): number => value * 60_000;
