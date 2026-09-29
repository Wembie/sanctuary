/**
 * English: the source dictionary. Every other locale must match its shape
 * exactly (enforced by the `Messages` type), so a missing string fails the build.
 * Functions are used wherever grammar depends on values.
 */
export const en = {
  common: {
    close: 'Close',
    settings: 'Settings',
    skipToContent: 'Skip to content',
    begin: 'Begin',
    end: 'End',
    pause: 'Pause',
    resume: 'Resume',
    returnLabel: 'Return',
    takeYourTime: 'Take your time.',
    custom: 'Custom',
    minutes: 'minutes',
    minutesShort: (n: number) => `${n} min`,
    noEnd: 'No end',
    percent: (n: number) => `${n} percent`,
  },

  routes: {
    home: 'Home',
    breathe: 'Breathe',
    sounds: 'Sounds',
    focus: 'Focus',
    sleep: 'Sleep',
    explore: 'Explore',
    disconnect: 'Disconnect',
    homeTitle: 'Sanctuary: A quiet place for a noisy world',
    pageTitle: (page: string) => `${page} · Sanctuary`,
  },

  greeting: {
    morning: 'Good morning.',
    afternoon: 'Good afternoon.',
    evening: 'Good evening.',
    night: 'Good evening.',
  },

  loader: {
    preparing: 'preparing your space…',
  },

  threshold: {
    firstVisit: [
      'Take a breath.',
      'You’re safe here.',
      'This place is yours.',
      'There are no goals here.',
      'Take what you need.',
    ],
    returning: ['Welcome back.', 'Take a breath.', 'You’re safe here.'],
    enter: 'Enter Sanctuary',
    hint: 'with sound · headphones recommended',
    silent: 'or enter in silence',
  },

  home: {
    question: 'What do you need right now?',
    needs: {
      calm: { label: 'Calm', hint: 'Breathe slowly' },
      focus: { label: 'Focus', hint: 'Work without pressure' },
      sleep: { label: 'Sleep', hint: 'Let the screen fade to dark' },
      disconnect: { label: 'Disconnect', hint: 'Be away for a while' },
    },
    stay: 'Or simply stay.',
    continueLast: (place: string) => `Continue your last space · ${place}`,
    dailyPause: (p: { minutes: number; technique: string; place: string }) =>
      `Today’s pause · ${p.minutes} min · ${p.technique} breathing, ${p.place.toLowerCase()}`,
  },

  breathe: {
    heading: 'Breathe',
    techniqueLabel: 'Breathing technique',
    techniques: {
      calm: { label: 'Calm', description: 'A longer exhale to slow everything down.' },
      box: { label: 'Box', description: 'Four even sides. Steady and grounding.' },
      deep: { label: 'Deep', description: 'Four, seven, eight. For the end of a long day.' },
      custom: { label: 'Custom', description: 'Your own rhythm.' },
    },
    phases: { inhale: 'Inhale', hold: 'Hold', exhale: 'Exhale', rest: 'Rest' },
    paused: 'Paused',
    settle: 'Get comfortable.',
    pauseAria: 'Pause breathing',
    resumeAria: 'Resume breathing',
    timerAria: (clock: string) => `Breathing for ${clock}`,
    showTime: 'Show time',
    hideTime: 'Hide time',
    customLegend: 'Custom rhythm, in seconds',
    shorter: (phase: string) => `Shorter ${phase.toLowerCase()}`,
    longer: (phase: string) => `Longer ${phase.toLowerCase()}`,
  },

  sounds: {
    title: 'Listen.',
    lead: 'Layer a few sounds until the room feels right.',
    unsupported: 'Sound isn’t available in this browser. The rest of the sanctuary still is.',
    soundOn: 'Sound on',
    turnOn: 'Turn sound on',
    masterVolume: 'Master volume',
    section: 'Ambient sounds',
    saved: 'Your mix is remembered on this device.',
    music: 'Music',

    musicLead: 'Original pieces, composed live as you listen. Never quite the same twice.',
    musicVolume: 'Music volume',
    play: (title: string) => `Play ${title}`,
    stop: (title: string) => `Stop ${title}`,
    live: 'live',
    yourTrack: 'Your track',
    pieces: {
      'slow-tide': {
        title: 'Slow Tide',
        description: 'Wide, warm chords that come and go like water.',
      },
      'low-lantern': {
        title: 'Low Lantern',
        description: 'Dark and soft. Made for falling asleep.',
      },
      'clear-water': {
        title: 'Clear Water',
        description: 'A steady, gentle pulse to think inside.',
      },
      'stone-bell': { title: 'Stone Bell', description: 'A drone and a singing bowl, far apart.' },
      'morning-moss': {
        title: 'Morning Moss',
        description: 'Bright bells over soft green chords.',
      },
      aurora: { title: 'Aurora', description: 'Shimmering, slowly shifting light.' },
      'rain-tapes': {
        title: 'Rain Tapes',
        description: 'Warm keys, a lazy beat, a little tape dust.',
      },
    },
    volume: (sound: string) => `${sound} volume`,
    items: {
      rain: { label: 'Rain', description: 'Steady rain on a quiet street' },
      ocean: { label: 'Ocean', description: 'Slow waves, far from shore' },
      fire: { label: 'Fire', description: 'A small fire, softly crackling' },
      forest: { label: 'Forest', description: 'Leaves, air, and the odd distant bird' },
      wind: { label: 'Wind', description: 'Wind moving over open land' },
      space: { label: 'Space', description: 'A low, warm drone' },
      storm: { label: 'Storm', description: 'Heavy rain and distant thunder' },
      deep: { label: 'Deep', description: 'Warm brown noise' },
    },
    categories: {
      'Deep Relaxation': 'Deep Relaxation',
      Sleep: 'Sleep',
      Focus: 'Focus',
      Meditation: 'Meditation',
      Nature: 'Nature',
      Ambient: 'Ambient',
      'Lo-Fi': 'Lo-Fi',
    },
  },

  explore: {
    title: 'Somewhere else.',
    lead: 'Each place has its own light and its own sound.',
    here: 'You are here',
    tip: 'Touch the empty sky. It answers, quietly.',
    places: {
      night: { name: 'Night', line: 'Stars, a slow aurora, and nothing else.' },
      ocean: { name: 'Ocean', line: 'Deep water. Light from far above.' },
      forest: { name: 'Forest', line: 'Mist between the trees. Warm, late light.' },
      rain: { name: 'Rain', line: 'A window, a city somewhere behind it.' },
      fire: { name: 'Fireplace', line: 'Embers rising into a dark, warm room.' },
      clouds: { name: 'Clouds', line: 'Dusk sky. Clouds with nowhere to be.' },
    },
  },

  focus: {
    title: 'Focus.',
    lead: 'Work gently. Nothing here will rush you.',
    lengthLabel: 'Session length',
    hint: 'A soft tone will let you know when it’s over.',
    sessionHeading: 'Focus session',
    running: 'focus',
    paused: 'paused',
    done: 'You did enough.',
    another: 'Another session',
    breatheAWhile: 'Breathe for a while',
  },

  sleep: {
    title: 'Sleep.',
    lead: 'The screen will dim slowly, then the sound will follow.',
    fadeLabel: 'Fade out after',
    hint: 'Put the phone face down. Nothing will wake you.',
    sessionHeading: 'Sleep session',
    whisper: 'Let go of the day.',
    wake: 'Wake',
    goodnight: 'Sleep well.',
    awake: 'I’m awake',
  },

  disconnect: {
    heading: 'Disconnect',
    lines: ['Put your phone down.', 'You don’t need to check anything right now.'],
    timeLabel: 'Time away',
    start: 'Disconnect',
    activeHeading: 'Disconnected. The session ends on its own.',
    comeBack: 'Come back',
    welcome: 'Welcome back.',
  },

  stillness: {
    first: 'You don’t have to do anything.',
    second: 'Just stay.',
  },

  settings: {
    title: 'Settings',
    sound: 'Sound',
    masterVolume: 'Master volume',
    unsupported: 'Sound isn’t available in this browser. Everything else is.',
    language: 'Language',
    languageAuto: 'Auto',
    motion: 'Motion',
    motionOptions: { system: 'System', reduced: 'Reduced', full: 'Full' },
    performance: 'Performance',
    performanceLabel: 'Performance mode',
    performanceOptions: { auto: 'Auto', on: 'Light', off: 'Full' },
    particles: 'Particles',
    fade: 'Let the interface fade',
    fadeHint: 'Controls disappear when you’re still.',
    fullscreen: 'Fullscreen',
    privacy: 'Preferences stay on this device. Nothing is sent anywhere.',
    madeBy: 'Made by',
  },

  session: {
    backTo: (label: string, clock: string | null) =>
      clock ? `Back to ${label}, ${clock} left` : `Back to ${label}`,
  },

  error: {
    message: 'This corner of the sanctuary is resting.',
    home: 'Return home',
  },
};

export type Messages = typeof en;
