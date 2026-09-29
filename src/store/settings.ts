import { asRecord, createStore, pickBoolean, pickEnum, pickNumber } from '../lib/store';

export type MotionPreference = 'system' | 'reduced' | 'full';
export type PerformancePreference = 'auto' | 'on' | 'off';

export interface SettingsState {
  soundEnabled: boolean;
  masterVolume: number;
  motion: MotionPreference;
  particles: boolean;
  performance: PerformancePreference;
  /** Let the interface fade away when you stop touching things. */
  autoHide: boolean;
}

export const DEFAULT_SETTINGS: SettingsState = {
  soundEnabled: false,
  masterVolume: 0.75,
  motion: 'system',
  particles: true,
  performance: 'auto',
  autoHide: true,
};

export function sanitizeSettings(stored: unknown, d: SettingsState): SettingsState {
  const s = asRecord(stored);
  return {
    soundEnabled: pickBoolean(s.soundEnabled, d.soundEnabled),
    masterVolume: pickNumber(s.masterVolume, 0, 1, d.masterVolume),
    motion: pickEnum(s.motion, ['system', 'reduced', 'full'] as const, d.motion),
    particles: pickBoolean(s.particles, d.particles),
    performance: pickEnum(s.performance, ['auto', 'on', 'off'] as const, d.performance),
    autoHide: pickBoolean(s.autoHide, d.autoHide),
  };
}

export const settingsStore = createStore<SettingsState>({
  key: 'settings',
  defaults: DEFAULT_SETTINGS,
  sanitize: sanitizeSettings,
});
