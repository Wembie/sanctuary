import { createStore } from '../lib/store';

/**
 * Transient, in-memory state that pages use to shape the shared scene.
 * Not persisted: a fresh visit always starts bright and with navigation.
 */
export interface SceneState {
  /** 0 – 1. Sleep mode lowers this toward black. */
  intensity: number;
  /** An experience is running; navigation steps aside. */
  immersive: boolean;
  /** "Or simply stay": every piece of UI goes away. */
  stillness: boolean;
  settingsOpen: boolean;
}

export const sceneStore = createStore<SceneState>({
  defaults: { intensity: 1, immersive: false, stillness: false, settingsOpen: false },
  sanitize: (_stored, defaults) => defaults,
});

/**
 * Per-frame values written by experiences and read by the ambient engine.
 * Deliberately mutable and outside React: they change 60 times a second.
 */
export const sceneSignals = {
  /** 0 – 1: how full the breath currently is. */
  breath: 0,
  /** Whether anything is breathing right now. */
  breathing: false,
};
