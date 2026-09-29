import { clamp, easeInOutSine, isFiniteNumber } from './math';

export type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

/** Durations in seconds. A zero-length phase is skipped. */
export interface BreathPattern {
  inhale: number;
  hold: number;
  exhale: number;
  rest: number;
}

export type TechniqueId = 'calm' | 'box' | 'deep' | 'custom';

export interface Technique {
  id: TechniqueId;
  label: string;
  description: string;
  pattern: BreathPattern;
}

export const PHASE_ORDER: readonly BreathPhase[] = ['inhale', 'hold', 'exhale', 'rest'];

export const PHASE_LABEL: Record<BreathPhase, string> = {
  inhale: 'Inhale',
  hold: 'Hold',
  exhale: 'Exhale',
  rest: 'Rest',
};

export const TECHNIQUES: Record<Exclude<TechniqueId, 'custom'>, Technique> = {
  calm: {
    id: 'calm',
    label: 'Calm',
    description: 'A longer exhale to slow everything down.',
    pattern: { inhale: 4, hold: 4, exhale: 6, rest: 2 },
  },
  box: {
    id: 'box',
    label: 'Box',
    description: 'Four even sides. Steady and grounding.',
    pattern: { inhale: 4, hold: 4, exhale: 4, rest: 4 },
  },
  deep: {
    id: 'deep',
    label: 'Deep',
    description: 'Four, seven, eight. For the end of a long day.',
    pattern: { inhale: 4, hold: 7, exhale: 8, rest: 0 },
  },
};

export const DEFAULT_CUSTOM_PATTERN: BreathPattern = { inhale: 5, hold: 2, exhale: 7, rest: 1 };

export const PATTERN_LIMITS = { min: 0, max: 12 } as const;

/** Inhale and exhale always need at least one second: there is no breath without them. */
export function sanitizePattern(input: unknown, fallback = DEFAULT_CUSTOM_PATTERN): BreathPattern {
  if (typeof input !== 'object' || input === null) return { ...fallback };
  const source = input as Partial<Record<BreathPhase, unknown>>;
  const read = (phase: BreathPhase, min: number): number => {
    const value = source[phase];
    if (!isFiniteNumber(value)) return fallback[phase];
    return clamp(Math.round(value), min, PATTERN_LIMITS.max);
  };
  return {
    inhale: read('inhale', 1),
    hold: read('hold', 0),
    exhale: read('exhale', 1),
    rest: read('rest', 0),
  };
}

export const cycleDuration = (pattern: BreathPattern): number =>
  pattern.inhale + pattern.hold + pattern.exhale + pattern.rest;

export interface BreathState {
  phase: BreathPhase;
  /** 0 → 1 within the current phase. */
  progress: number;
  /** Whole seconds left in the phase, for an optional countdown. */
  secondsLeft: number;
  /** Completed cycles so far. */
  cycle: number;
  /** How "full" the orb is: 0 = empty lungs, 1 = full. Eased. */
  expansion: number;
}

export function getBreathState(pattern: BreathPattern, elapsedMs: number): BreathState {
  const total = cycleDuration(pattern);
  const elapsed = Math.max(0, elapsedMs) / 1000;
  const cycle = Math.floor(elapsed / total);
  let t = elapsed - cycle * total;

  for (const phase of PHASE_ORDER) {
    const length = pattern[phase];
    if (length <= 0) continue;
    if (t < length) {
      const progress = t / length;
      return {
        phase,
        progress,
        secondsLeft: Math.max(1, Math.ceil(length - t)),
        cycle,
        expansion: expansionFor(phase, progress),
      };
    }
    t -= length;
  }

  // Floating point edge: exactly at the end of a cycle.
  return {
    phase: 'inhale',
    progress: 0,
    secondsLeft: pattern.inhale,
    cycle: cycle + 1,
    expansion: 0,
  };
}

function expansionFor(phase: BreathPhase, progress: number): number {
  switch (phase) {
    case 'inhale':
      return easeInOutSine(progress);
    case 'hold':
      return 1;
    case 'exhale':
      return 1 - easeInOutSine(progress);
    case 'rest':
      return 0;
  }
}
