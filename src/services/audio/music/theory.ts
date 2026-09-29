/** MIDI note number → frequency in Hz (A4 = 69 = 440 Hz). */
export const midiToHz = (midi: number): number => 440 * 2 ** ((midi - 69) / 12);

/** Scales as semitone offsets from the root. */
export const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  pentatonicMajor: [0, 2, 4, 7, 9],
  pentatonicMinor: [0, 3, 5, 7, 10],
} as const satisfies Record<string, readonly number[]>;

export type ScaleName = keyof typeof SCALES;

/**
 * Notes of a scale across `octaves` octaves, starting at `root`.
 * `pentatonicMajor` from C4 over one octave → [60, 62, 64, 67, 69].
 */
export function scaleNotes(root: number, scale: ScaleName, octaves = 1): number[] {
  const steps = SCALES[scale];
  const notes: number[] = [];
  for (let octave = 0; octave < octaves; octave++) {
    for (const step of steps) notes.push(root + octave * 12 + step);
  }
  return notes;
}
