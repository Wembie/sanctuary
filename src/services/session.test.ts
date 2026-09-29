import { describe, expect, it, vi } from 'vitest';
import { createSessionController } from './session';

function fakeClock() {
  let now = 0;
  const timers = new Map<number, () => void>();
  let nextId = 1;
  return {
    clock: {
      now: () => now,
      setInterval: (fn: () => void) => {
        const id = nextId++;
        timers.set(id, fn);
        return id;
      },
      clearInterval: (id: number) => {
        timers.delete(id);
      },
    },
    advance(ms: number) {
      now += ms;
      timers.forEach((fn) => fn());
    },
    get activeTimers() {
      return timers.size;
    },
  };
}

describe('session controller', () => {
  it('runs, pauses, resumes and completes on its own', () => {
    const c = fakeClock();
    const s = createSessionController(c.clock);
    const done = vi.fn();
    s.onComplete(done);

    s.start('focus', 10_000);
    c.advance(4000);
    expect(s.store.get()).toMatchObject({ kind: 'focus', status: 'running', elapsed: 4000 });

    s.pause();
    c.advance(60_000); // paused time doesn't count
    expect(s.store.get()).toMatchObject({ status: 'paused', elapsed: 4000 });
    expect(c.activeTimers).toBe(0);

    s.resume();
    c.advance(6000);
    expect(s.store.get()).toMatchObject({ status: 'complete', elapsed: 10_000 });
    expect(done).toHaveBeenCalledWith('focus');
    expect(c.activeTimers).toBe(0);
  });

  it('ending early completes without firing onComplete', () => {
    const c = fakeClock();
    const s = createSessionController(c.clock);
    const done = vi.fn();
    s.onComplete(done);
    s.start('disconnect', 60_000);
    c.advance(1000);
    s.end();
    expect(s.store.get().status).toBe('complete');
    expect(done).not.toHaveBeenCalled();
  });

  it('open-ended sessions never complete by themselves', () => {
    const c = fakeClock();
    const s = createSessionController(c.clock);
    s.start('sleep', null);
    c.advance(10 * 60 * 60 * 1000);
    expect(s.store.get()).toMatchObject({ status: 'running', duration: null });
  });

  it('starting a new session replaces the old one', () => {
    const c = fakeClock();
    const s = createSessionController(c.clock);
    s.start('focus', 10_000);
    c.advance(5000);
    s.start('sleep', 20_000);
    expect(s.store.get()).toMatchObject({ kind: 'sleep', elapsed: 0, duration: 20_000 });
    expect(c.activeTimers).toBe(1);
  });

  it('reset returns to idle and stops ticking', () => {
    const c = fakeClock();
    const s = createSessionController(c.clock);
    s.start('focus', 10_000);
    s.reset();
    expect(s.store.get()).toEqual({ kind: null, status: 'idle', duration: null, elapsed: 0 });
    expect(c.activeTimers).toBe(0);
  });

  it('ignores pause/resume/end in the wrong state', () => {
    const c = fakeClock();
    const s = createSessionController(c.clock);
    s.pause();
    s.resume();
    s.end();
    expect(s.store.get().status).toBe('idle');
  });
});
