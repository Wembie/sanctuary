import { describe, expect, it } from 'vitest';
import { cycleDuration, getBreathState, sanitizePattern, TECHNIQUES } from './breathing';

const calm = TECHNIQUES.calm.pattern; // 4 / 4 / 6 / 2
const s = (seconds: number) => seconds * 1000;

describe('techniques', () => {
  it('match the documented rhythms', () => {
    expect(TECHNIQUES.calm.pattern).toEqual({ inhale: 4, hold: 4, exhale: 6, rest: 2 });
    expect(TECHNIQUES.box.pattern).toEqual({ inhale: 4, hold: 4, exhale: 4, rest: 4 });
    expect(TECHNIQUES.deep.pattern).toEqual({ inhale: 4, hold: 7, exhale: 8, rest: 0 });
  });

  it('computes cycle length', () => {
    expect(cycleDuration(calm)).toBe(16);
    expect(cycleDuration(TECHNIQUES.deep.pattern)).toBe(19);
  });
});

describe('getBreathState', () => {
  it('starts with an empty inhale', () => {
    const state = getBreathState(calm, 0);
    expect(state.phase).toBe('inhale');
    expect(state.expansion).toBe(0);
    expect(state.cycle).toBe(0);
    expect(state.secondsLeft).toBe(4);
  });

  it('walks through every phase in order', () => {
    expect(getBreathState(calm, s(2)).phase).toBe('inhale');
    expect(getBreathState(calm, s(5)).phase).toBe('hold');
    expect(getBreathState(calm, s(9)).phase).toBe('exhale');
    expect(getBreathState(calm, s(15)).phase).toBe('rest');
  });

  it('eases expansion symmetrically', () => {
    expect(getBreathState(calm, s(2)).expansion).toBeCloseTo(0.5);
    expect(getBreathState(calm, s(6)).expansion).toBe(1);
    expect(getBreathState(calm, s(11)).expansion).toBeCloseTo(0.5);
    expect(getBreathState(calm, s(15)).expansion).toBe(0);
  });

  it('keeps expansion within 0..1 and monotonic during inhale', () => {
    let previous = -1;
    for (let ms = 0; ms < 4000; ms += 100) {
      const { expansion } = getBreathState(calm, ms);
      expect(expansion).toBeGreaterThanOrEqual(0);
      expect(expansion).toBeLessThanOrEqual(1);
      expect(expansion).toBeGreaterThanOrEqual(previous);
      previous = expansion;
    }
  });

  it('repeats and counts cycles', () => {
    const state = getBreathState(calm, s(16 * 3 + 1));
    expect(state.cycle).toBe(3);
    expect(state.phase).toBe('inhale');
  });

  it('skips zero-length phases', () => {
    const deep = TECHNIQUES.deep.pattern;
    // 4 + 7 + 8 = 19: straight from exhale back to inhale, no rest.
    expect(getBreathState(deep, s(18.9)).phase).toBe('exhale');
    expect(getBreathState(deep, s(19.1)).phase).toBe('inhale');
  });

  it('counts seconds down within a phase', () => {
    expect(getBreathState(calm, s(8.2)).secondsLeft).toBe(6);
    expect(getBreathState(calm, s(13.5)).secondsLeft).toBe(1);
  });

  it('treats negative time as the start', () => {
    expect(getBreathState(calm, -500).phase).toBe('inhale');
  });
});

describe('sanitizePattern', () => {
  it('clamps and rounds values', () => {
    expect(sanitizePattern({ inhale: 30, hold: -2, exhale: 5.6, rest: 1 })).toEqual({
      inhale: 12,
      hold: 0,
      exhale: 6,
      rest: 1,
    });
  });

  it('never allows a breath without inhale or exhale', () => {
    const p = sanitizePattern({ inhale: 0, hold: 0, exhale: 0, rest: 0 });
    expect(p.inhale).toBe(1);
    expect(p.exhale).toBe(1);
  });

  it('falls back on garbage', () => {
    const fallback = { inhale: 3, hold: 3, exhale: 3, rest: 3 };
    expect(sanitizePattern('nope', fallback)).toEqual(fallback);
    expect(sanitizePattern({ inhale: 'x' }, fallback).inhale).toBe(3);
  });
});
