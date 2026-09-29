import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { RoutePath } from './routes';

type PageModule = { default: ComponentType };

/** Each page is its own chunk; the first one is preloaded while the loader breathes. */
const loaders: Record<RoutePath, () => Promise<PageModule>> = {
  '/': () => import('../pages/HomePage'),
  '/breathe': () => import('../pages/BreathePage'),
  '/sounds': () => import('../pages/SoundsPage'),
  '/focus': () => import('../pages/FocusPage'),
  '/sleep': () => import('../pages/SleepPage'),
  '/explore': () => import('../pages/ExplorePage'),
  '/disconnect': () => import('../pages/DisconnectPage'),
};

export const PAGES = Object.fromEntries(
  Object.entries(loaders).map(([path, load]) => [path, lazy(load)]),
) as Record<RoutePath, LazyExoticComponent<ComponentType>>;

export const preloadPage = (path: RoutePath): Promise<unknown> => loaders[path]();
