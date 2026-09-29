import type { CSSProperties } from 'react';
import { selectEnvironment } from '../app/actions';
import { useStore } from '../hooks/useStore';
import { experienceStore } from '../store/experience';
import { ENVIRONMENT_IDS, ENVIRONMENTS } from '../themes/environments';
import styles from './Page.module.css';
import local from './ExplorePage.module.css';

export default function ExplorePage() {
  const current = useStore(experienceStore, (s) => s.environment);

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <header className={`${styles.header} arrive`}>
          <h1 className={styles.display}>Somewhere else.</h1>
          <p className={styles.lead}>Each place has its own light and its own sound.</p>
        </header>

        <ul className={local.places} role="list">
          {ENVIRONMENT_IDS.map((id, index) => {
            const env = ENVIRONMENTS[id];
            const here = id === current;
            const swatch = {
              '--sw-top': env.palette.bgTop,
              '--sw-bottom': env.palette.horizon,
              '--sw-glow': env.palette.glow,
              '--sw-accent': env.palette.accent,
              animationDelay: `${index * 90}ms`,
            } as CSSProperties;
            return (
              <li key={id} className="arrive" style={swatch}>
                <button
                  type="button"
                  className={local.place}
                  aria-pressed={here}
                  onClick={() => selectEnvironment(id)}
                >
                  <span className={local.swatch} aria-hidden="true" />
                  <span className={local.text}>
                    <span className={local.name}>{env.name}</span>
                    <span className={local.line}>{env.line}</span>
                  </span>
                  <span className={local.here} aria-hidden={!here}>
                    {here ? 'You are here' : ''}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className={`${local.tip} arrive`}>Touch the empty sky. It answers, quietly.</p>
      </div>
    </div>
  );
}
