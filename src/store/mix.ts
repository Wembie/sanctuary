import { asRecord, createStore, pickBoolean, pickNumber } from '../lib/store';
import { SOUND_IDS, type SoundId, type SoundMix } from '../services/audio/catalog';

export interface ChannelState {
  on: boolean;
  volume: number;
}

export type MixState = Record<SoundId, ChannelState>;

const DEFAULT_VOLUME = 0.5;

export const DEFAULT_MIX: MixState = Object.fromEntries(
  SOUND_IDS.map((id) => [id, { on: false, volume: DEFAULT_VOLUME }]),
) as MixState;

export function sanitizeMix(stored: unknown, defaults: MixState): MixState {
  const source = asRecord(stored);
  return Object.fromEntries(
    SOUND_IDS.map((id) => {
      const channel = asRecord(source[id]);
      return [
        id,
        {
          on: pickBoolean(channel.on, defaults[id].on),
          volume: pickNumber(channel.volume, 0, 1, defaults[id].volume),
        },
      ];
    }),
  ) as MixState;
}

export const mixStore = createStore<MixState>({
  key: 'mix',
  defaults: DEFAULT_MIX,
  sanitize: sanitizeMix,
});

/** The audible part of a mix, ready for AudioManager.sync(). */
export function toSoundMix(state: MixState): SoundMix {
  const mix: SoundMix = {};
  for (const id of SOUND_IDS) {
    if (state[id].on) mix[id] = state[id].volume;
  }
  return mix;
}

/** Replace the whole mix with a scene's soundscape. */
export function mixFromSoundscape(soundscape: SoundMix, previous: MixState): MixState {
  return Object.fromEntries(
    SOUND_IDS.map((id) => {
      const volume = soundscape[id];
      return [id, volume === undefined ? { ...previous[id], on: false } : { on: true, volume }];
    }),
  ) as MixState;
}

export const isMixSilent = (state: MixState): boolean => SOUND_IDS.every((id) => !state[id].on);

export function toggleChannel(id: SoundId): void {
  mixStore.set((state) => ({ ...state, [id]: { ...state[id], on: !state[id].on } }));
}

export function setChannelVolume(id: SoundId, volume: number): void {
  mixStore.set((state) => ({ ...state, [id]: { on: volume > 0, volume } }));
}
