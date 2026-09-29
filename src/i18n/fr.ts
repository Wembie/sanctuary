import type { Messages } from './en';

export const fr: Messages = {
  common: {
    close: 'Fermer',
    settings: 'Réglages',
    skipToContent: 'Aller au contenu',
    begin: 'Commencer',
    end: 'Terminer',
    pause: 'Pause',
    resume: 'Reprendre',
    returnLabel: 'Revenir',
    takeYourTime: 'Prenez votre temps.',
    custom: 'Personnalisé',
    minutes: 'minutes',
    minutesShort: (n) => `${n} min`,
    noEnd: 'Sans fin',
    percent: (n) => `${n} pour cent`,
  },

  routes: {
    home: 'Accueil',
    breathe: 'Respirer',
    sounds: 'Sons',
    focus: 'Concentration',
    sleep: 'Dormir',
    explore: 'Explorer',
    disconnect: 'Déconnexion',
    homeTitle: 'Sanctuary : un lieu calme pour un monde bruyant',
    pageTitle: (page) => `${page} · Sanctuary`,
  },

  greeting: {
    morning: 'Bonjour.',
    afternoon: 'Bon après-midi.',
    evening: 'Bonsoir.',
    night: 'Bonsoir.',
  },

  loader: {
    preparing: 'nous préparons votre espace…',
  },

  threshold: {
    firstVisit: [
      'Respirez.',
      'Ici, vous êtes en sécurité.',
      'Ce lieu est à vous.',
      'Il n’y a aucun objectif ici.',
      'Prenez ce dont vous avez besoin.',
    ],
    returning: ['Bon retour.', 'Respirez.', 'Ici, vous êtes en sécurité.'],
    enter: 'Entrer dans Sanctuary',
    hint: 'avec le son · casque recommandé',
    silent: 'ou entrer en silence',
  },

  home: {
    question: 'De quoi avez-vous besoin maintenant ?',
    needs: {
      calm: { label: 'Calme', hint: 'Respirer lentement' },
      focus: { label: 'Concentration', hint: 'Travailler sans pression' },
      sleep: { label: 'Dormir', hint: 'Laisser l’écran s’éteindre doucement' },
      disconnect: { label: 'Déconnexion', hint: 'S’éloigner un moment' },
    },
    stay: 'Ou restez, simplement.',
    continueLast: (place) => `Reprendre votre dernier espace · ${place}`,
    dailyPause: (p) =>
      `La pause du jour · ${p.minutes} min · respiration ${p.technique.toLowerCase()}, ${p.place.toLowerCase()}`,
  },

  breathe: {
    heading: 'Respirer',
    techniqueLabel: 'Technique de respiration',
    techniques: {
      calm: { label: 'Calme', description: 'Une expiration plus longue pour tout ralentir.' },
      box: { label: 'Carrée', description: 'Quatre côtés égaux. Stable et ancrée.' },
      deep: {
        label: 'Profonde',
        description: 'Quatre, sept, huit. Pour la fin d’une longue journée.',
      },
      custom: { label: 'Personnalisée', description: 'Votre propre rythme.' },
    },
    phases: { inhale: 'Inspirez', hold: 'Retenez', exhale: 'Expirez', rest: 'Reposez' },
    paused: 'En pause',
    settle: 'Installez-vous confortablement.',
    pauseAria: 'Mettre la respiration en pause',
    resumeAria: 'Reprendre la respiration',
    timerAria: (clock) => `Respiration depuis ${clock}`,
    showTime: 'Afficher le temps',
    hideTime: 'Masquer le temps',
    customLegend: 'Rythme personnalisé, en secondes',
    shorter: (phase) => `Raccourcir : ${phase.toLowerCase()}`,
    longer: (phase) => `Allonger : ${phase.toLowerCase()}`,
  },

  sounds: {
    title: 'Écoutez.',
    lead: 'Superposez quelques sons jusqu’à ce que la pièce vous semble juste.',
    unsupported: 'Le son n’est pas disponible dans ce navigateur. Le reste du sanctuaire, si.',
    soundOn: 'Son activé',
    turnOn: 'Activer le son',
    masterVolume: 'Volume général',
    section: 'Sons d’ambiance',
    saved: 'Votre mélange est conservé sur cet appareil.',
    music: 'Musique',

    musicLead:
      'Des morceaux originaux, composés en direct pendant votre écoute. Jamais deux fois pareils.',
    musicVolume: 'Volume de la musique',
    play: (title) => `Lire ${title}`,
    stop: (title) => `Arrêter ${title}`,
    live: 'en direct',
    yourTrack: 'Votre morceau',
    pieces: {
      'slow-tide': {
        title: 'Marée lente',
        description: 'De larges accords chauds qui vont et viennent comme l’eau.',
      },
      'low-lantern': {
        title: 'Lanterne basse',
        description: 'Sombre et douce. Faite pour s’endormir.',
      },
      'clear-water': {
        title: 'Eau claire',
        description: 'Une pulsation stable et douce pour y penser.',
      },
      'stone-bell': {
        title: 'Cloche de pierre',
        description: 'Un bourdon et un bol chantant, très espacés.',
      },
      'morning-moss': {
        title: 'Mousse du matin',
        description: 'Des cloches claires sur des accords verts et doux.',
      },
      aurora: { title: 'Aurore', description: 'Une lumière scintillante qui change lentement.' },
      'rain-tapes': {
        title: 'Cassettes de pluie',
        description: 'Des touches chaudes, un rythme paresseux, un peu de poussière de bande.',
      },
    },
    volume: (sound) => `Volume : ${sound.toLowerCase()}`,
    items: {
      rain: { label: 'Pluie', description: 'Une pluie régulière dans une rue calme' },
      ocean: { label: 'Océan', description: 'Des vagues lentes, loin du rivage' },
      fire: { label: 'Feu', description: 'Un petit feu qui crépite doucement' },
      forest: { label: 'Forêt', description: 'Des feuilles, de l’air et un oiseau lointain' },
      wind: { label: 'Vent', description: 'Le vent sur une plaine ouverte' },
      space: { label: 'Espace', description: 'Un bourdonnement grave et chaud' },
      storm: { label: 'Orage', description: 'Forte pluie et tonnerre lointain' },
      deep: { label: 'Profond', description: 'Un bruit brun chaleureux' },
    },
    categories: {
      'Deep Relaxation': 'Relaxation profonde',
      Sleep: 'Sommeil',
      Focus: 'Concentration',
      Meditation: 'Méditation',
      Nature: 'Nature',
      Ambient: 'Ambient',
      'Lo-Fi': 'Lo-Fi',
    },
  },

  explore: {
    title: 'Ailleurs.',
    lead: 'Chaque lieu a sa propre lumière et son propre son.',
    here: 'Vous êtes ici',
    tip: 'Touchez le ciel vide. Il répond, doucement.',
    places: {
      night: { name: 'Nuit', line: 'Des étoiles, une aurore lente, et rien d’autre.' },
      ocean: { name: 'Océan', line: 'Une eau profonde. De la lumière, loin au-dessus.' },
      forest: {
        name: 'Forêt',
        line: 'De la brume entre les arbres. Une lumière chaude et tardive.',
      },
      rain: { name: 'Pluie', line: 'Une fenêtre, une ville quelque part derrière.' },
      fire: { name: 'Cheminée', line: 'Des braises qui montent dans une pièce sombre et chaude.' },
      clouds: { name: 'Nuages', line: 'Un ciel de crépuscule. Des nuages sans hâte.' },
    },
  },

  focus: {
    title: 'Concentration.',
    lead: 'Travaillez en douceur. Rien ici ne vous pressera.',
    lengthLabel: 'Durée de la séance',
    hint: 'Un son doux vous préviendra à la fin.',
    sessionHeading: 'Séance de concentration',
    running: 'concentration',
    paused: 'en pause',
    done: 'Vous en avez fait assez.',
    another: 'Une autre séance',
    breatheAWhile: 'Respirer un moment',
  },

  sleep: {
    title: 'Dormir.',
    lead: 'L’écran va s’assombrir lentement, puis le son suivra.',
    fadeLabel: 'S’éteindre après',
    hint: 'Posez le téléphone face contre table. Rien ne vous réveillera.',
    sessionHeading: 'Séance de sommeil',
    whisper: 'Laissez partir la journée.',
    wake: 'Réveil',
    goodnight: 'Dormez bien.',
    awake: 'Je me réveille',
  },

  disconnect: {
    heading: 'Déconnexion',
    lines: ['Posez votre téléphone.', 'Vous n’avez rien à vérifier pour l’instant.'],
    timeLabel: 'Temps d’absence',
    start: 'Se déconnecter',
    activeHeading: 'Déconnexion en cours. La séance se termine d’elle-même.',
    comeBack: 'Revenir',
    welcome: 'Bon retour.',
  },

  stillness: {
    first: 'Vous n’avez rien à faire.',
    second: 'Restez, simplement.',
  },

  settings: {
    title: 'Réglages',
    sound: 'Son',
    masterVolume: 'Volume général',
    unsupported: 'Le son n’est pas disponible dans ce navigateur. Tout le reste, si.',
    language: 'Langue',
    languageAuto: 'Auto',
    motion: 'Mouvement',
    motionOptions: { system: 'Système', reduced: 'Réduit', full: 'Complet' },
    performance: 'Performance',
    performanceLabel: 'Mode performance',
    performanceOptions: { auto: 'Auto', on: 'Léger', off: 'Complet' },
    particles: 'Particules',
    fade: 'Laisser l’interface s’effacer',
    fadeHint: 'Les commandes disparaissent quand vous ne bougez plus.',
    fullscreen: 'Plein écran',
    privacy: 'Vos préférences restent sur cet appareil. Rien n’est envoyé.',
    madeBy: 'Créé par',
  },

  session: {
    backTo: (label, clock) =>
      clock ? `Revenir à ${label}, encore ${clock}` : `Revenir à ${label}`,
  },

  error: {
    message: 'Ce coin du sanctuaire se repose.',
    home: 'Revenir à l’accueil',
  },
};
