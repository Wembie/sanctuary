import { useStore } from '../hooks/useStore';
import { settingsStore, type LanguageSetting } from '../store/settings';
import { en, type Messages } from './en';
import { es } from './es';
import { fr } from './fr';
import { pt } from './pt';

export type { Messages };

export const LOCALES = ['en', 'es', 'pt', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];
export type LanguagePreference = LanguageSetting;

/** Shown in the language picker, always in the language itself. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
  fr: 'Français',
};

const MESSAGES: Record<Locale, Messages> = { en, es, pt, fr };

/** First supported language from the browser's list ("es-CO" → "es"), else English. */
export function detectLocale(languages: readonly string[]): Locale {
  for (const tag of languages) {
    const base = tag.toLowerCase().split('-')[0];
    const match = LOCALES.find((locale) => locale === base);
    if (match) return match;
  }
  return 'en';
}

const browserLocale = detectLocale(
  typeof navigator === 'undefined'
    ? []
    : navigator.languages?.length
      ? navigator.languages
      : [navigator.language],
);

export const resolveLocale = (preference: LanguagePreference): Locale =>
  preference === 'auto' ? browserLocale : preference;

export const getMessages = (locale: Locale): Messages => MESSAGES[locale];

export function useLocale(): Locale {
  return resolveLocale(useStore(settingsStore, (s) => s.language));
}

/** The dictionary for the current language. Re-renders when the language changes. */
export function useT(): Messages {
  return MESSAGES[useLocale()];
}
