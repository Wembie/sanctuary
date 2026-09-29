# Changelog

All notable changes to Sanctuary are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Planned for v0.3 — Immersion

- Audio-reactive visualizer (blobs and waves, never an equalizer)
- Richer environment visuals (caustics, glass droplets, abstract trees)

### Planned for v0.4 — Experiences

- Calm Canvas, Floating Bubbles, Grow, Zen Garden

### Planned for v0.5 — Polish

- Time-aware palettes, easter eggs, offline caching (PWA service worker)

## [0.2.1] — 2026-09-29

### Added

- Author credit: "Made by Juan (Wembie)" in Settings, linked to GitHub, in all four languages;
  author metadata in `index.html`, `package.json` and the README.

## [0.2.0] — 2026-09-29

Languages and music.

### Added

- **Internationalization**: English, Español, Português and Français. The language is detected
  from the browser (`es-CO` → Español) and can be changed in Settings; the choice persists.
  Dictionaries are typed against English, so a missing translation fails the build. `<html lang>`
  and page titles follow the language.
- **Generative music**: seven original pieces (Slow Tide, Low Lantern, Clear Water, Stone Bell,
  Morning Moss, Aurora, Rain Tapes), one per category, composed live from recipes by a small
  engine: pads, bells, arpeggios, singing bowls, lo-fi keys with tape wobble, soft drums, and a
  generated reverb. One track at a time, crossfaded, with its own volume; the choice persists.
- **Automatic local tracks**: files dropped into `src/assets/music/<category>/` appear in the
  Music list with no code changes; an optional sidecar JSON sets title and credit.

- **Automatic releases**: the CI/CD pipeline tags and publishes a GitHub Release (notes from this
  changelog, built site attached) whenever a new version reaches `main`.
- The app version is shown in Settings.

### Changed

- The version lives in a single `VERSION` file; `package.json` no longer carries one. CI checks
  that `VERSION` is valid SemVer and has a matching changelog section.
- Music files moved from `public/audio/` to `src/assets/music/` (bundled and fingerprinted).
- Display text moved out of data modules (environments, sounds, techniques, routes) into the
  dictionaries in `src/i18n/`; data now carries only ids.

## [0.1.0] — 2026-09-29

The foundation: a complete, calm path from arrival to rest.

### Added

- **Arrival**: a breathing loader, a threshold with first-visit and returning-visitor lines, and a
  doorway that lets you enter with sound or in silence.
- **Home**: time-aware greeting, four needs (Calm, Focus, Sleep, Disconnect), "Or simply stay",
  "Continue your last space" and a deterministic daily pause.
- **Ambient engine**: one canvas, adaptive particle counts, pauses in hidden tabs, degrades itself
  on slow devices. CSS sky with aurora, mist, light rays and grain.
- **Six environments**: Night, Ocean, Forest, Rain, Fireplace, Clouds. Each with its own palette,
  particles and soundscape; colors crossfade through registered CSS properties.
- **Audio engine**: single `AudioContext`, eight procedurally synthesized sounds (rain, ocean, fire,
  forest, wind, space, storm, deep) with fades on every change, a soft limiter, and idle suspension.
- **Sound mixer** with per-sound volume, persisted locally; empty, elegant Music section.
- **Breathe**: Calm (4·4·6·2), Box (4·4·4·4), Deep (4·7·8) and Custom rhythms, an orb that fills
  with the breath, the whole particle field breathing along, optional timer.
- **Focus** (25/45/60/custom), **Sleep** (15/30/60/90/∞ with gradual dimming and a late audio fade),
  **Disconnect** (5/10/20/30) and **Do nothing** mode.
- Interface that fades when idle, custom cursor on fine pointers, touch-first mobile layout.
- Settings: sound, master volume, motion, performance mode, particles, auto-hide, fullscreen.
- Accessibility: semantic landmarks, keyboard navigation (arrow-key radio groups, Space to pause
  breathing, F fullscreen, M sound, Esc), visible focus, live regions, reduced-motion support.
- Hash routing for GitHub Pages, 404 fallback, SEO and Open Graph metadata, web manifest.
- Tests for breathing math, timers, sleep curve, storage, sanitizers, mix planning, themes, routes.
- GitHub Actions: lint, format, typecheck, test, build and deploy to GitHub Pages.
