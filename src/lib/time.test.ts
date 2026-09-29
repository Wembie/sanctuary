import { describe, expect, it } from 'vitest';
import { getDailyPause } from './daily';
import { hashString, pick, seededRandom } from './random';
import { getDayPart, localDateKey } from './time';

const at = (hour: number, day = 12) => new Date(2026, 8, day, hour, 30);

describe('time of day', () => {
  it('maps hours to parts of the day', () => {
    expect(getDayPart(at(6))).toBe('morning');
    expect(getDayPart(at(13))).toBe('afternoon');
    expect(getDayPart(at(19))).toBe('evening');
    expect(getDayPart(at(23))).toBe('night');
    expect(getDayPart(at(3))).toBe('night');
  });

  it('keys dates by local calendar day', () => {
    expect(localDateKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});

describe('seeded randomness', () => {
  it('is deterministic for a seed', () => {
    const a = seededRandom(42);
    const b = seededRandom(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('stays within [0, 1)', () => {
    const r = seededRandom(hashString('sanctuary'));
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('picks from a list and refuses an empty one', () => {
    expect(['a', 'b', 'c']).toContain(pick(['a', 'b', 'c'], seededRandom(1)));
    expect(() => pick([], Math.random)).toThrow();
  });
});

describe('daily pause', () => {
  it('is the same all day', () => {
    expect(getDailyPause(at(1))).toEqual(getDailyPause(at(23)));
  });

  it('changes across days', () => {
    const month = Array.from({ length: 28 }, (_, i) => getDailyPause(at(12, i + 1)));
    const distinct = new Set(month.map((p) => `${p.environment}/${p.technique}`));
    expect(distinct.size).toBeGreaterThan(5);
  });
});
