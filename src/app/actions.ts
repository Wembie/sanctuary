import { audio } from '../services/audio/AudioManager';
import { experienceStore } from '../store/experience';
import { isMixSilent, mixFromSoundscape, mixStore } from '../store/mix';
import { settingsStore } from '../store/settings';
import { getEnvironment, type EnvironmentId } from '../themes/environments';

/**
 * Turns sound on or off. Call it from a click or key handler:
 * browsers only let audio start inside a user gesture.
 */
export function setSoundEnabled(enabled: boolean): void {
  if (enabled) {
    if (!audio.unlock()) return;
    if (isMixSilent(mixStore.get())) {
      const env = getEnvironment(experienceStore.get().environment);
      mixStore.set((previous) => mixFromSoundscape(env.soundscape, previous));
    }
  }
  settingsStore.set({ soundEnabled: enabled });
}

/** Moves to another place: the sky, the particles and the soundscape all follow. */
export function selectEnvironment(id: EnvironmentId): void {
  if (experienceStore.get().environment === id) return;
  experienceStore.set({ environment: id });
  const env = getEnvironment(id);
  mixStore.set((previous) => mixFromSoundscape(env.soundscape, previous));
}
