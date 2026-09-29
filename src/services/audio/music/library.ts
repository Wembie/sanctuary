import { MUSIC_CATEGORIES, type MusicCategory } from '../catalog';
import type { Recipe } from './composer';
import { GENERATIVE_PIECES } from './recipes';

export type MusicTrack =
  | { kind: 'generative'; id: string; category: MusicCategory; recipe: Recipe }
  | {
      kind: 'file';
      id: string;
      category: MusicCategory;
      src: string;
      /** From the sidecar JSON, or derived from the file name. */
      title: string;
      credit: string | null;
    };

/** Folder name → category: src/assets/music/<slug>/track.mp3 */
export const CATEGORY_SLUGS: Record<string, MusicCategory> = {
  'deep-relaxation': 'Deep Relaxation',
  sleep: 'Sleep',
  focus: 'Focus',
  meditation: 'Meditation',
  nature: 'Nature',
  ambient: 'Ambient',
  'lo-fi': 'Lo-Fi',
};

const ROOT = '/src/assets/music/';
const MAX_TEXT = 120;

const cleanText = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, MAX_TEXT) : null;

/** "slow_tide-v2" → "Slow tide v2" */
export function titleFromFileName(name: string): string {
  const words = name
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : name;
}

/**
 * Turns the files Vite found under src/assets/music into tracks.
 * Pure: it takes the glob results, so it can be tested without a bundler.
 *
 * - The first folder picks the category (unknown or missing → Ambient).
 * - An optional `name.json` beside `name.mp3` may set `title` and `credit`.
 */
export function buildLocalTracks(
  files: Record<string, string>,
  sidecars: Record<string, unknown>,
): MusicTrack[] {
  const tracks: MusicTrack[] = [];
  for (const [path, src] of Object.entries(files)) {
    if (!path.startsWith(ROOT)) continue;
    const relative = path.slice(ROOT.length);
    const parts = relative.split('/');
    const fileName = parts[parts.length - 1] ?? relative;
    const folder = parts.length > 1 ? (parts[0] ?? '').toLowerCase() : '';
    const meta = sidecars[path.replace(/\.[^.]+$/, '.json')];
    const record =
      typeof meta === 'object' && meta !== null ? (meta as Record<string, unknown>) : {};
    tracks.push({
      kind: 'file',
      id: `file:${relative}`,
      category: CATEGORY_SLUGS[folder] ?? 'Ambient',
      src,
      title: cleanText(record.title) ?? titleFromFileName(fileName),
      credit: cleanText(record.credit),
    });
  }
  return tracks.sort(
    (a, b) =>
      MUSIC_CATEGORIES.indexOf(a.category) - MUSIC_CATEGORIES.indexOf(b.category) ||
      (a.kind === 'file' && b.kind === 'file' ? a.title.localeCompare(b.title) : 0),
  );
}

// Vite resolves these at build time. Adding a file to the folder is all it takes.
const files = import.meta.glob('/src/assets/music/**/*.{mp3,ogg,oga,m4a,aac,wav,opus,flac,webm}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const sidecars = import.meta.glob('/src/assets/music/**/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

export const LOCAL_TRACKS: readonly MusicTrack[] = buildLocalTracks(files, sidecars);

export const GENERATIVE_TRACKS: readonly MusicTrack[] = GENERATIVE_PIECES.map((piece) => ({
  kind: 'generative',
  ...piece,
}));

/** Grouped by category (stable sort: each live piece comes before your files of the same kind). */
export const ALL_TRACKS: readonly MusicTrack[] = [...GENERATIVE_TRACKS, ...LOCAL_TRACKS].sort(
  (a, b) => MUSIC_CATEGORIES.indexOf(a.category) - MUSIC_CATEGORIES.indexOf(b.category),
);

export const findTrack = (id: string | null): MusicTrack | null =>
  id === null ? null : (ALL_TRACKS.find((track) => track.id === id) ?? null);
