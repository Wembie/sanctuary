import { describe, expect, it } from 'vitest';
import { perceptualGain, planMix } from './mix';
import type { SoundId } from './catalog';
import {
  DEFAULT_MIX,
  isMixSilent,
  mixFromSoundscape,
  sanitizeMix,
  toSoundMix,
} from '../../store/mix';

const playing = (entries: [SoundId, number][]) => new Map(entries);

describe('planMix', () => {
  it('starts what is new, stops what is gone, updates what changed', () => {
    const plan = planMix(
      playing([
        ['rain', 0.5],
        ['fire', 0.3],
        ['wind', 0.2],
      ]),
      { rain: 0.5, fire: 0.6, ocean: 0.4 },
    );
    expect(plan.start).toEqual([['ocean', 0.4]]);
    expect(plan.stop).toEqual(['wind']);
    expect(plan.update).toEqual([['fire', 0.6]]);
  });

  it('treats inaudible volumes as stopped', () => {
    const plan = planMix(playing([['rain', 0.5]]), { rain: 0, ocean: 0.0001 });
    expect(plan.stop).toEqual(['rain']);
    expect(plan.start).toEqual([]);
  });

  it('does nothing when already in sync', () => {
    expect(planMix(playing([['deep', 0.7]]), { deep: 0.7 })).toEqual({
      start: [],
      stop: [],
      update: [],
    });
  });

  it('clamps volumes above 1', () => {
    expect(planMix(new Map(), { rain: 3 }).start).toEqual([['rain', 1]]);
  });
});

describe('perceptualGain', () => {
  it('curves the slider and clamps', () => {
    expect(perceptualGain(0.5)).toBe(0.25);
    expect(perceptualGain(1)).toBe(1);
    expect(perceptualGain(-1)).toBe(0);
    expect(perceptualGain(2)).toBe(1);
  });
});

describe('mix state', () => {
  it('starts silent', () => {
    expect(isMixSilent(DEFAULT_MIX)).toBe(true);
    expect(toSoundMix(DEFAULT_MIX)).toEqual({});
  });

  it('applies a soundscape, switching everything else off but keeping its volume', () => {
    const custom = { ...DEFAULT_MIX, fire: { on: true, volume: 0.9 } };
    const next = mixFromSoundscape({ rain: 0.6 }, custom);
    expect(toSoundMix(next)).toEqual({ rain: 0.6 });
    expect(next.fire).toEqual({ on: false, volume: 0.9 });
  });

  it('sanitizes stored mixes', () => {
    const repaired = sanitizeMix({ rain: { on: true, volume: 4 }, bogus: {} }, DEFAULT_MIX);
    expect(repaired.rain).toEqual({ on: true, volume: 1 });
    expect(Object.keys(repaired)).not.toContain('bogus');
    expect(repaired.ocean).toEqual(DEFAULT_MIX.ocean);
  });
});
