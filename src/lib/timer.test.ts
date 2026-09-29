import { describe, expect, it } from 'vitest';
import { formatClock, minutes, remainingMs, sessionProgress, Stopwatch } from './timer';
import { sleepFade } from './sleep';

describe('Stopwatch', () => {
  const clock = () => {
    let now = 0;
    return { now: () => now, advance: (ms: number) => (now += ms) };
  };

  it('accumulates only while running', () => {
    const c = clock();
    const w = new Stopwatch(c.now);
    c.advance(1000);
    expect(w.elapsed()).toBe(0);
    w.start();
    c.advance(1500);
    expect(w.elapsed()).toBe(1500);
    w.pause();
    c.advance(5000);
    expect(w.elapsed()).toBe(1500);
    w.start();
    c.advance(500);
    expect(w.elapsed()).toBe(2000);
  });

  it('ignores double start and double pause', () => {
    const c = clock();
    const w = new Stopwatch(c.now);
    w.start();
    c.advance(100);
    w.start();
    c.advance(100);
    w.pause();
    w.pause();
    expect(w.elapsed()).toBe(200);
    expect(w.running).toBe(false);
  });

  it('resets to zero', () => {
    const c = clock();
    const w = new Stopwatch(c.now);
    w.start();
    c.advance(900);
    w.reset();
    expect(w.elapsed()).toBe(0);
    expect(w.running).toBe(false);
  });
});

describe('formatClock', () => {
  it('formats minutes and seconds', () => {
    expect(formatClock(83_000)).toBe('01:23');
    expect(formatClock(0)).toBe('00:00');
  });

  it('formats hours', () => {
    expect(formatClock(3_723_000)).toBe('1:02:03');
  });

  it('rounds up by default so a countdown never ends early', () => {
    expect(formatClock(500)).toBe('00:01');
    expect(formatClock(500, { roundUp: false })).toBe('00:00');
  });

  it('never goes negative', () => {
    expect(formatClock(-4000)).toBe('00:00');
  });
});

describe('session math', () => {
  it('computes remaining and progress', () => {
    expect(remainingMs(minutes(25), minutes(5))).toBe(minutes(20));
    expect(remainingMs(1000, 5000)).toBe(0);
    expect(sessionProgress(1000, 250)).toBe(0.25);
    expect(sessionProgress(1000, 5000)).toBe(1);
    expect(sessionProgress(0, 10)).toBe(0);
  });
});

describe('sleepFade', () => {
  const duration = minutes(30);

  it('starts at full light and sound', () => {
    expect(sleepFade(0, duration)).toEqual({ intensity: 1, volume: 1 });
  });

  it('dims light before sound', () => {
    const midway = sleepFade(duration * 0.5, duration);
    expect(midway.intensity).toBeLessThan(1);
    expect(midway.volume).toBe(1);
  });

  it('ends almost black and silent', () => {
    const end = sleepFade(duration, duration);
    expect(end.intensity).toBeCloseTo(0.03);
    expect(end.volume).toBeCloseTo(0);
  });

  it('only ever gets darker', () => {
    let previous = 2;
    for (let p = 0; p <= 1; p += 0.02) {
      const { intensity } = sleepFade(duration * p, duration);
      expect(intensity).toBeLessThanOrEqual(previous + 1e-9);
      previous = intensity;
    }
  });

  it('open-ended sleep dims partway and keeps sound', () => {
    const later = sleepFade(minutes(120), null);
    expect(later.intensity).toBeCloseTo(0.4);
    expect(later.volume).toBe(1);
  });
});
