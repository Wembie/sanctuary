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

/** Music categories. Tracks themselves live in ./music/library.ts. */
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
