import { ROUTES, type RoutePath } from '../../app/routes';
import { useStore } from '../../hooks/useStore';
import { sceneStore } from '../../store/scene';
import { Icon, type IconName } from '../ui/Icon';
import { Link } from './Link';
import styles from './FloatingNavigation.module.css';

const ITEMS: { path: RoutePath; icon: IconName }[] = [
  { path: '/', icon: 'home' },
  { path: '/breathe', icon: 'breathe' },
  { path: '/sounds', icon: 'sounds' },
  { path: '/focus', icon: 'focus' },
  { path: '/sleep', icon: 'sleep' },
  { path: '/explore', icon: 'explore' },
];

export function FloatingNavigation({ route }: { route: RoutePath }) {
  const hidden = useStore(sceneStore, (s) => s.immersive || s.stillness);

  return (
    <nav
      aria-label="Main"
      className={`${styles.nav} glass chrome`}
      data-hidden={hidden || undefined}
      inert={hidden}
    >
      <ul className={styles.list}>
        {ITEMS.map(({ path, icon }) => {
          const label = ROUTES[path].label;
          const current = route === path;
          return (
            <li key={path}>
              <Link
                to={path}
                className={styles.item}
                aria-current={current ? 'page' : undefined}
                aria-label={label}
                title={label}
              >
                <Icon name={icon} size={19} />
                <span className={styles.label} aria-hidden="true">
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
        <li className={styles.divider} aria-hidden="true" />
        <li>
          <button
            type="button"
            className={styles.item}
            aria-label="Settings"
            title="Settings"
            aria-haspopup="dialog"
            onClick={() => sceneStore.set({ settingsOpen: true })}
          >
            <Icon name="settings" size={19} />
          </button>
        </li>
      </ul>
    </nav>
  );
}
