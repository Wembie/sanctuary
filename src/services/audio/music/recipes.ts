import type { MusicCategory } from '../catalog';
import type { Recipe } from './composer';

export interface GenerativePiece {
  id: string;
  category: MusicCategory;
  recipe: Recipe;
}

/**
 * Seven original pieces, one per category, composed live in the browser.
 * Titles and descriptions live in the dictionaries (src/i18n, `music.pieces`).
 */
export const GENERATIVE_PIECES: readonly GenerativePiece[] = [
  {
    id: 'slow-tide',
    category: 'Deep Relaxation',
    recipe: {
      root: 50, // D3
      chords: [
        [0, 7, 14, 16], //  D  A  E  F#   I add9
        [-3, 4, 7, 11], //  B  F# A  C#   vi7
        [-7, 5, 9, 12], //  G  G  B  D    IV
        [-5, 2, 9, 14], //  A  E  B  E    V sus
      ],
      chordSeconds: 16,
      reverb: 0.75,
      pad: { wave: 'triangle', cutoff: 1300, level: 0.14, detune: 7 },
      drone: { level: 0.035 },
      bells: { every: 7, level: 0.05, decay: 5, scale: 'pentatonicMajor', octave: 2 },
    },
  },
  {
    id: 'low-lantern',
    category: 'Sleep',
    recipe: {
      root: 45, // A2
      chords: [
        [0, 7, 14, 15], //  A  E  B  C    i add9
        [-4, 3, 7, 12], //  F  C  E  A    VImaj7
        [-9, 3, 7, 10], //  C  C  E  G    III
        [-2, 5, 10, 14], // G  D  G  B    VII
      ],
      chordSeconds: 24,
      reverb: 0.85,
      pad: { wave: 'sine', cutoff: 700, level: 0.09, detune: 5 },
      drone: { level: 0.03 },
      bells: { every: 22, level: 0.025, decay: 7, scale: 'pentatonicMinor', octave: 1 },
    },
  },
  {
    id: 'clear-water',
    category: 'Focus',
    recipe: {
      root: 48, // C3
      chords: [
        [0, 7, 11, 14], //  C  G  B  D    Cmaj9
        [-3, 4, 7, 11], //  A  E  G  B    Am9
        [5, 9, 12, 16], //  F  A  C  E    Fmaj7
        [7, 11, 14, 16], // G  B  D  E    G6
      ],
      chordSeconds: 12,
      reverb: 0.5,
      pad: { wave: 'triangle', cutoff: 1500, level: 0.2, detune: 6 },
      arp: { step: 0.75, level: 0.05, octave: 1 },
    },
  },
  {
    id: 'stone-bell',
    category: 'Meditation',
    recipe: {
      root: 52, // E3
      chords: [[-12, -5]],
      chordSeconds: 30,
      reverb: 0.8,
      pad: { wave: 'sine', cutoff: 500, level: 0.07, detune: 3 },
      drone: { level: 0.05 },
      bowl: { every: 16, level: 0.15, octave: 0 },
    },
  },
  {
    id: 'morning-moss',
    category: 'Nature',
    recipe: {
      root: 55, // G3
      chords: [
        [0, 4, 7, 14], //   G  B  D  A    I add9
        [2, 5, 9, 12], //   A  C  E  G    ii7
        [5, 9, 12, 16], //  C  E  G  B    IVmaj7
        [4, 7, 12, 16], //  B  D  G  B    I/3
      ],
      chordSeconds: 14,
      reverb: 0.6,
      pad: { wave: 'sine', cutoff: 2200, level: 0.16, detune: 6 },
      bells: { every: 3.5, level: 0.04, decay: 3.5, scale: 'pentatonicMajor', octave: 1 },
    },
  },
  {
    id: 'aurora',
    category: 'Ambient',
    recipe: {
      root: 53, // F3
      chords: [
        [0, 7, 11, 14], //  F  C  E  G    Fmaj9
        [2, 6, 9, 14], //   G  B  D  G    II (lydian)
        [-1, 6, 11, 14], // E  B  E  G
        [0, 4, 11, 19], //  F  A  E  C
      ],
      chordSeconds: 18,
      reverb: 0.9,
      pad: { wave: 'sawtooth', cutoff: 1000, level: 0.18, detune: 12 },
      bells: { every: 9, level: 0.045, decay: 6, scale: 'lydian', octave: 2 },
    },
  },
  {
    id: 'rain-tapes',
    category: 'Lo-Fi',
    recipe: {
      root: 53, // F3
      chords: [
        [2, 5, 9, 12, 16], //  G  Bb D  F  A   Gm9
        [-5, -1, 5, 9], //     C  E  Bb D      C9
        [0, 4, 11, 14], //     F  A  E  G      Fmaj9
        [-3, 0, 7, 11], //     D  F  C  E      Dm9
      ],
      // One bar of 4/4 at 72 bpm.
      chordSeconds: (60 / 72) * 4,
      reverb: 0.3,
      lofi: { bpm: 72, level: 0.48 },
    },
  },
];
