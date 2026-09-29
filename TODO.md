# TODO

The roadmap, in the order we plan to build it. Tick an item (`- [x]`) in the same PR that
ships it, and move it to the matching `CHANGELOG.md` section when its version is released.

Guiding rule: every item must make the app calmer or more useful at night on a phone.
If it adds pressure (streaks, stats, notifications), it doesn't belong here.

## v0.3.0 — Night-ready on mobile

- [x] **Wake Lock**: keep the screen on during Breathe and Focus (release on pause/leave; graceful when unsupported)
- [ ] **Media Session**: lock-screen title and play/pause for music; audio keeps playing in the background
- [x] **PWA offline**: service worker caching the app shell and assets; installable; PNG icons (192/512, maskable)
- [x] **Sessions survive navigation**: a running Focus/Disconnect/Sleep timer keeps going when you change pages
- [x] **Music sleep timer**: fade the music out after 15 / 30 / 60 min without entering Sleep mode
- [x] **Fix sticky hover on touch**: wrap hover styles in `@media (hover: hover)`

## v0.4.0 — Experiences

- [ ] **Zen Garden**: sand that follows the finger, stones to place, a rake, a slow "clear"
- [ ] **Calm Canvas**: glowing strokes that blur and fade on their own; animated clear
- [ ] **Floating Bubbles**: bubbles that drift and pop softly on touch; no score
- [ ] **Grow**: hold to grow an abstract plant; it stops when you let go
- [ ] **Explore → experiences**: a place to reach these from Explore without cluttering navigation

## v0.5.0 — Immersion

- [ ] **Audio-reactive visualizer**: slow blobs and waves driven by the analyser (never an equalizer)
- [ ] **Ocean**: caustic light patterns
- [ ] **Rain**: drops sliding down window glass over the bokeh
- [ ] **Forest**: abstract tree silhouettes in the mist
- [ ] **Fireplace**: a soft flame shape under the embers
- [ ] **Time-aware palettes**: morning / afternoon / evening / night tints with slow transitions

## v0.6.0 — Gentle guidance

- [ ] **Breathing cues**: optional soft tones on inhale/exhale
- [ ] **Haptics**: optional, very light vibration on phase changes (mobile)
- [ ] **More generative pieces**: at least two per category

## v0.7.0 — Polish

- [ ] **Easter eggs**: a special star, seven taps, long-press on the logo; discoveries, never a game
- [ ] **Open Graph image** for shared links
- [ ] **Verify glass effects** (`backdrop-filter`) on real Safari/iOS and Android devices

## Quality and infrastructure (anytime)

- [ ] **E2E tests with Playwright in CI**: arrival, navigation, breathe, sounds, settings, reduced motion
- [ ] **Lighthouse CI**: performance and accessibility budgets on every PR
- [ ] **Dependabot** for npm and GitHub Actions

## Ideas (after 1.0, optional)

- [ ] **Smart lights**: dim real lights with the Sleep fade via the user's own Home Assistant
      (URL + token entered locally). Browsers block direct Hue bridge access from HTTPS pages,
      so this only works for people who already run Home Assistant.

## v1.0.0

- [ ] Everything above polished, tested on real devices, documented; then release `1.0.0`
