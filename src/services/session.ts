import { createStore, type Store } from '../lib/store';
import { Stopwatch } from '../lib/timer';

export type SessionKind = 'focus' | 'sleep' | 'disconnect';
export type SessionStatus = 'idle' | 'running' | 'paused' | 'complete';

export interface SessionState {
  kind: SessionKind | null;
  status: SessionStatus;
  /** null for open-ended sessions. */
  duration: number | null;
  elapsed: number;
}

const IDLE: SessionState = { kind: null, status: 'idle', duration: null, elapsed: 0 };
const TICK_MS = 250;

interface Clock {
  now: () => number;
  setInterval: (fn: () => void, ms: number) => number;
  clearInterval: (id: number) => void;
}

const browserClock: Clock = {
  now: () => performance.now(),
  setInterval: (fn, ms) => window.setInterval(fn, ms),
  clearInterval: (id) => window.clearInterval(id),
};

/**
 * One timed session for the whole app (Focus, Sleep or Disconnect).
 * It lives outside the pages, so it keeps running while you move around.
 * Starting a new session replaces the previous one.
 */
export function createSessionController(clock: Clock = browserClock) {
  const store: Store<SessionState> = createStore<SessionState>({
    defaults: IDLE,
    sanitize: (_stored, defaults) => defaults,
  });
  const watch = new Stopwatch(clock.now);
  const completeListeners = new Set<(kind: SessionKind) => void>();
  let ticker: number | null = null;

  const stopTicking = () => {
    if (ticker !== null) clock.clearInterval(ticker);
    ticker = null;
  };

  const tick = () => {
    const state = store.get();
    if (state.status !== 'running' || state.kind === null) return;
    const elapsed = watch.elapsed();
    if (state.duration !== null && elapsed >= state.duration) {
      watch.pause();
      stopTicking();
      store.set({ elapsed: state.duration, status: 'complete' });
      const kind = state.kind;
      completeListeners.forEach((listener) => listener(kind));
      return;
    }
    store.set({ elapsed });
  };

  const startTicking = () => {
    stopTicking();
    ticker = clock.setInterval(tick, TICK_MS);
  };

  return {
    store,

    start(kind: SessionKind, duration: number | null): void {
      watch.reset();
      watch.start();
      store.set({ kind, status: 'running', duration, elapsed: 0 });
      startTicking();
    },

    pause(): void {
      if (store.get().status !== 'running') return;
      watch.pause();
      stopTicking();
      store.set({ status: 'paused', elapsed: watch.elapsed() });
    },

    resume(): void {
      if (store.get().status !== 'paused') return;
      watch.start();
      store.set({ status: 'running' });
      startTicking();
    },

    /** Ends early, as if the time were up (shows the completion screen). */
    end(): void {
      const { kind, status } = store.get();
      if (kind === null || status === 'idle' || status === 'complete') return;
      watch.pause();
      stopTicking();
      store.set({ status: 'complete', elapsed: watch.elapsed() });
    },

    /** Back to nothing. */
    reset(): void {
      watch.reset();
      stopTicking();
      store.set(IDLE);
    },

    /** Called when a session reaches its end on its own (not when ended early). */
    onComplete(listener: (kind: SessionKind) => void): () => void {
      completeListeners.add(listener);
      return () => {
        completeListeners.delete(listener);
      };
    },

    /** For tests: advance one tick without waiting. */
    tick,
  };
}

export type SessionController = ReturnType<typeof createSessionController>;

export const session = createSessionController();

export const isActive = (state: SessionState): boolean =>
  state.status === 'running' || state.status === 'paused';

export const ROUTE_OF: Record<SessionKind, '/focus' | '/sleep' | '/disconnect'> = {
  focus: '/focus',
  sleep: '/sleep',
  disconnect: '/disconnect',
};
