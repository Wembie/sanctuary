# Sanctuary

> A quiet place for a noisy world.

Sanctuary is an immersive, fully client-side space for breathing, listening, focusing and
sleeping. It is not a dashboard or a productivity tool. It is a small digital place you can
step into for a few minutes, after a long day, with headphones on and the lights off.

**Live:** https://wembie.github.io/sanctuary/

The one metric that matters: _does someone arrive stressed and, five minutes later, feel different?_
Every decision in this repository (design, motion, sound, code) is measured against that.

---

## What's inside

| Space          | What it does                                                                                    |
| -------------- | ----------------------------------------------------------------------------------------------- |
| **Threshold**  | A few quiet lines, then a doorway. Enter with sound or in silence.                              |
| **Home**       | A greeting for the time of day, four needs, "Or simply stay", and a daily pause.                |
| **Breathe**    | An orb that fills with your breath. Calm (4·4·6·2), Box (4·4·4·4), Deep (4·7·8), Custom.        |
| **Sounds**     | Eight synthesized soundscapes you can layer, plus seven pieces of music composed live.          |
| **Focus**      | 25 / 45 / 60 / custom minutes. A hairline ring, a soft tone, and "You did enough."              |
| **Sleep**      | The screen dims gradually; the sound follows only at the end. 15 / 30 / 60 / 90 / ∞.            |
| **Disconnect** | "Put your phone down." Then nothing but the place, until "Welcome back."                        |
| **Explore**    | Six places: Night, Ocean, Forest, Rain, Fireplace, Clouds. Sky, particles and sound all follow. |
| **Stillness**  | "You don't have to do anything." Then every piece of interface leaves.                          |

Touch the empty sky anywhere and it answers with a slow ring. Now and then, at night, a shooting star.

## Design principles

- **Less UI, more experience.** Controls appear when you need them and fade when you're still.
- **Nothing here is urgent.** Every motion is slow; every sound fades in and out; no alarms.
- **Never blank, never broken.** No audio? It stays silent. No canvas? The CSS sky remains.
  No storage? Preferences just don't persist. No technical error ever reaches the screen.
- **No accounts, no tracking, no backend.** Preferences live in `localStorage` on the device.

## Stack

| Choice                    | Why                                                                                      |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| **React 19 + TypeScript** | Strict types, composition, lazy-loaded pages. Nothing heavier needed.                    |
| **Vite**                  | Fast builds, CSS modules, code splitting, relative `base` for GitHub Pages.              |
| **Canvas 2D**             | One canvas, a few hundred particles, pre-rendered glow sprites. No WebGL dependency.     |
| **Web Audio API**         | Every sound is synthesized live from noise and oscillators: no audio files, no licenses. |
| **CSS custom properties** | Themes as tokens; `@property`-registered colors crossfade between environments.          |
| **Vitest + jsdom**        | Tests for the logic that matters.                                                        |
| **Manrope (self-hosted)** | Via `@fontsource-variable`. No third-party font requests.                                |

There is no router library, no state library, no animation library and no UI kit. Runtime
dependencies: `react`, `react-dom`, and a font.

## Architecture

```
src/
├── app/                 App shell, routes, navigation, page registry, cross-cutting actions
├── components/
│   ├── ambient/         AmbientBackground: CSS sky + particle canvas
│   ├── audio/           SoundMixer
│   ├── breathing/       BreathingOrb, PatternEditor
│   ├── cursor/          CalmCursor
│   ├── experiences/     Stillness ("do nothing" mode)
│   ├── intro/           Loader, Threshold
│   ├── navigation/      FloatingNavigation, Link
│   ├── session/         DurationPicker, ProgressRing, SessionControls
│   ├── settings/        SettingsPanel
│   └── ui/              Icon, Slider, Switch, Segmented, Modal, FadeText
├── hooks/               useStore, useHashRoute, useIdle, useSession, useAnimationFrame, …
├── i18n/                Typed dictionaries (en, es, pt, fr), detection, useT()
├── lib/                 Pure logic: breathing, timer, sleep curve, random, storage, store
│   └── ambient/         AmbientEngine (canvas particle system)
├── pages/               One lazy-loaded chunk per route
├── services/audio/      AudioManager, synthesis primitives, generators, catalog, mix planning
├── store/               settings, mix, experience (persisted); scene (in-memory)
├── styles/              tokens.css (design system), global.css
└── themes/              Environments: palettes, particle presets, soundscapes
```

