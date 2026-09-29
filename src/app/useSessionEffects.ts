import { useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { useWakeLock } from '../hooks/useWakeLock';
import { sleepFade } from '../lib/sleep';
import { audio } from '../services/audio/AudioManager';
import { session } from '../services/session';
import { sceneStore } from '../store/scene';

/**
 * What a session does to the rest of the app, wherever you are in it:
 * a soft chime when Focus/Disconnect finish, the screen kept on during Focus,
 * and the slow Sleep fade of light and sound.
 */
export function useSessionEffects(): void {
  const state = useStore(session.store);

  useEffect(
    () =>
      session.onComplete((kind) => {
        if (kind !== 'sleep') audio.playChime();
      }),
    [],
  );

  // The clock should stay visible for the whole session; paused sessions let the screen rest.
  useWakeLock(state.kind === 'focus' && state.status === 'running');

  // Light first, sound only at the end (see lib/sleep.ts).
  const sleeping = state.kind === 'sleep' && state.status !== 'idle';
  useEffect(() => {
    if (!sleeping) return;
    const { intensity, volume } = sleepFade(state.elapsed, state.duration);
    const rounded = Math.round(intensity * 100) / 100;
    if (sceneStore.get().intensity !== rounded) sceneStore.set({ intensity: rounded });
    audio.setMasterScale(volume, 3);
  }, [sleeping, state.elapsed, state.duration]);

  // When sleep ends (woken, replaced or finished and left), light and sound return slowly.
  useEffect(() => {
    if (!sleeping) return;
    return () => {
      sceneStore.set({ intensity: 1 });
      audio.setMasterScale(1, 4);
    };
  }, [sleeping]);
}
