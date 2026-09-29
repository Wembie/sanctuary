import { describe, expect, it } from 'vitest';
import { parseHash } from '../app/routes';
import { SOUND_IDS } from '../services/audio/catalog';
import { applyTheme, ENVIRONMENT_IDS, ENVIRONMENTS, themeVariables } from './environments';

const HEX = /^#[0-9a-f]{6}$/i;

describe('environments', () => {
  it.each(ENVIRONMENT_IDS)('%s has a complete, valid palette', (id) => {
    const env = ENVIRONMENTS[id];
    expect(env.id).toBe(id);
    for (const color of Object.values(env.palette)) expect(color).toMatch(HEX);
    expect(env.aurora).toBeGreaterThanOrEqual(0);
    expect(env.aurora).toBeLessThanOrEqual(1);
    expect(env.particles.density).toBeGreaterThan(0);
  });

  it.each(ENVIRONMENT_IDS)('%s has a soundscape made of real sounds', (id) => {
    const soundscape = ENVIRONMENTS[id].soundscape;
    expect(Object.keys(soundscape).length).toBeGreaterThan(0);
    for (const [sound, volume] of Object.entries(soundscape)) {
      expect(SOUND_IDS).toContain(sound);
      expect(volume).toBeGreaterThan(0);
      expect(volume).toBeLessThanOrEqual(1);
    }
  });

  it('exposes theme variables, including rgb triplets for alpha blending', () => {
    const vars = themeVariables(ENVIRONMENTS.night);
    expect(vars['--bg-top']).toBe('#04060d');
    expect(vars['--accent-rgb']).toBe('180 192 255');
  });

  it('applies a theme to the document', () => {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.append(meta);
    applyTheme(ENVIRONMENTS.ocean);
    const root = document.documentElement;
    expect(root.dataset.env).toBe('ocean');
    expect(root.style.getPropertyValue('--bg-top')).toBe(ENVIRONMENTS.ocean.palette.bgTop);
    expect(meta.content).toBe(ENVIRONMENTS.ocean.palette.bgTop);
  });
});

describe('routes', () => {
  it('parses hashes into known routes', () => {
    expect(parseHash('#/breathe')).toBe('/breathe');
    expect(parseHash('#/sleep/')).toBe('/sleep');
    expect(parseHash('#/focus?x=1')).toBe('/focus');
    expect(parseHash('')).toBe('/');
    expect(parseHash('#/')).toBe('/');
  });

  it('sends anything unknown home', () => {
    expect(parseHash('#/nowhere')).toBe('/');
    expect(parseHash('#<script>')).toBe('/');
  });
});
