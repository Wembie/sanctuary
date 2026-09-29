import { useEffect } from 'react';
import { sceneStore } from '../store/scene';

/** Marks the current page as an immersive experience while `active`; navigation steps aside. */
export function useImmersive(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    sceneStore.set({ immersive: true });
    return () => sceneStore.set({ immersive: false });
  }, [active]);
}

/** Restores full brightness when the page that dimmed the scene goes away. */
export function useSceneIntensityReset(): void {
  useEffect(() => () => sceneStore.set({ intensity: 1 }), []);
}
