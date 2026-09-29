import { describe, expect, it } from 'vitest';
import { MUSIC_CATEGORIES } from '../catalog';
import { DEFAULT_MUSIC, sanitizeMusic } from '../../../store/music';
import { buildLocalTracks, findTrack, GENERATIVE_TRACKS, titleFromFileName } from './library';
import { GENERATIVE_PIECES } from './recipes';
import { midiToHz, scaleNotes } from './theory';

describe('theory', () => {
  it('converts MIDI to Hz', () => {
    expect(midiToHz(69)).toBe(440);
    expect(midiToHz(57)).toBeCloseTo(220);
    expect(midiToHz(60)).toBeCloseTo(261.63, 1);
  });

  it('builds scales across octaves', () => {
    expect(scaleNotes(60, 'pentatonicMajor')).toEqual([60, 62, 64, 67, 69]);
    expect(scaleNotes(57, 'minor', 2)).toHaveLength(14);
  });
});

describe('generative pieces', () => {
  it('cover every category, once', () => {
    expect(GENERATIVE_PIECES.map((p) => p.category).sort()).toEqual([...MUSIC_CATEGORIES].sort());
  });

  it('have unique ids', () => {
    const ids = GENERATIVE_PIECES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(GENERATIVE_PIECES.map((p) => [p.id, p.recipe] as const))(
    '%s stays in a gentle, audible range',
    (_id, recipe) => {
      expect(recipe.chords.length).toBeGreaterThan(0);
      expect(recipe.chordSeconds).toBeGreaterThanOrEqual(3);
      expect(recipe.reverb).toBeGreaterThanOrEqual(0);
      expect(recipe.reverb).toBeLessThanOrEqual(1);
      for (const chord of recipe.chords) {
        expect(chord.length).toBeGreaterThan(0);
        for (const offset of chord) {
          const midi = recipe.root + offset;
          // Roughly E1 – C6: nothing rumbling below hearing, nothing piercing.
          expect(midi).toBeGreaterThanOrEqual(28);
          expect(midi).toBeLessThanOrEqual(84);
        }
      }
      // Something has to make sound.
      expect(recipe.pad ?? recipe.lofi ?? recipe.bowl ?? recipe.bells).toBeTruthy();
    },
  );
});

describe('local tracks', () => {
  const url = (name: string) => `/assets/${name}-hash.mp3`;

  it('derives category from the folder and title from the file name', () => {
    const [track] = buildLocalTracks(
      { '/src/assets/music/sleep/night_swim-v2.mp3': url('night') },
      {},
    );
    expect(track).toMatchObject({
      kind: 'file',
      id: 'file:sleep/night_swim-v2.mp3',
      category: 'Sleep',
      title: 'Night swim v2',
      credit: null,
      src: url('night'),
    });
  });

  it('reads title and credit from a sidecar JSON', () => {
    const [track] = buildLocalTracks(
      { '/src/assets/music/lo-fi/tape.ogg': url('tape') },
      { '/src/assets/music/lo-fi/tape.json': { title: '  Tape Loop ', credit: 'Me, CC0' } },
    );
    expect(track).toMatchObject({ category: 'Lo-Fi', title: 'Tape Loop', credit: 'Me, CC0' });
  });

  it('falls back to Ambient for loose files and unknown folders', () => {
    const tracks = buildLocalTracks(
      {
        '/src/assets/music/loose.mp3': url('a'),
        '/src/assets/music/whatever/b.mp3': url('b'),
      },
      {},
    );
    expect(tracks.map((t) => t.category)).toEqual(['Ambient', 'Ambient']);
  });

  it('ignores bad sidecar values and caps their length', () => {
    const [track] = buildLocalTracks(
      { '/src/assets/music/focus/x.mp3': url('x') },
      { '/src/assets/music/focus/x.json': { title: 42, credit: 'y'.repeat(500) } },
    );
    expect(track?.kind === 'file' && track.title).toBe('X');
    expect(track?.kind === 'file' && track.credit?.length).toBe(120);
  });

  it('sorts by category order, then title', () => {
    const tracks = buildLocalTracks(
      {
        '/src/assets/music/lo-fi/a.mp3': url('1'),
        '/src/assets/music/sleep/zeta.mp3': url('2'),
        '/src/assets/music/sleep/alpha.mp3': url('3'),
      },
      {},
    );
    expect(tracks.map((t) => (t.kind === 'file' ? t.title : ''))).toEqual(['Alpha', 'Zeta', 'A']);
  });

  it('prettifies file names', () => {
    expect(titleFromFileName('deep___blue--sea.flac')).toBe('Deep blue sea');
  });
});

describe('music state', () => {
  it('finds tracks by id and tolerates unknown ones', () => {
    const first = GENERATIVE_TRACKS[0];
    expect(findTrack(first?.id ?? '')).toBe(first);
    expect(findTrack('nope')).toBeNull();
    expect(findTrack(null)).toBeNull();
  });

  it('sanitizes stored music settings', () => {
    expect(sanitizeMusic({ trackId: 7, volume: 9 }, DEFAULT_MUSIC)).toEqual({
      trackId: null,
      volume: 1,
    });
    expect(sanitizeMusic({ trackId: 'aurora' }, DEFAULT_MUSIC).trackId).toBe('aurora');
  });
});
