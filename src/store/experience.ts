import {
  DEFAULT_CUSTOM_PATTERN,
  sanitizePattern,
  type BreathPattern,
  type TechniqueId,
} from '../lib/breathing';
import { asRecord, createStore, pickBoolean, pickEnum, pickNumber } from '../lib/store';
import { ENVIRONMENT_IDS, type EnvironmentId } from '../themes/environments';
import { ROUTE_PATHS, type RoutePath } from '../app/routes';

export interface ExperienceState {
  environment: EnvironmentId;
  visits: number;
  /** Where the user was last time, to offer "continue your last space". */
  lastRoute: RoutePath;
  technique: TechniqueId;
  customPattern: BreathPattern;
  showBreathTimer: boolean;
  focusMinutes: number;
}

export const DEFAULT_EXPERIENCE: ExperienceState = {
  environment: 'night',
  visits: 0,
  lastRoute: '/',
  technique: 'calm',
  customPattern: DEFAULT_CUSTOM_PATTERN,
  showBreathTimer: false,
  focusMinutes: 25,
};

export function sanitizeExperience(stored: unknown, d: ExperienceState): ExperienceState {
  const s = asRecord(stored);
  return {
    environment: pickEnum(s.environment, ENVIRONMENT_IDS, d.environment),
    visits: Math.floor(pickNumber(s.visits, 0, Number.MAX_SAFE_INTEGER, d.visits)),
    lastRoute: pickEnum(s.lastRoute, ROUTE_PATHS, d.lastRoute),
    technique: pickEnum(s.technique, ['calm', 'box', 'deep', 'custom'] as const, d.technique),
    customPattern: sanitizePattern(s.customPattern, d.customPattern),
    showBreathTimer: pickBoolean(s.showBreathTimer, d.showBreathTimer),
    focusMinutes: Math.round(pickNumber(s.focusMinutes, 1, 180, d.focusMinutes)),
  };
}

export const experienceStore = createStore<ExperienceState>({
  key: 'experience',
  defaults: DEFAULT_EXPERIENCE,
  sanitize: sanitizeExperience,
});
