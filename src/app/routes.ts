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

export interface RouteMeta {
  path: RoutePath;
  label: string;
  title: string;
}

export const ROUTES: Record<RoutePath, RouteMeta> = {
  '/': { path: '/', label: 'Home', title: 'Sanctuary: A quiet place for a noisy world' },
  '/breathe': { path: '/breathe', label: 'Breathe', title: 'Breathe · Sanctuary' },
  '/sounds': { path: '/sounds', label: 'Sounds', title: 'Sounds · Sanctuary' },
  '/focus': { path: '/focus', label: 'Focus', title: 'Focus · Sanctuary' },
  '/sleep': { path: '/sleep', label: 'Sleep', title: 'Sleep · Sanctuary' },
  '/explore': { path: '/explore', label: 'Explore', title: 'Explore · Sanctuary' },
  '/disconnect': { path: '/disconnect', label: 'Disconnect', title: 'Disconnect · Sanctuary' },
};

/** "#/breathe?x" → "/breathe". Anything unknown lands softly at home. */
export function parseHash(hash: string): RoutePath {
  const path = hash.replace(/^#/, '').split(/[?#]/)[0]?.replace(/\/+$/, '') || '/';
  return (ROUTE_PATHS as readonly string[]).includes(path) ? (path as RoutePath) : '/';
}

export const toHash = (path: RoutePath): string => `#${path}`;
