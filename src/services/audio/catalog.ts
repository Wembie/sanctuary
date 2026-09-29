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

export interface SoundInfo {
  id: SoundId;
  label: string;
  /** Short line for screen readers and tooltips. */
  description: string;
}

export const SOUNDS: Record<SoundId, SoundInfo> = {
  rain: { id: 'rain', label: 'Rain', description: 'Steady rain on a quiet street' },
  ocean: { id: 'ocean', label: 'Ocean', description: 'Slow waves, far from shore' },
  fire: { id: 'fire', label: 'Fire', description: 'A small fire, softly crackling' },
  forest: { id: 'forest', label: 'Forest', description: 'Leaves, air, and the odd distant bird' },
  wind: { id: 'wind', label: 'Wind', description: 'Wind moving over open land' },
  space: { id: 'space', label: 'Space', description: 'A low, warm drone' },
  storm: { id: 'storm', label: 'Storm', description: 'Heavy rain and distant thunder' },
  deep: { id: 'deep', label: 'Deep', description: 'Warm brown noise' },
};

export type SoundMix = Partial<Record<SoundId, number>>;

/**
 * Local, redistributable audio files served from /public/audio.
 * Every sound above is synthesized in real time, so this list starts empty.
 * See public/audio/README.md for how to add tracks.
 */
export interface MusicTrack {
  id: string;
  title: string;
  category: 'Deep Relaxation' | 'Sleep' | 'Focus' | 'Meditation' | 'Nature' | 'Ambient' | 'Lo-Fi';
  /** Path relative to the site root, e.g. "audio/slow-tide.mp3". */
  src: string;
  /** Who made it and under which license. Required: no unlicensed audio. */
  credit: string;
}

export const MUSIC_TRACKS: readonly MusicTrack[] = [];
