import { useState } from 'react';
import { selectEnvironment } from '../app/actions';
import { navigateTo } from '../app/navigation';
import { ROUTE_NAME, type RoutePath } from '../app/routes';
import { Link } from '../components/navigation/Link';
import { useStore } from '../hooks/useStore';
import { useT } from '../i18n';
import { getDailyPause } from '../lib/daily';
import { getDayPart } from '../lib/time';
import { experienceStore } from '../store/experience';
import { sceneStore } from '../store/scene';
import styles from './Page.module.css';
import local from './HomePage.module.css';

const NEEDS = [
  { need: 'calm', to: '/breathe' },
  { need: 'focus', to: '/focus' },
  { need: 'sleep', to: '/sleep' },
  { need: 'disconnect', to: '/disconnect' },
] as const satisfies readonly { need: string; to: RoutePath }[];

export default function HomePage() {
  const t = useT();
  // Read once: the greeting shouldn't change while you're looking at it.
  const [dayPart] = useState(() => getDayPart());
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
        <h1 className={`${styles.display} arrive`}>{t.greeting[dayPart]}</h1>
        <p className={`${styles.lead} arrive`} style={{ animationDelay: '300ms' }}>
          {t.home.question}
        </p>

        <ul className={local.needs}>
          {NEEDS.map(({ need, to }, i) => (
            <li key={to} className="arrive" style={{ animationDelay: `${600 + i * 120}ms` }}>
              <Link to={to} className={local.need}>
                <span className={local.needLabel}>{t.home.needs[need].label}</span>
                <span className={local.needHint}>{t.home.needs[need].hint}</span>
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
          {t.home.stay}
        </button>

        <div className={`${local.extras} arrive`} style={{ animationDelay: '1700ms' }}>
          {showContinue && (
            <Link to={lastRoute} className={local.extra}>
              {t.home.continueLast(t.routes[ROUTE_NAME[lastRoute]])}
            </Link>
          )}
          <button type="button" className={local.extra} onClick={startPause}>
            {t.home.dailyPause({
              minutes: pause.minutes,
              technique: t.breathe.techniques[pause.technique].label,
              place: t.explore.places[pause.environment].name,
            })}
          </button>
        </div>
      </div>
    </div>
  );
}
