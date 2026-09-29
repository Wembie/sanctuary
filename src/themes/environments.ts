import type { SoundMix } from '../services/audio/catalog';

export const ENVIRONMENT_IDS = ['night', 'ocean', 'forest', 'rain', 'fire', 'clouds'] as const;
export type EnvironmentId = (typeof ENVIRONMENT_IDS)[number];

export type ParticleKind = 'stars' | 'bubbles' | 'motes' | 'rain' | 'embers' | 'clouds';

export interface Palette {
  /** Sky gradient, top to bottom. */
  bgTop: string;
  bgBottom: string;
  /** Low light near the horizon. */
  horizon: string;
  accent: string;
  glow: string;
  auroraA: string;
  auroraB: string;
  particle: string;
}

export interface Environment {
  id: EnvironmentId;
  palette: Palette;
  particles: { kind: ParticleKind; density: number };
  /** 0 – 1: how visible the slow aurora layer is. */
  aurora: number;
  soundscape: SoundMix;
}

export const ENVIRONMENTS: Record<EnvironmentId, Environment> = {
  night: {
    id: 'night',
    palette: {
      bgTop: '#04060d',
      bgBottom: '#0a0f22',
      horizon: '#1a1d44',
      accent: '#b4c0ff',
      glow: '#8390ff',
      auroraA: '#2fb9b3',
      auroraB: '#6d52e6',
      particle: '#e2e8ff',
    },
    particles: { kind: 'stars', density: 150 },
    aurora: 0.55,
    soundscape: { space: 0.4, wind: 0.12 },
  },
  ocean: {
    id: 'ocean',
    palette: {
      bgTop: '#03121c',
      bgBottom: '#020912',
      horizon: '#0b3a4d',
      accent: '#9fdbe3',
      glow: '#3ea5b6',
      auroraA: '#2a8ea1',
      auroraB: '#1b527d',
      particle: '#c4eef4',
    },
    particles: { kind: 'bubbles', density: 70 },
    aurora: 0.45,
    soundscape: { ocean: 0.65 },
  },
  forest: {
    id: 'forest',
    palette: {
      bgTop: '#050a07',
      bgBottom: '#0d1811',
      horizon: '#26331f',
      accent: '#d6e4b8',
      glow: '#d8b46c',
      auroraA: '#4a7446',
      auroraB: '#a8834c',
      particle: '#f3e3b0',
    },
    particles: { kind: 'motes', density: 60 },
    aurora: 0.35,
    soundscape: { forest: 0.55, wind: 0.18 },
  },
  rain: {
    id: 'rain',
    palette: {
      bgTop: '#07090d',
      bgBottom: '#111721',
      horizon: '#2a2f3d',
      accent: '#c0cbdc',
      glow: '#e2a86a',
      auroraA: '#394866',
      auroraB: '#7a5a48',
      particle: '#cdd6e5',
    },
    particles: { kind: 'rain', density: 170 },
    aurora: 0.3,
    soundscape: { rain: 0.6, deep: 0.12 },
  },
  fire: {
    id: 'fire',
    palette: {
      bgTop: '#080403',
      bgBottom: '#170a06',
      horizon: '#3d190a',
      accent: '#f2cfa8',
      glow: '#ff9b55',
      auroraA: '#9c3f1a',
      auroraB: '#5e2010',
      particle: '#ffc98c',
    },
    particles: { kind: 'embers', density: 55 },
    aurora: 0.4,
    soundscape: { fire: 0.6, wind: 0.08 },
  },
  clouds: {
    id: 'clouds',
    palette: {
      bgTop: '#1a2036',
      bgBottom: '#3f4462',
      horizon: '#6f6789',
      accent: '#f4eaf6',
      glow: '#ffd6c4',
      auroraA: '#a996c4',
      auroraB: '#e5b3a6',
      particle: '#ffffff',
    },
    particles: { kind: 'clouds', density: 9 },
    aurora: 0.5,
    soundscape: { wind: 0.45 },
  },
};

export const getEnvironment = (id: EnvironmentId): Environment => ENVIRONMENTS[id];

const hexToRgbTriplet = (hex: string): string => {
  const value = hex.replace('#', '');
  const n = parseInt(value, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

/** CSS custom properties for an environment. Colors are registered with @property so they transition. */
export function themeVariables(env: Environment): Record<string, string> {
  const p = env.palette;
  return {
    '--bg-top': p.bgTop,
    '--bg-bottom': p.bgBottom,
    '--horizon': p.horizon,
    '--accent': p.accent,
    '--glow': p.glow,
    '--aurora-a': p.auroraA,
    '--aurora-b': p.auroraB,
    '--aurora-strength': String(env.aurora),
    '--accent-rgb': hexToRgbTriplet(p.accent),
    '--glow-rgb': hexToRgbTriplet(p.glow),
  };
}

export function applyTheme(env: Environment, root: HTMLElement = document.documentElement): void {
  for (const [name, value] of Object.entries(themeVariables(env))) {
    root.style.setProperty(name, value);
  }
  root.dataset.env = env.id;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', env.palette.bgTop);
}
