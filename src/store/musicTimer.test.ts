import { beforeEach, describe, expect, it } from 'vitest';
import { minutesLeft, musicTimerStore, setMusicTimer } from './musicTimer';

beforeEach(() => musicTimerStore.reset());

describe('music timer', () => {
  it('sets and clears the end time', () => {
    setMusicTimer(30, 1_000);
    expect(musicTimerStore.get()).toEqual({ endsAt: 1_000 + 30 * 60_000, minutes: 30 });
    setMusicTimer(null);
    expect(musicTimerStore.get()).toEqual({ endsAt: null, minutes: null });
  });

  it('counts minutes left, rounding up and never below zero', () => {
    const endsAt = 10 * 60_000;
    expect(minutesLeft(endsAt, 0)).toBe(10);
    expect(minutesLeft(endsAt, 9 * 60_000 + 1)).toBe(1);
    expect(minutesLeft(endsAt, endsAt + 5_000)).toBe(0);
  });
});