**Languages.** English, Español, Português, Français. No i18n library: each locale is a plain
object typed as `Messages` (the shape of `src/i18n/en.ts`), so a missing or extra key fails
`tsc`. Strings whose grammar depends on values are small functions. `useT()` returns the current
dictionary; the language comes from Settings or, on "Auto", from `navigator.languages`.

To add a language: copy `src/i18n/en.ts` to `xx.ts`, type it `export const xx: Messages = {…}`,
translate, then add `xx` to `LOCALES`/`LOCALE_NAMES` in `src/i18n/index.ts` and to
`LANGUAGE_OPTIONS` in `src/store/settings.ts` (a test checks they match). Prefer gender-neutral
phrasing: the visitor could be anyone.

**State.** Four tiny stores built on `useSyncExternalStore`: `settings`, `mix` and `experience`
persist to `localStorage` (namespaced, sanitized on load: stored data is never trusted);
`scene` is in-memory (intensity, immersive mode, stillness). Per-frame values like breath
fullness live in a plain mutable object (`sceneSignals`) so they never trigger renders.

**Audio.** `AudioManager` owns a single `AudioContext`, created inside the first user gesture.
`sync(mix)` diffs what's playing against what's wanted (`planMix`, pure and tested) and fades
every change. Each voice is a `VoiceGraph` that tracks its nodes, sources and timers so it can be
torn down completely. One-shot events (raindrops, crackles, birds, thunder) are scheduled ahead on
the audio clock so background-tab timer throttling never causes gaps. The context suspends itself
after 20 s of silence to save battery.

**Visuals.** `AmbientEngine` runs one `requestAnimationFrame` loop, sizes the particle count to the
screen, caps DPR, crossfades between environments, reacts to pointer and taps, and breathes with
`sceneSignals.breath`. It measures its own frame times and quietly drops to a lighter mode if the
device struggles. With reduced motion it draws a single still frame.

**Routing.** Hash routes (`#/breathe`) so every URL works on GitHub Pages with no server rules.
`public/404.html` redirects path-style URLs (`/sanctuary/breathe`) to their hash equivalent.

## Development

Requires Node 20+ (see `.nvmrc`).

```bash
npm install
npm run dev          # http://localhost:5173
```

| Script              | Does                                           |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Dev server with HMR                            |
| `npm run build`     | Typecheck, then production build → `dist/`     |
| `npm run preview`   | Serve the production build locally             |
| `npm run lint`      | ESLint (typescript-eslint strict, react-hooks) |
| `npm run typecheck` | `tsc --noEmit`                                 |
| `npm test`          | Vitest, once                                   |
| `npm run format`    | Prettier                                       |

## Testing

Tests cover logic where bugs would actually hurt: breathing phase math and easing, the pausable
stopwatch and clock formatting, the sleep dimming curve, storage failure modes, store persistence
and sanitizers, mix diffing, perceptual volume, theme tokens and route parsing. Purely visual
components are verified by hand, in a browser, on real devices.

```bash
npm test
```

## CI/CD, deployment and releases

One pipeline, `.github/workflows/ci.yml`:

| Trigger        | Jobs                                                                           |
| -------------- | ------------------------------------------------------------------------------ |
| Pull request   | **verify**: version check → install → lint → format → typecheck → test → build |
| Push to `main` | **verify** → **deploy** (GitHub Pages) → **release** (tag + GitHub Release)    |

### Versioning: the `VERSION` file

`VERSION` (one line, SemVer) is the single source of truth. The app reads it at build time
(shown in Settings), CI validates it, and the release job uses it. `package.json` deliberately
has no `version` field, so there is nothing to keep in sync.

