/** The parts of the Screen Wake Lock API we use, so tests can provide a fake. */
export interface WakeLockSentinelLike {
  readonly released: boolean;
  release(): Promise<void>;
  addEventListener(type: 'release', listener: () => void): void;
}

export interface WakeLockApi {
  request(type: 'screen'): Promise<WakeLockSentinelLike>;
}

/** Types claim `navigator.wakeLock` always exists; older Firefox and iOS < 16.4 disagree. */
export function browserWakeLock(): WakeLockApi | undefined {
  if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return undefined;
  return navigator.wakeLock as unknown as WakeLockApi;
}

const pageVisible = () => typeof document === 'undefined' || document.visibilityState === 'visible';

/**
 * Keeps the screen awake while wanted. Browsers drop the lock whenever the tab
 * is hidden, so `resume()` re-acquires it when the page is visible again.
 * Every failure (unsupported, low battery, permissions) is silent: the screen
 * may simply sleep, as it would anyway.
 */
export class ScreenWakeLock {
  private sentinel: WakeLockSentinelLike | null = null;
  private wanted = false;
  private pending = false;

  constructor(
    private readonly api: WakeLockApi | undefined = browserWakeLock(),
    private readonly isVisible: () => boolean = pageVisible,
  ) {}

  get supported(): boolean {
    return this.api !== undefined;
  }

  get held(): boolean {
    return this.sentinel !== null && !this.sentinel.released;
  }

  async set(wanted: boolean): Promise<void> {
    this.wanted = wanted;
    if (wanted) await this.acquire();
    else await this.release();
  }

  /** Call on `visibilitychange`: the browser released the lock when the tab was hidden. */
  async resume(): Promise<void> {
    if (this.wanted) await this.acquire();
  }

  private async acquire(): Promise<void> {
    if (!this.api || this.pending || this.held || !this.isVisible()) return;
    this.pending = true;
    try {
      const sentinel = await this.api.request('screen');
      if (!this.wanted) {
        // Turned off while the request was in flight.
        await sentinel.release().catch(() => undefined);
        return;
      }
      this.sentinel = sentinel;
      sentinel.addEventListener('release', () => {
        if (this.sentinel === sentinel) this.sentinel = null;
      });
    } catch {
      /* not allowed right now: the screen may sleep, and that's fine */
    } finally {
      this.pending = false;
    }
  }

  private async release(): Promise<void> {
    const sentinel = this.sentinel;
    this.sentinel = null;
    if (sentinel && !sentinel.released) await sentinel.release().catch(() => undefined);
  }
}
