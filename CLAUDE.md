# CLAUDE.md

Guidance for working on **Sanctuary**, an immersive relaxation web app ("A quiet place for a noisy
world"). React 19 + TypeScript (strict) + Vite, fully client-side, deployed to GitHub Pages.
Author: Juan (@Wembie). Live: https://wembie.github.io/sanctuary/

**The product rule above all:** someone arrives stressed and five minutes later feels different.
Less UI, more experience. Nothing moves fast, nothing is loud, nothing is abrupt. If a change makes
the app busier, faster or noisier, simplify it.

## Commands

```bash
npm run dev             # dev server (http://localhost:5173)
npm run build           # tsc --noEmit + vite build → dist/
npm run preview         # serve dist/ (http://localhost:4173)
npm run lint            # eslint (typescript-eslint strict + react-hooks)
npm run typecheck       # tsc --noEmit
npm test                # vitest run (jsdom)
npm run format          # prettier --write .
npm run version:check   # VERSION is SemVer + CHANGELOG has its section
```

Before any commit, all of these must pass: `version:check`, `lint`, `format:check`, `typecheck`,
`test`, `build`. That is exactly what CI runs.

## Architecture

```
src/
  app/          App shell, routes.ts (hash routes), navigation.ts, pages.ts (lazy pages),
                actions.ts (setSoundEnabled, selectEnvironment), credits.ts (author), useAppEffects.ts
  components/   ambient/ (background + canvas), audio/ (SoundMixer, MusicPlayer), breathing/,
                cursor/, experiences/ (Stillness), intro/ (Loader, Threshold), navigation/,
                session/ (DurationPicker, ProgressRing, SessionControls), settings/, ui/
  hooks/        useStore, useHashRoute, useIdle, useSession, useAnimationFrame, usePreferences, useScene
  i18n/         en.ts (source, defines Messages), es.ts, pt.ts, fr.ts, index.ts (useT, detection)
  lib/          Pure logic: breathing, timer, sleep, daily, random, time, storage, store, device
    ambient/    AmbientEngine: the canvas particle system
  pages/        One lazy chunk per route
  services/audio/
                AudioManager.ts (single AudioContext), generators.ts (8 ambient sounds),
                synthesis.ts (VoiceGraph, noise), mix.ts (planMix), catalog.ts
    music/      composer.ts (generative engine), recipes.ts (7 pieces), instruments.ts,
                theory.ts, library.ts (all tracks + local file discovery), fileVoice.ts
  store/        settings, mix, experience, music (persisted), scene (in-memory + sceneSignals)
  styles/       tokens.css (design tokens, @property colors), global.css
  themes/       environments.ts (6 places: palette, particles, soundscape)
  assets/music/ User-supplied audio files, auto-discovered
scripts/version.mjs   VERSION helper used by CI
VERSION               Single source of truth for the version
```

Key mechanics:

- **State**: tiny stores (`lib/store.ts`) read with `useStore(store, selector)`. Persisted stores
  live in `localStorage` under `sanctuary:v1:<key>` and **always** go through a `sanitize`
  function (stored data is never trusted). Per-frame values (breath fullness) go in the
  mutable `sceneSignals`, never in React state.
- **Routing**: hash routes (`#/breathe`) because GitHub Pages has no SPA fallback. Vite
  `base: './'`. Use `<Link to>` or `navigateTo()`; route names map to i18n via `ROUTE_NAME`.
- **Audio**: one `AudioContext`, created only inside a user gesture (`audio.unlock()` via
  `setSoundEnabled`). `useAudioSync` reconciles stores → `audio.sync(mix)` and
  `audio.playMusic(track, volume)`. Every voice is a `VoiceGraph` (or `{ dispose() }`) and fades in
  and out; never start or stop sound abruptly. Failures must degrade to silence, never throw.
- **Visuals**: `AmbientBackground` = CSS sky layers + one canvas driven by `AmbientEngine`
  (one rAF loop, sprites, adaptive quality, pauses when hidden, static frame with reduced motion).

## Conventions

- **No hardcoded user-facing text.** Every string goes in `src/i18n/en.ts` **and** `es.ts`,
  `pt.ts`, `fr.ts` (the `Messages` type makes a missing key fail `tsc`). Use `const t = useT()`.
  Strings that depend on values are functions in the dictionary. Use gender-neutral phrasing
  in es/pt/fr ("Qué bueno verte de nuevo", not "Bienvenido"). Data modules hold ids only.
- **Styling**: CSS Modules per component + tokens from `styles/tokens.css`. Never hardcode
  colors that belong to the theme; use `var(--accent)`, `rgb(var(--glow-rgb) / 0.5)`, etc.
  Glassmorphism only on controls/overlays (`.glass`). Things that should fade when idle get
  the global `chrome` class.
- **Motion**: slow durations (`--dur-*` tokens), `--ease-calm`/`--ease-soft-out`, no bounce.
  Always handle `:root[data-motion='reduced']`. Entrance animations use `animation-fill-mode:
backwards` (not `both`), or they will override later opacity fades.
- **Accessibility**: semantic elements, labels on every control, keyboard support (radio groups
  use arrow keys), visible focus, `aria-live="polite"` for changing text. Touch targets ≥ 40px.
- **TypeScript**: strict, `noUncheckedIndexedAccess`, no non-null assertions (`!`, lint error),
  `import type` for types. React hooks lint forbids synchronous `setState` in effect bodies
  (use a timer/callback or derive the value).
- **Comments** explain _why_, briefly. Match the surrounding code style.
- **Dependencies**: runtime deps are only react, react-dom and the font. Don't add libraries
  (router, state, animation, UI kits, i18n) without a strong reason.
- **Tests** cover logic (lib, stores/sanitizers, audio planning, music library, i18n shape).
  Don't write tests for purely visual components. Test files: `src/**/*.test.ts`.

## How to…

**Add a user-facing string**: add the key to `en.ts`, then to `es.ts`, `pt.ts`, `fr.ts`; read it
with `useT()`. `npm run typecheck` tells you if a locale is missing it.

**Add a language**: copy `i18n/en.ts` → `xx.ts` typed `export const xx: Messages = {…}`, translate;
add `xx` to `LOCALES`, `LOCALE_NAMES`, `MESSAGES` in `i18n/index.ts` and to `LANGUAGE_OPTIONS` in
`store/settings.ts` (a test checks they match).

**Add an ambient sound**: add the id to `SOUND_IDS` in `services/audio/catalog.ts`, write a
`SoundFactory` in `generators.ts` (build with `VoiceGraph`; one-shots via `g.schedule` /
`noiseBurst`), add an icon path in `components/ui/Icon.tsx`, add `sounds.items.<id>` in all four
dictionaries. Aim for ~0.08 RMS (measure by rendering in an `OfflineAudioContext`).

**Add an environment**: add the id to `ENVIRONMENT_IDS` and an entry in `themes/environments.ts`
(palette hex colors, particle kind/density, aurora, soundscape), plus `explore.places.<id>` in all
dictionaries. New particle behaviour goes in `lib/ambient/engine.ts` (`create`, `update`, draw).

**Add a generative music piece**: add a `GenerativePiece` to `services/audio/music/recipes.ts`
(root MIDI note, chords as semitone offsets, chordSeconds, reverb, and instruments: pad, drone,
bells, arp, bowl, lofi), then `sounds.pieces.<id>` (title + description) in all four
dictionaries. Keep notes between MIDI 28 and 84 (a test enforces it) and loudness ~0.08 RMS.

**Add a music file (no code)**: put it in `src/assets/music/<category>/` where category is one of
`deep-relaxation`, `sleep`, `focus`, `meditation`, `nature`, `ambient`, `lo-fi`. Optional sidecar
`<name>.json` with `{ "title", "credit" }`. Only redistributable audio (own work, CC0, CC BY).
Details: `src/assets/music/README.md`.

**Add a page/route**: add the path to `ROUTE_PATHS` and `ROUTE_NAME` in `app/routes.ts`, a lazy
loader in `app/pages.ts`, the page in `pages/`, `routes.<name>` in the dictionaries, and (if it
belongs in the nav) an item in `FloatingNavigation.tsx`. Immersive pages call `useImmersive(true)`.

**Change the author credit**: `src/app/credits.ts` (app), plus `index.html` meta, `package.json`
`author`, README "Author".

## Versioning and releases

- `VERSION` (one line, SemVer) is the **only** version. `package.json` intentionally has no
  `version` field; the app gets it via Vite `define` as `__APP_VERSION__` (shown in Settings).
- To release: bump `VERSION`, add `## [x.y.z] — YYYY-MM-DD` to `CHANGELOG.md` (Keep a Changelog
  format; move items from **Unreleased**), open a PR, merge to `main`.
- `.github/workflows/ci.yml` on push to `main`: **verify → deploy (Pages) → release**. The release
  job creates the `vX.Y.Z` tag on the merge commit and publishes the GitHub Release with the
  changelog section as notes plus `sanctuary-vX.Y.Z.zip`. **Never create version tags or releases
  by hand**; CI does it. A release that already exists is skipped, so docs-only merges without a
  version bump are safe.
- Patch = fixes/small additions (0.2.0 → 0.2.1), minor = features (0.2 → 0.3). `1.0.0` when the
  product is stable and complete.

## Git workflow

- Never commit directly to `main`. Branch from an up-to-date `main`: `release/vX.Y.Z` for a
  version, or `feat/…`, `fix/…`, `docs/…`, `perf/…`, `a11y/…`. Push, then the user opens and
  merges the PR (the GitHub CLI `gh` is **not** installed here; give the compare URL
  `https://github.com/Wembie/sanctuary/compare/main...<branch>?expand=1`).
- Conventional Commits: `feat:`, `fix:`, `perf:`, `a11y:`, `docs:`, `ci:`, `chore:`, `release:`.
- **Do not add `Co-Authored-By` trailers or any AI attribution** to commits or PRs.
- Don't push or open PRs unless asked.

## Gotchas (learned the hard way)

- A `filter` or `transform` on an ancestor makes it the containing block for `position: fixed`
  children. Transitional wrappers (`main`, `.view`) are therefore fixed full-viewport boxes.
- Browsers block audio without a gesture: only `setSoundEnabled(true)` (called from a click/key
  handler) may unlock audio. Tapping a sound or a music track enables sound for the user.
- Headless Chrome with `--use-gl=swiftshader` renders the canvas empty in screenshots; don't use
  that flag when verifying visuals. `backdrop-filter` doesn't show in headless screenshots either.
- On this Windows machine: bash heredocs containing backticks break the Bash tool; write
  scripts to a file instead. Python in text mode writes CRLF; `.gitattributes` normalizes to LF,
  but prefer `newline='\n'` when writing files.
- `import.meta.glob` for music is evaluated at build time: new files need a rebuild.
- `OfflineAudioContext` renders faster than the composer's timers; when measuring generative
  music offline, step the render with `ctx.suspend(t)` and resume after ~450 ms.

## Verifying changes

For UI or audio changes, don't stop at "build passes": run `npm run build && npm run preview` and
check in a browser (desktop 1440×900 and mobile 390×844), including reduced motion, keyboard
navigation, and no console errors. Say plainly what was and wasn't verified (e.g., audio not
listened to by ear).
