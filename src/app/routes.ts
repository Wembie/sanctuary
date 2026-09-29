export const ROUTE_PATHS = [
  '/',
  '/breathe',
  '/sounds',
  '/focus',
  '/sleep',
  '/explore',
  '/disconnect',
] as const;

export type RoutePath = (typeof ROUTE_PATHS)[number];

export type RouteName =
  'home' | 'breathe' | 'sounds' | 'focus' | 'sleep' | 'explore' | 'disconnect';

/** Key into the `routes` section of the dictionaries. */
export const ROUTE_NAME: Record<RoutePath, RouteName> = {
  '/': 'home',
  '/breathe': 'breathe',
  '/sounds': 'sounds',
  '/focus': 'focus',
  '/sleep': 'sleep',
  '/explore': 'explore',
  '/disconnect': 'disconnect',
};

/** "#/breathe?x" → "/breathe". Anything unknown lands softly at home. */
export function parseHash(hash: string): RoutePath {
  const path = hash.replace(/^#/, '').split(/[?#]/)[0]?.replace(/\/+$/, '') || '/';
  return (ROUTE_PATHS as readonly string[]).includes(path) ? (path as RoutePath) : '/';
}

export const toHash = (path: RoutePath): string => `#${path}`;
