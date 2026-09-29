import { createStore } from '../lib/store';

/**
 * "Stop the music after N minutes". In memory only: a timer set last night
 * shouldn't silence tomorrow's music.
 */
export interface MusicTimerState {
  /** Epoch ms when the music should start fading out, or null. */
  endsAt: number | null;
  minutes: number | null;
}

export const MUSIC_TIMER_OPTIONS = [15, 30, 60] as const;

/** How long the final fade takes once the timer is up. */
export const MUSIC_TIMER_FADE_SECONDS = 20;

export const musicTimerStore = createStore<MusicTimerState>({
  defaults: { endsAt: null, minutes: null },
  sanitize: (_stored, defaults) => defaults,
});

export function setMusicTimer(minutes: number | null, now: number = Date.now()): void {
  musicTimerStore.set(
    minutes === null
      ? { endsAt: null, minutes: null }
      : { endsAt: now + minutes * 60_000, minutes },
  );
}

/** Whole minutes left, rounded up (never shows 0 while still running). */
export const minutesLeft = (endsAt: number, now: number = Date.now()): number =>
  Math.max(0, Math.ceil((endsAt - now) / 60_000));
