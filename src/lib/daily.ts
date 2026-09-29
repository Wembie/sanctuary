import type { TechniqueId } from './breathing';
import { hashString, pick, seededRandom } from './random';
import { localDateKey } from './time';
import { ENVIRONMENT_IDS, type EnvironmentId } from '../themes/environments';

export interface DailyPause {
  date: string;
  environment: EnvironmentId;
  technique: Exclude<TechniqueId, 'custom'>;
  minutes: number;
}

const TECHNIQUES = ['calm', 'box', 'deep'] as const;

/** The same small suggestion for everyone, all day; a new one tomorrow. No server needed. */
export function getDailyPause(date: Date = new Date()): DailyPause {
  const key = localDateKey(date);
  const random = seededRandom(hashString(`sanctuary:${key}`));
  return {
    date: key,
    environment: pick(ENVIRONMENT_IDS, random),
    technique: pick(TECHNIQUES, random),
    minutes: 3,
  };
}
