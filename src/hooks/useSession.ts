import { useEffect } from 'react';
import { isActive, session, type SessionKind, type SessionStatus } from '../services/session';
import { useStore } from './useStore';

export interface SessionView {
  status: SessionStatus;
  elapsed: number;
  duration: number | null;
  active: boolean;
  start: (duration: number | null) => void;
  pause: () => void;
  resume: () => void;
  end: () => void;
  reset: () => void;
}

/**
 * A page's view of the global session. If another kind of session is running,
 * this page sees "idle" (starting one here replaces the other).
 * A finished session is cleared when you leave its page, so coming back starts fresh.
 */
export function useSession(kind: SessionKind): SessionView {
  const state = useStore(session.store);
  const mine = state.kind === kind;
  const status: SessionStatus = mine ? state.status : 'idle';

  useEffect(
    () => () => {
      const now = session.store.get();
      if (now.kind === kind && now.status === 'complete') session.reset();
    },
    [kind],
  );

  return {
    status,
    elapsed: mine ? state.elapsed : 0,
    duration: mine ? state.duration : null,
    active: mine && isActive(state),
    start: (duration) => session.start(kind, duration),
    pause: session.pause,
    resume: session.resume,
    end: session.end,
    reset: session.reset,
  };
}
