# Audio assets

Every ambient sound in Sanctuary (rain, ocean, fire, forest, wind, space, storm, deep)
is **synthesized in real time** with the Web Audio API. The site ships no audio files
and has no licensing questions.

This folder is for **optional music tracks** listed in the Music section.

## Adding a track

1. Only add audio you are allowed to redistribute: your own work, public domain (CC0),
   or a license that permits redistribution (e.g. CC BY, with attribution).
2. Prefer `.mp3` (broadest support) or `.m4a`/`.ogg`, 96–160 kbps, loudness around −18 LUFS.
   Keep files small: every byte is served from GitHub Pages.
3. Put the file here, e.g. `public/audio/slow-tide.mp3`.
4. Register it in `src/services/audio/catalog.ts`:

```ts
export const MUSIC_TRACKS: readonly MusicTrack[] = [
  {
    id: 'slow-tide',
    title: 'Slow Tide',
    category: 'Deep Relaxation',
    src: 'audio/slow-tide.mp3', // relative: works under any GitHub Pages path
    credit: 'Your Name, CC BY 4.0',
  },
];
```

No copyrighted music. No streaming services. Nothing that can break when a third party changes.
