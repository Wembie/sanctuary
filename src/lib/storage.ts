const NAMESPACE = 'sanctuary:v1:';

/**
 * localStorage can be missing, full, or throw (private mode, blocked site data).
 * Every access is guarded; the app must behave the same without it.
 */
export function readJSON(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(NAMESPACE + key);
    return raw === null ? undefined : (JSON.parse(raw) as unknown);
  } catch {
    return undefined;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(NAMESPACE + key, JSON.stringify(value));
  } catch {
    /* storage unavailable: preferences simply won't persist */
  }
}
