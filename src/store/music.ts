import { asRecord, createStore, pickNumber } from '../lib/store';

export interface MusicState {
  /** The track that should be playing, or null for none. Unknown ids are ignored at playback. */
  trackId: string | null;
  volume: number;
}

export const DEFAULT_MUSIC: MusicState = { trackId: null, volume: 0.6 };

export function sanitizeMusic(stored: unknown, d: MusicState): MusicState {
  const s = asRecord(stored);
  const trackId = typeof s.trackId === 'string' && s.trackId.length <= 300 ? s.trackId : null;
  return { trackId, volume: pickNumber(s.volume, 0, 1, d.volume) };
}

export const musicStore = createStore<MusicState>({
  key: 'music',
  defaults: DEFAULT_MUSIC,
  sanitize: sanitizeMusic,
});
