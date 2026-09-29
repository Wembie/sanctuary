import { parseHash, toHash, type RoutePath } from './routes';

const LEAVE_MS = 450;
let pending: number | undefined;

/**
 * Navigates with a soft exit: the current page fades and blurs out,
 * then the next one arrives. Back/forward buttons skip the exit and just arrive.
 */
export function navigateTo(path: RoutePath): void {
  if (parseHash(window.location.hash) === path) return;
  const root = document.documentElement;
  window.clearTimeout(pending);
  if (root.dataset.motion === 'reduced') {
    window.location.hash = toHash(path);
    return;
  }
  root.dataset.leaving = 'true';
  pending = window.setTimeout(() => {
    window.location.hash = toHash(path);
    delete root.dataset.leaving;
  }, LEAVE_MS);
}
