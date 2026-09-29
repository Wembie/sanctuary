import { ROUTE_NAME, type RoutePath } from '../../app/routes';
import { useStore } from '../../hooks/useStore';
import { useT } from '../../i18n';
import { formatClock, remainingMs } from '../../lib/timer';
import { isActive, ROUTE_OF, session } from '../../services/session';
import { sceneStore } from '../../store/scene';
import { Link } from '../navigation/Link';
import styles from './Session.module.css';

/**
 * A small reminder that a session is still going while you're elsewhere,
 * and a way back to it. Disconnect shows no clock on purpose.
 */
export function SessionIndicator({ route }: { route: RoutePath }) {
  const t = useT();
  const state = useStore(session.store);
  const stillness = useStore(sceneStore, (s) => s.stillness);
  if (!state.kind || !isActive(state) || stillness) return null;

  const target = ROUTE_OF[state.kind];
  if (target === route) return null;

  const label = t.routes[ROUTE_NAME[target]];
  const clock =
    state.kind === 'disconnect' || state.duration === null
      ? null
      : formatClock(remainingMs(state.duration, state.elapsed));
  const paused = state.status === 'paused';

  return (
    <Link
      to={target}
      className={`${styles.indicator} glass chrome`}
      aria-label={t.session.backTo(label, clock)}
    >
      <span className={styles.pulse} data-paused={paused || undefined} aria-hidden="true" />
      <span>{label}</span>
      {clock && <span className={styles.indicatorClock}>{clock}</span>}
      {state.kind === 'sleep' && state.duration === null && (
        <span className={styles.indicatorClock}>∞</span>
      )}
    </Link>
  );
}
