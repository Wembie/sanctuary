import { useCallback, useSyncExternalStore } from 'react';
import { parseHash, toHash, type RoutePath } from '../app/routes';

const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
};

const getRoute = (): RoutePath => parseHash(window.location.hash);

/**
 * Hash routing: the only strategy that survives GitHub Pages refreshes and
 * deep links with zero server configuration.
 */
export function useHashRoute(): [RoutePath, (path: RoutePath) => void] {
  const route = useSyncExternalStore(subscribe, getRoute, () => '/' as RoutePath);
  const navigate = useCallback((path: RoutePath) => {
    if (getRoute() !== path) window.location.hash = toHash(path);
  }, []);
  return [route, navigate];
}
