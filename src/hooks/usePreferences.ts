import { detectLowPowerDevice } from '../lib/device';
import { settingsStore } from '../store/settings';
import { useMediaQuery } from './useMediaQuery';
import { useStore } from './useStore';

/** System preference and the in-app setting, combined. The in-app choice wins. */
export function useReducedMotion(): boolean {
  const systemReduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const motion = useStore(settingsStore, (s) => s.motion);
  return motion === 'system' ? systemReduced : motion === 'reduced';
}

const lowPowerDevice = detectLowPowerDevice();

export function useLowPerformance(): boolean {
  const performance = useStore(settingsStore, (s) => s.performance);
  return performance === 'auto' ? lowPowerDevice : performance === 'on';
}
