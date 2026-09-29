import { useCallback, useEffect, useRef, useState } from 'react';
import { Stopwatch } from '../lib/timer';

export type SessionStatus = 'idle' | 'running' | 'paused' | 'complete';

export interface Session {
  status: SessionStatus;
  elapsed: number;
  /** null for open-ended sessions. */
  duration: number | null;
  start: (duration: number | null) => void;
  pause: () => void;
  resume: () => void;
  end: () => void;
  reset: () => void;
}

/**
 * A timed session that ticks four times a second: enough for a clock that
 * shows seconds, cheap enough to leave running for an hour.
 */
export function useSession(onComplete?: () => void): Session {
  const watch = useRef(new Stopwatch());
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const completeRef = useRef(onComplete);
  useEffect(() => {
    completeRef.current = onComplete;
  });

  useEffect(() => {
    if (status !== 'running') return;
    const tick = () => {
      const now = watch.current.elapsed();
      setElapsed(now);
      if (duration !== null && now >= duration) {
        watch.current.pause();
        setStatus('complete');
        completeRef.current?.();
      }
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [status, duration]);

  const start = useCallback((next: number | null) => {
    watch.current.reset();
    watch.current.start();
    setDuration(next);
    setElapsed(0);
    setStatus('running');
  }, []);

  const pause = useCallback(() => {
    watch.current.pause();
    setStatus((s) => (s === 'running' ? 'paused' : s));
  }, []);

  const resume = useCallback(() => {
    watch.current.start();
    setStatus((s) => (s === 'paused' ? 'running' : s));
  }, []);

  const end = useCallback(() => {
    watch.current.pause();
    setElapsed(watch.current.elapsed());
    setStatus('complete');
  }, []);

  const reset = useCallback(() => {
    watch.current.reset();
    setElapsed(0);
    setStatus('idle');
  }, []);

  return { status, elapsed, duration, start, pause, resume, end, reset };
}
