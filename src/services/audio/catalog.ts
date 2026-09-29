export const SOUND_IDS = [
  'rain',
  'ocean',
  'fire',
  'forest',
  'wind',
  'space',
  'storm',
  'deep',
] as const;

export type SoundId = (typeof SOUND_IDS)[number];

/* Labels and descriptions live in the dictionaries: src/i18n. */

export type SoundMix = Partial<Record<SoundId, number>>;

/**
 * Local, redistributable audio files served from /public/audio.
 * Every sound above is synthesized in real time, so this list starts empty.
 * See public/audio/README.md for how to add tracks.
 */
export const MUSIC_CATEGORIES = [
  'Deep Relaxation',
  'Sleep',
  'Focus',
  'Meditation',
  'Nature',
  'Ambient',
  'Lo-Fi',
] as const;
export type MusicCategory = (typeof MUSIC_CATEGORIES)[number];

export interface MusicTrack {
  id: string;
  /** Track titles are proper names: not translated. */
  title: string;
  category: MusicCategory;
  /** Path relative to the site root, e.g. "audio/slow-tide.mp3". */
  src: string;
  /** Who made it and under which license. Required: no unlicensed audio. */
  credit: string;
}

export const MUSIC_TRACKS: readonly MusicTrack[] = [];
