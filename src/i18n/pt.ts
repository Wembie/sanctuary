import type { Messages } from './en';

export const pt: Messages = {
  common: {
    close: 'Fechar',
    settings: 'Ajustes',
    skipToContent: 'Pular para o conteúdo',
    begin: 'Começar',
    end: 'Encerrar',
    pause: 'Pausar',
    resume: 'Continuar',
    returnLabel: 'Voltar',
    takeYourTime: 'Não tenha pressa.',
    custom: 'Personalizado',
    minutes: 'minutos',
    minutesShort: (n) => `${n} min`,
    noEnd: 'Sem fim',
    percent: (n) => `${n} por cento`,
  },

  routes: {
    home: 'Início',
    breathe: 'Respirar',
    sounds: 'Sons',
    focus: 'Foco',
    sleep: 'Dormir',
    explore: 'Explorar',
    disconnect: 'Desconectar',
    homeTitle: 'Sanctuary: um lugar tranquilo para um mundo barulhento',
    pageTitle: (page) => `${page} · Sanctuary`,
  },

  greeting: {
    morning: 'Bom dia.',
    afternoon: 'Boa tarde.',
    evening: 'Boa noite.',
    night: 'Boa noite.',
  },

  loader: {
    preparing: 'preparando o seu espaço…',
  },

  threshold: {
    firstVisit: [
      'Respire fundo.',
      'Aqui você está em segurança.',
      'Este lugar é seu.',
      'Aqui não há metas.',
      'Leve o que precisar.',
    ],
    returning: ['Que bom ter você de volta.', 'Respire fundo.', 'Aqui você está em segurança.'],
    enter: 'Entrar no Sanctuary',
    hint: 'com som · fones de ouvido recomendados',
    silent: 'ou entrar em silêncio',
  },

  home: {
    question: 'Do que você precisa agora?',
    needs: {
      calm: { label: 'Calma', hint: 'Respire devagar' },
      focus: { label: 'Foco', hint: 'Trabalhe sem pressão' },
      sleep: { label: 'Dormir', hint: 'Deixe o quarto escurecer' },
      disconnect: { label: 'Desconectar', hint: 'Afaste-se um pouco' },
    },
    stay: 'Ou simplesmente fique.',
    continueLast: (place) => `Continuar no seu último espaço · ${place}`,
    dailyPause: (p) =>
      `A pausa de hoje · ${p.minutes} min · respiração ${p.technique.toLowerCase()}, ${p.place.toLowerCase()}`,
  },

  breathe: {
    heading: 'Respirar',
    techniqueLabel: 'Técnica de respiração',
    techniques: {
      calm: { label: 'Calma', description: 'Uma expiração mais longa para desacelerar.' },
      box: { label: 'Quadrada', description: 'Quatro lados iguais. Estável e centrada.' },
      deep: { label: 'Profunda', description: 'Quatro, sete, oito. Para o fim de um dia longo.' },
      custom: { label: 'Personalizada', description: 'O seu próprio ritmo.' },
    },
    phases: { inhale: 'Inspire', hold: 'Segure', exhale: 'Expire', rest: 'Descanse' },
    paused: 'Pausado',
    settle: 'Fique confortável.',
    pauseAria: 'Pausar a respiração',
    resumeAria: 'Continuar a respiração',
    timerAria: (clock) => `Respirando há ${clock}`,
    showTime: 'Mostrar tempo',
    hideTime: 'Ocultar tempo',
    customLegend: 'Ritmo personalizado, em segundos',
    shorter: (phase) => `Encurtar: ${phase.toLowerCase()}`,
    longer: (phase) => `Alongar: ${phase.toLowerCase()}`,
  },

  sounds: {
    title: 'Escute.',
    lead: 'Combine alguns sons até o ambiente parecer certo.',
    unsupported: 'O som não está disponível neste navegador. O resto do santuário está.',
    soundOn: 'Som ligado',
    turnOn: 'Ligar o som',
    masterVolume: 'Volume geral',
    section: 'Sons ambientes',
    saved: 'Sua mistura fica salva neste dispositivo.',
    music: 'Música',

    musicLead:
      'Peças originais compostas ao vivo enquanto você ouve. Nunca soam iguais duas vezes.',
    musicVolume: 'Volume da música',
    play: (title) => `Tocar ${title}`,
    stop: (title) => `Parar ${title}`,
    live: 'ao vivo',
    yourTrack: 'Sua faixa',
    pieces: {
      'slow-tide': {
        title: 'Maré lenta',
        description: 'Acordes amplos e quentes que vêm e vão como a água.',
      },
      'low-lantern': {
        title: 'Lanterna baixa',
        description: 'Escura e suave. Feita para pegar no sono.',
      },
      'clear-water': {
        title: 'Água clara',
        description: 'Um pulso firme e suave para pensar dentro dele.',
      },
      'stone-bell': {
        title: 'Sino de pedra',
        description: 'Um zumbido e uma tigela tibetana, bem espaçados.',
      },
      'morning-moss': {
        title: 'Musgo da manhã',
        description: 'Sinos brilhantes sobre acordes verdes e suaves.',
      },
      aurora: { title: 'Aurora', description: 'Luz que cintila e muda devagar.' },
      'rain-tapes': {
        title: 'Fitas de chuva',
        description: 'Teclas quentes, uma batida preguiçosa, um pouco de poeira de fita.',
      },
    },
    volume: (sound) => `Volume de ${sound.toLowerCase()}`,
    items: {
      rain: { label: 'Chuva', description: 'Chuva constante numa rua tranquila' },
      ocean: { label: 'Oceano', description: 'Ondas lentas, longe da praia' },
      fire: { label: 'Fogo', description: 'Um fogo pequeno, estalando baixinho' },
      forest: { label: 'Floresta', description: 'Folhas, ar e algum pássaro distante' },
      wind: { label: 'Vento', description: 'Vento sobre o campo aberto' },
      space: { label: 'Espaço', description: 'Um zumbido grave e quente' },
      storm: { label: 'Tempestade', description: 'Chuva forte e trovões distantes' },
      deep: { label: 'Profundo', description: 'Ruído marrom quente' },
    },
    categories: {
      'Deep Relaxation': 'Relaxamento profundo',
      Sleep: 'Dormir',
      Focus: 'Foco',
      Meditation: 'Meditação',
      Nature: 'Natureza',
      Ambient: 'Ambiente',
      'Lo-Fi': 'Lo-Fi',
    },
  },

  explore: {
    title: 'Outro lugar.',
    lead: 'Cada lugar tem sua própria luz e seu próprio som.',
    here: 'Você está aqui',
    tip: 'Toque o céu vazio. Ele responde, baixinho.',
    places: {
      night: { name: 'Noite', line: 'Estrelas, uma aurora lenta e nada mais.' },
      ocean: { name: 'Oceano', line: 'Água profunda. Luz vinda de muito acima.' },
      forest: { name: 'Floresta', line: 'Névoa entre as árvores. Luz quente de fim de tarde.' },
      rain: { name: 'Chuva', line: 'Uma janela, uma cidade em algum lugar atrás dela.' },
      fire: { name: 'Lareira', line: 'Brasas subindo num quarto escuro e quente.' },
      clouds: { name: 'Nuvens', line: 'Céu de entardecer. Nuvens sem pressa.' },
    },
  },

  focus: {
    title: 'Foco.',
    lead: 'Trabalhe com leveza. Nada aqui vai apressar você.',
    lengthLabel: 'Duração da sessão',
    hint: 'Um som suave avisará quando terminar.',
    sessionHeading: 'Sessão de foco',
    running: 'foco',
    paused: 'pausado',
    done: 'Você fez o suficiente.',
    another: 'Outra sessão',
    breatheAWhile: 'Respirar um pouco',
  },

  sleep: {
    title: 'Dormir.',
    lead: 'A tela vai escurecer devagar, e depois o som vai junto.',
    fadeLabel: 'Apagar depois de',
    hint: 'Vire o celular para baixo. Nada vai acordar você.',
    sessionHeading: 'Sessão de sono',
    whisper: 'Deixe o dia ir.',
    wake: 'Acordar',
    goodnight: 'Durma bem.',
    awake: 'Já acordei',
  },

  disconnect: {
    heading: 'Desconectar',
    lines: ['Deixe o celular de lado.', 'Você não precisa conferir nada agora.'],
    timeLabel: 'Tempo longe',
    start: 'Desconectar',
    activeHeading: 'Desconexão em andamento. A sessão termina sozinha.',
    comeBack: 'Voltar',
    welcome: 'Que bom ter você de volta.',
  },

  stillness: {
    first: 'Você não precisa fazer nada.',
    second: 'Apenas fique.',
  },

  settings: {
    title: 'Ajustes',
    sound: 'Som',
    masterVolume: 'Volume geral',
    unsupported: 'O som não está disponível neste navegador. Todo o resto está.',
    language: 'Idioma',
    languageAuto: 'Auto',
    motion: 'Movimento',
    motionOptions: { system: 'Sistema', reduced: 'Reduzido', full: 'Completo' },
    performance: 'Desempenho',
    performanceLabel: 'Modo de desempenho',
    performanceOptions: { auto: 'Auto', on: 'Leve', off: 'Completo' },
    particles: 'Partículas',
    fade: 'Deixar a interface sumir',
    fadeHint: 'Os controles somem quando você não se mexe.',
    fullscreen: 'Tela cheia',
    privacy: 'As preferências ficam neste dispositivo. Nada é enviado.',
  },

  error: {
    message: 'Este canto do santuário está descansando.',
    home: 'Voltar ao início',
  },
};
