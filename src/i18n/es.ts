import type { Messages } from './en';

export const es: Messages = {
  common: {
    close: 'Cerrar',
    settings: 'Ajustes',
    skipToContent: 'Saltar al contenido',
    begin: 'Empezar',
    end: 'Terminar',
    pause: 'Pausar',
    resume: 'Continuar',
    returnLabel: 'Volver',
    takeYourTime: 'Tómate tu tiempo.',
    custom: 'Personalizado',
    minutes: 'minutos',
    minutesShort: (n) => `${n} min`,
    noEnd: 'Sin final',
    percent: (n) => `${n} por ciento`,
  },

  routes: {
    home: 'Inicio',
    breathe: 'Respirar',
    sounds: 'Sonidos',
    focus: 'Enfoque',
    sleep: 'Dormir',
    explore: 'Explorar',
    disconnect: 'Desconectar',
    homeTitle: 'Sanctuary: un lugar tranquilo para un mundo ruidoso',
    pageTitle: (page) => `${page} · Sanctuary`,
  },

  greeting: {
    morning: 'Buenos días.',
    afternoon: 'Buenas tardes.',
    evening: 'Buenas noches.',
    night: 'Buenas noches.',
  },

  loader: {
    preparing: 'preparando tu espacio…',
  },

  threshold: {
    firstVisit: [
      'Respira hondo.',
      'Aquí estás a salvo.',
      'Este lugar es tuyo.',
      'Aquí no hay metas.',
      'Toma lo que necesites.',
    ],
    returning: ['Qué bueno verte de nuevo.', 'Respira hondo.', 'Aquí estás a salvo.'],
    enter: 'Entrar a Sanctuary',
    hint: 'con sonido · se recomiendan audífonos',
    silent: 'o entrar en silencio',
  },

  home: {
    question: '¿Qué necesitas ahora mismo?',
    needs: {
      calm: { label: 'Calma', hint: 'Respira despacio' },
      focus: { label: 'Enfoque', hint: 'Trabaja sin presión' },
      sleep: { label: 'Dormir', hint: 'Deja que la habitación se oscurezca' },
      disconnect: { label: 'Desconectar', hint: 'Aléjate un rato' },
    },
    stay: 'O simplemente quédate.',
    continueLast: (place) => `Continuar en tu último espacio · ${place}`,
    dailyPause: (p) =>
      `La pausa de hoy · ${p.minutes} min · respiración ${p.technique.toLowerCase()}, ${p.place.toLowerCase()}`,
  },

  breathe: {
    heading: 'Respirar',
    techniqueLabel: 'Técnica de respiración',
    techniques: {
      calm: { label: 'Calma', description: 'Una exhalación más larga para bajar el ritmo.' },
      box: { label: 'Cuadrada', description: 'Cuatro lados iguales. Estable y centrada.' },
      deep: {
        label: 'Profunda',
        description: 'Cuatro, siete, ocho. Para el final de un día largo.',
      },
      custom: { label: 'Personalizada', description: 'Tu propio ritmo.' },
    },
    phases: { inhale: 'Inhala', hold: 'Sostén', exhale: 'Exhala', rest: 'Descansa' },
    paused: 'En pausa',
    settle: 'Acomódate.',
    pauseAria: 'Pausar la respiración',
    resumeAria: 'Continuar la respiración',
    timerAria: (clock) => `Respirando desde hace ${clock}`,
    showTime: 'Mostrar tiempo',
    hideTime: 'Ocultar tiempo',
    customLegend: 'Ritmo personalizado, en segundos',
    shorter: (phase) => `Acortar: ${phase.toLowerCase()}`,
    longer: (phase) => `Alargar: ${phase.toLowerCase()}`,
  },

  sounds: {
    title: 'Escucha.',
    lead: 'Combina algunos sonidos hasta que la habitación se sienta bien.',
    unsupported: 'El sonido no está disponible en este navegador. El resto del santuario sí.',
    soundOn: 'Sonido activado',
    turnOn: 'Activar sonido',
    masterVolume: 'Volumen general',
    section: 'Sonidos ambientales',
    saved: 'Tu mezcla se recuerda en este dispositivo.',
    music: 'Música',

    musicLead:
      'Piezas originales que se componen en vivo mientras escuchas. Nunca suenan igual dos veces.',
    musicVolume: 'Volumen de la música',
    play: (title) => `Reproducir ${title}`,
    stop: (title) => `Detener ${title}`,
    live: 'en vivo',
    yourTrack: 'Tu pista',
    pieces: {
      'slow-tide': {
        title: 'Marea lenta',
        description: 'Acordes amplios y cálidos que van y vienen como el agua.',
      },
      'low-lantern': {
        title: 'Linterna tenue',
        description: 'Oscura y suave. Hecha para quedarse dormido.',
      },
      'clear-water': {
        title: 'Agua clara',
        description: 'Un pulso estable y suave para pensar dentro de él.',
      },
      'stone-bell': {
        title: 'Campana de piedra',
        description: 'Un zumbido y un cuenco tibetano, muy espaciados.',
      },
      'morning-moss': {
        title: 'Musgo de mañana',
        description: 'Campanas brillantes sobre acordes verdes y suaves.',
      },
      aurora: { title: 'Aurora', description: 'Luz que brilla y cambia despacio.' },
      'rain-tapes': {
        title: 'Cintas de lluvia',
        description: 'Teclas cálidas, un ritmo perezoso y algo de polvo de cinta.',
      },
    },
    volume: (sound) => `Volumen de ${sound.toLowerCase()}`,
    items: {
      rain: { label: 'Lluvia', description: 'Lluvia constante en una calle tranquila' },
      ocean: { label: 'Océano', description: 'Olas lentas, lejos de la orilla' },
      fire: { label: 'Fuego', description: 'Un fuego pequeño que crepita suave' },
      forest: { label: 'Bosque', description: 'Hojas, aire y algún pájaro lejano' },
      wind: { label: 'Viento', description: 'Viento sobre campo abierto' },
      space: { label: 'Espacio', description: 'Un zumbido grave y cálido' },
      storm: { label: 'Tormenta', description: 'Lluvia intensa y truenos lejanos' },
      deep: { label: 'Profundo', description: 'Ruido marrón cálido' },
    },
    categories: {
      'Deep Relaxation': 'Relajación profunda',
      Sleep: 'Dormir',
      Focus: 'Enfoque',
      Meditation: 'Meditación',
      Nature: 'Naturaleza',
      Ambient: 'Ambiental',
      'Lo-Fi': 'Lo-Fi',
    },
  },

  explore: {
    title: 'A otro lugar.',
    lead: 'Cada lugar tiene su propia luz y su propio sonido.',
    here: 'Estás aquí',
    tip: 'Toca el cielo vacío. Responde, en voz baja.',
    places: {
      night: { name: 'Noche', line: 'Estrellas, una aurora lenta y nada más.' },
      ocean: { name: 'Océano', line: 'Agua profunda. Luz desde muy arriba.' },
      forest: { name: 'Bosque', line: 'Niebla entre los árboles. Luz cálida de tarde.' },
      rain: { name: 'Lluvia', line: 'Una ventana, una ciudad en algún lugar detrás.' },
      fire: { name: 'Chimenea', line: 'Brasas que suben en una habitación oscura y cálida.' },
      clouds: { name: 'Nubes', line: 'Cielo de atardecer. Nubes sin prisa.' },
    },
  },

  focus: {
    title: 'Enfoque.',
    lead: 'Trabaja con calma. Aquí nada te va a apurar.',
    lengthLabel: 'Duración de la sesión',
    hint: 'Un tono suave te avisará cuando termine.',
    sessionHeading: 'Sesión de enfoque',
    running: 'enfoque',
    paused: 'en pausa',
    done: 'Hiciste suficiente.',
    another: 'Otra sesión',
    breatheAWhile: 'Respirar un rato',
  },

  sleep: {
    title: 'Dormir.',
    lead: 'La pantalla se irá oscureciendo despacio y luego el sonido la seguirá.',
    fadeLabel: 'Apagar después de',
    hint: 'Pon el teléfono boca abajo. Nada te va a despertar.',
    sessionHeading: 'Sesión de sueño',
    whisper: 'Suelta el día.',
    wake: 'Despertar',
    goodnight: 'Que descanses.',
    awake: 'Ya desperté',
  },

  disconnect: {
    heading: 'Desconectar',
    lines: ['Deja el teléfono.', 'No necesitas revisar nada ahora mismo.'],
    timeLabel: 'Tiempo fuera',
    start: 'Desconectar',
    activeHeading: 'Desconexión en curso. La sesión termina sola.',
    comeBack: 'Volver',
    welcome: 'Qué bueno verte de nuevo.',
  },

  stillness: {
    first: 'No tienes que hacer nada.',
    second: 'Solo quédate.',
  },

  settings: {
    title: 'Ajustes',
    sound: 'Sonido',
    masterVolume: 'Volumen general',
    unsupported: 'El sonido no está disponible en este navegador. Todo lo demás sí.',
    language: 'Idioma',
    languageAuto: 'Auto',
    motion: 'Movimiento',
    motionOptions: { system: 'Sistema', reduced: 'Reducido', full: 'Completo' },
    performance: 'Rendimiento',
    performanceLabel: 'Modo de rendimiento',
    performanceOptions: { auto: 'Auto', on: 'Ligero', off: 'Completo' },
    particles: 'Partículas',
    fade: 'Dejar que la interfaz se desvanezca',
    fadeHint: 'Los controles desaparecen cuando no te mueves.',
    fullscreen: 'Pantalla completa',
    privacy: 'Tus preferencias se quedan en este dispositivo. No se envía nada.',
    madeBy: 'Hecho por',
  },

  error: {
    message: 'Este rincón del santuario está descansando.',
    home: 'Volver al inicio',
  },
};
