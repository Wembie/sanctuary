import { useSyncExternalStore } from 'react';
import type { Store } from '../lib/store';

export function useStore<T>(store: Store<T>): T;
export function useStore<T, S>(store: Store<T>, select: (state: T) => S): S;
export function useStore<T, S>(store: Store<T>, select?: (state: T) => S): T | S {
  const getSnapshot = () => (select ? select(store.get()) : store.get());
  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
