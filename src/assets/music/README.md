# Your music

Sanctuary already plays seven original pieces that are **composed live** in the browser
(`src/services/audio/music/`). This folder is for adding your own tracks on top of them.

## Adding a track: drop the file here

No code changes. Put the file in the folder of its category and rebuild:

```
src/assets/music/
├── deep-relaxation/
├── sleep/
├── focus/
├── meditation/
├── nature/
├── ambient/        ← also used for files placed directly in music/ or in unknown folders
└── lo-fi/
```

For example, `src/assets/music/sleep/night-swim.mp3` shows up under **Sleep** as "Night swim".

Supported: `.mp3` `.m4a` `.aac` `.ogg` `.oga` `.opus` `.webm` `.wav` `.flac`.
Prefer `.mp3` or `.m4a` (plays everywhere, including Safari/iOS).

### Optional: title and credit

Add a JSON file with the same name beside the track:

```json
// src/assets/music/sleep/night-swim.json
{ "title": "Night Swim", "credit": "Your Name, CC BY 4.0" }
```

Without it, the title comes from the file name (`night_swim-v2` → "Night swim v2").

## Rules

1. **Only audio you may redistribute**: your own work, public domain (CC0), or a license that
   allows redistribution (CC BY, with the credit in the JSON). No copyrighted music.
2. **Keep files small**: every byte is served from GitHub Pages (100 MB per file max, 1 GB site).
   96–160 kbps and a few minutes long is plenty; tracks loop seamlessly if they're cut cleanly.
3. **Quiet mastering**: aim for around −18 LUFS so tracks sit next to the live pieces
   without jumping in volume.

Files are fingerprinted and bundled at build time (Vite `import.meta.glob`), so they work under
any GitHub Pages path and are cached safely.