To release:

1. Change `VERSION`, e.g. `0.3.0`.
2. Add a `## [0.3.0] — YYYY-MM-DD` section to `CHANGELOG.md` (CI fails if it's missing).
3. Merge to `main`.

The pipeline then creates the `v0.3.0` tag, publishes the GitHub Release with that changelog
section as notes, and attaches `sanctuary-v0.3.0.zip` (the built site). Nothing is tagged or
released by hand. Check locally with `npm run version:check`.

One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions.**

The build uses a relative `base` (`./`), so it works under `/<repo>/`, at a custom domain, or from
any static file server without changes.

## Music and audio assets

The repository contains no audio files. Everything you hear is made in the browser:

- **Ambient sounds**: eight noise-and-oscillator generators (`src/services/audio/generators.ts`).
- **Music**: seven original pieces, one per category, composed live by a small generative
  engine (`src/services/audio/music/`). A `Recipe` describes a piece (root, chord progression,
  tempo, instruments: pads, bells, arpeggio, singing bowl, lo-fi keys and drums, reverb); the
  composer schedules it ahead on the audio clock forever, never quite the same way twice.
  Only one piece plays at a time; changing tracks crossfades.

**Your own tracks**: drop a file into `src/assets/music/<category>/` (e.g. `sleep/night-swim.mp3`)
and rebuild. It's discovered automatically with `import.meta.glob`; an optional `night-swim.json`
beside it sets the title and credit. Only add audio you may redistribute. See
[`src/assets/music/README.md`](src/assets/music/README.md).

## Accessibility

- Semantic landmarks, one `h1` per view, labelled controls, native `<dialog>` for settings.
- Full keyboard support: arrow keys in radio groups, `Space` pauses breathing, `F` fullscreen,
  `M` sound on/off, `Esc` leaves stillness or closes settings. Visible focus everywhere.
- Live regions announce breathing phases and changing lines, politely.
- `prefers-reduced-motion` (or the in-app Motion setting) stops particles and drifting layers,
  shortens transitions and reduces the orb's movement; everything keeps working.
- Text contrast is kept high on every environment; state is never conveyed by color alone.

## Performance

- One canvas, one loop, sprite-based glows, batched rain strokes, DPR capped at 2 (1 in light mode).
- Particle count scales with screen area; light mode halves it and renders at ~30 fps.
- Runtime self-check drops to light mode after sustained slow frames.
- Animation pauses with the tab; the cursor loop stops when the mouse rests.
- Pages are separate chunks; the first one preloads during the loader.
- Aurora and mist are GPU-composited transforms of gradients: no `filter: blur` on large layers.

## Browser support

Current Chrome, Edge, Firefox, Safari, iOS Safari and Chrome Android. Missing features degrade:
no `backdrop-filter` → opaque glass; no Screen Wake Lock → the screen may sleep during a session; no Web Audio → silent; no Fullscreen API → option hidden;
no `@property` → colors switch instead of crossfading.

## Contributing

1. Fork, then create a branch: `feat/…`, `fix/…`, `perf/…`, `a11y/…`, `docs/…`.
2. Keep `npm run lint && npm run typecheck && npm test && npm run build` green.
3. Use [Conventional Commits](https://www.conventionalcommits.org/): `feat: add zen garden`,
   `perf: batch ember rendering`, `a11y: label duration picker`.
4. Before opening a PR, ask of your change: _is anything here faster, louder or busier than it
   needs to be?_ If so, slow it down.
5. Update `CHANGELOG.md` under **Unreleased**. Maintainers cut a release by bumping `VERSION`
   (see [CI/CD, deployment and releases](#cicd-deployment-and-releases)).

Versioning follows [SemVer](https://semver.org/). `0.x` while the experience takes shape; `1.0.0`
when it is stable, polished and complete.

## Author

Created and developed by **Juan** ([@Wembie](https://github.com/Wembie)).

## License

[MIT](LICENSE)
