import { describe, expect, it } from 'vitest';
import { LANGUAGE_OPTIONS } from '../store/settings';
import { en } from './en';
import { detectLocale, getMessages, LOCALES, resolveLocale } from './index';

type Tree = Record<string, unknown>;

/** Flattens a dictionary to "path → kind" so shapes can be compared across locales. */
function shape(value: unknown, prefix = ''): Record<string, string> {
  if (Array.isArray(value)) return { [prefix]: `array:${value.length}` };
  if (typeof value === 'function') return { [prefix]: 'function' };
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value as Tree).reduce<Record<string, string>>(
      (acc, [key, child]) => ({ ...acc, ...shape(child, prefix ? `${prefix}.${key}` : key) }),
      {},
    );
  }
  return { [prefix]: typeof value };
}

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (typeof value === 'object' && value !== null) return Object.values(value).flatMap(strings);
  return [];
}

describe('dictionaries', () => {
  it.each(LOCALES)('%s has exactly the shape of English', (locale) => {
    expect(shape(getMessages(locale))).toEqual(shape(en));
  });

  it.each(LOCALES)('%s has no empty strings', (locale) => {
    for (const text of strings(getMessages(locale))) expect(text.trim()).not.toBe('');
  });

  it.each(LOCALES)('%s formats its interpolated strings', (locale) => {
    const t = getMessages(locale);
    expect(t.common.minutesShort(25)).toContain('25');
    expect(t.routes.pageTitle('X')).toContain('X');
    const pause = t.home.dailyPause({ minutes: 3, technique: 'Box', place: 'Ocean' });
    expect(pause).toContain('3');
    expect(pause.toLowerCase()).toContain('ocean');
  });

  it('actually translates (spot check)', () => {
    expect(getMessages('es').home.question).not.toBe(en.home.question);
    expect(getMessages('pt').breathe.phases.inhale).not.toBe(en.breathe.phases.inhale);
    expect(getMessages('fr').greeting.morning).toBe('Bonjour.');
  });
});

describe('locale detection', () => {
  it('matches on the base language', () => {
    expect(detectLocale(['es-CO', 'en-US'])).toBe('es');
    expect(detectLocale(['pt-BR'])).toBe('pt');
    expect(detectLocale(['FR-ca'])).toBe('fr');
  });

  it('skips unsupported languages and falls back to English', () => {
    expect(detectLocale(['de-DE', 'pt-PT'])).toBe('pt');
    expect(detectLocale(['ja', 'ko'])).toBe('en');
    expect(detectLocale([])).toBe('en');
  });

  it('honors an explicit choice over the browser', () => {
    expect(resolveLocale('fr')).toBe('fr');
  });

  it('settings offers every locale, plus auto', () => {
    expect([...LANGUAGE_OPTIONS].sort()).toEqual(['auto', ...LOCALES].sort());
  });
});
