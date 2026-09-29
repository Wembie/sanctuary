import type { SoundId, SoundMix } from './catalog';

export interface MixPlan {
  start: [SoundId, number][];
  stop: SoundId[];
  update: [SoundId, number][];
}

const AUDIBLE = 0.001;

/** Pure diff between what is playing and what should be playing. */
export function planMix(current: ReadonlyMap<SoundId, number>, desired: SoundMix): MixPlan {
  const plan: MixPlan = { start: [], stop: [], update: [] };
  const wanted = new Map<SoundId, number>();
  for (const [id, volume] of Object.entries(desired) as [SoundId, number | undefined][]) {
    if (volume !== undefined && volume > AUDIBLE) wanted.set(id, Math.min(1, volume));
  }
  for (const id of current.keys()) {
    if (!wanted.has(id)) plan.stop.push(id);
  }
  for (const [id, volume] of wanted) {
    const playing = current.get(id);
    if (playing === undefined) plan.start.push([id, volume]);
    else if (Math.abs(playing - volume) > AUDIBLE) plan.update.push([id, volume]);
  }
  return plan;
}

/**
 * Perceived loudness is roughly logarithmic; squaring the slider value
 * makes the bottom half of a volume slider actually useful.
 */
export const perceptualGain = (value: number): number => Math.min(1, Math.max(0, value)) ** 2;
