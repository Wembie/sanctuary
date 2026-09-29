import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createStore, pickEnum, pickNumber } from './store';
import { readJSON, writeJSON } from './storage';
import { DEFAULT_SETTINGS, sanitizeSettings } from '../store/settings';
import { DEFAULT_EXPERIENCE, sanitizeExperience } from '../store/experience';

beforeEach(() => window.localStorage.clear());

describe('storage', () => {
  it('round-trips JSON under a namespace', () => {
    writeJSON('thing', { a: 1 });
    expect(readJSON('thing')).toEqual({ a: 1 });
    expect(window.localStorage.getItem('sanctuary:v1:thing')).toBe('{"a":1}');
  });

  it('returns undefined for corrupt data instead of throwing', () => {
    window.localStorage.setItem('sanctuary:v1:broken', '{not json');
    expect(readJSON('broken')).toBeUndefined();
  });

  it('survives a storage that throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded');
    });
    expect(() => writeJSON('x', 1)).not.toThrow();
    spy.mockRestore();
  });
});

describe('createStore', () => {
  const sanitize = (stored: unknown, d: { n: number }) =>
    typeof stored === 'object' && stored !== null && 'n' in stored
      ? { n: pickNumber((stored as { n: unknown }).n, 0, 10, d.n) }
      : d;

  it('persists updates and notifies subscribers', () => {
    const store = createStore({ key: 'counter', defaults: { n: 1 }, sanitize });
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.set({ n: 2 });
    store.set((s) => ({ n: s.n + 1 }));
    expect(store.get()).toEqual({ n: 3 });
    expect(listener).toHaveBeenCalledTimes(2);
    expect(readJSON('counter')).toEqual({ n: 3 });
    unsubscribe();
    store.set({ n: 4 });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('loads and sanitizes what was stored', () => {
    writeJSON('counter', { n: 99 });
    expect(createStore({ key: 'counter', defaults: { n: 1 }, sanitize }).get()).toEqual({ n: 10 });
  });

  it('does not notify when nothing changed', () => {
    const store = createStore({ defaults: { n: 1 }, sanitize });
    const listener = vi.fn();
    store.subscribe(listener);
    store.set((s) => s);
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('sanitizers', () => {
  it('pickEnum rejects unknown values', () => {
    expect(pickEnum('b', ['a', 'b'] as const, 'a')).toBe('b');
    expect(pickEnum('z', ['a', 'b'] as const, 'a')).toBe('a');
    expect(pickEnum(3, ['a'] as const, 'a')).toBe('a');
  });

  it('settings: repairs tampered values field by field', () => {
    const repaired = sanitizeSettings(
      { soundEnabled: 'yes', masterVolume: 7, motion: 'wild', particles: false },
      DEFAULT_SETTINGS,
    );
    expect(repaired).toEqual({
      ...DEFAULT_SETTINGS,
      masterVolume: 1,
      particles: false,
    });
  });

  it('experience: keeps valid choices and drops unknown routes and places', () => {
    const repaired = sanitizeExperience(
      { environment: 'ocean', lastRoute: '/admin', technique: 'box', visits: -3 },
      DEFAULT_EXPERIENCE,
    );
    expect(repaired.environment).toBe('ocean');
    expect(repaired.technique).toBe('box');
    expect(repaired.lastRoute).toBe('/');
    expect(repaired.visits).toBe(0);
  });

  it('experience: arrays and null are not records', () => {
    expect(sanitizeExperience(null, DEFAULT_EXPERIENCE)).toEqual(DEFAULT_EXPERIENCE);
    expect(sanitizeExperience([1, 2], DEFAULT_EXPERIENCE)).toEqual(DEFAULT_EXPERIENCE);
  });
});
