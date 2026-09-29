import { readJSON, writeJSON } from './storage';

type Listener = () => void;
type Updater<T> = Partial<T> | ((previous: T) => T);

export interface Store<T> {
  get(): T;
  set(update: Updater<T>): void;
  subscribe(listener: Listener): () => void;
  reset(): void;
}

interface StoreOptions<T> {
  /** localStorage key. Omit for an in-memory store. */
  key?: string;
  defaults: T;
  /** Turns whatever was on disk into a valid T. Never trust storage. */
  sanitize: (stored: unknown, defaults: T) => T;
}

/**
 * A deliberately tiny external store, consumed with useSyncExternalStore.
 * A handful of preferences doesn't need Redux.
 */
export function createStore<T extends object>({
  key,
  defaults,
  sanitize,
}: StoreOptions<T>): Store<T> {
  const load = (): T => {
    if (!key) return defaults;
    const stored = readJSON(key);
    return stored === undefined ? defaults : sanitize(stored, defaults);
  };

  let state = load();
  const listeners = new Set<Listener>();

  const commit = (next: T) => {
    if (Object.is(next, state)) return;
    state = next;
    if (key) writeJSON(key, state);
    listeners.forEach((listener) => listener());
  };

  return {
    get: () => state,
    set: (update) => commit(typeof update === 'function' ? update(state) : { ...state, ...update }),
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    reset: () => commit(defaults),
  };
}

/* Helpers for sanitizers. */

export const pickBoolean = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;

export function pickEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

export function pickNumber(value: unknown, min: number, max: number, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback;
}

export const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
