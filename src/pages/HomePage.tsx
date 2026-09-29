import { useState } from 'react';
import { selectEnvironment } from '../app/actions';
import { navigateTo } from '../app/navigation';
import { ROUTES, type RoutePath } from '../app/routes';
import { Link } from '../components/navigation/Link';
import { useStore } from '../hooks/useStore';
import { TECHNIQUES } from '../lib/breathing';
import { getDailyPause } from '../lib/daily';
import { getGreeting } from '../lib/time';
import { experienceStore } from '../store/experience';
import { sceneStore } from '../store/scene';
import { ENVIRONMENTS } from '../themes/environments';
import styles from './Page.module.css';
import local from './HomePage.module.css';

const NEEDS: { label: string; hint: string; to: RoutePath }[] = [
  { label: 'Calm', hint: 'Breathe slowly', to: '/breathe' },
  { label: 'Focus', hint: 'Work without pressure', to: '/focus' },
  { label: 'Sleep', hint: 'Let the room go dark', to: '/sleep' },
  { label: 'Disconnect', hint: 'Be away for a while', to: '/disconnect' },
];

export default function HomePage() {
  // Read once: the greeting shouldn't change while you're looking at it.
  const [greeting] = useState(() => getGreeting());
  const [pause] = useState(() => getDailyPause());
  const [lastRoute] = useState(() => experienceStore.get().lastRoute);
  const visits = useStore(experienceStore, (s) => s.visits);
  const showContinue = visits > 1 && lastRoute !== '/';

  const startPause = () => {
    selectEnvironment(pause.environment);
    experienceStore.set({ technique: pause.technique });
    navigateTo('/breathe');
  };

  return (
    <div className={`${styles.page} ${styles.center}`}>
      <div className={local.home}>
        <h1 className={`${styles.display} arrive`}>{greeting}</h1>
        <p className={`${styles.lead} arrive`} style={{ animationDelay: '300ms' }}>
          What do you need right now?
        </p>

        <ul className={local.needs}>
          {NEEDS.map((need, i) => (
            <li key={need.to} className="arrive" style={{ animationDelay: `${600 + i * 120}ms` }}>
              <Link to={need.to} className={local.need}>
                <span className={local.needLabel}>{need.label}</span>
                <span className={local.needHint}>{need.hint}</span>
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className={`${local.stay} arrive`}
          style={{ animationDelay: '1300ms' }}
          onClick={() => sceneStore.set({ stillness: true })}
        >
          Or simply stay.
        </button>

        <div className={`${local.extras} arrive`} style={{ animationDelay: '1700ms' }}>
          {showContinue && (
            <Link to={lastRoute} className={local.extra}>
              Continue your last space · {ROUTES[lastRoute].label}
            </Link>
          )}
          <button type="button" className={local.extra} onClick={startPause}>
            Today’s pause · {pause.minutes} min · {TECHNIQUES[pause.technique].label} breathing,{' '}
            {ENVIRONMENTS[pause.environment].name.toLowerCase()}
          </button>
        </div>
      </div>
    </div>
  );
}
