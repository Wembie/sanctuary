export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Sine ease-in-out: the most breath-like curve we have. */
export const easeInOutSine = (t: number): number => (1 - Math.cos(Math.PI * clamp(t, 0, 1))) / 2;

export const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
