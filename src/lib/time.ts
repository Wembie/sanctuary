export type DayPart = 'morning' | 'afternoon' | 'evening' | 'night';

export function getDayPart(date: Date = new Date()): DayPart {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

const GREETINGS: Record<DayPart, string> = {
  morning: 'Good morning.',
  afternoon: 'Good afternoon.',
  evening: 'Good evening.',
  night: 'Good evening.',
};

export const getGreeting = (date: Date = new Date()): string => GREETINGS[getDayPart(date)];

/** Local calendar date as YYYY-MM-DD (not UTC: "today" is the user's today). */
export function localDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
