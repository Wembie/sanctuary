import type { CSSProperties } from 'react';
import { selectEnvironment } from '../app/actions';
import { useStore } from '../hooks/useStore';
import { useT } from '../i18n';
import { experienceStore } from '../store/experience';
import { ENVIRONMENT_IDS, ENVIRONMENTS } from '../themes/environments';
import styles from './Page.module.css';
import local from './ExplorePage.module.css';

export default function ExplorePage() {
  const t = useT();
  const current = useStore(experienceStore, (s) => s.environment);

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <header className={`${styles.header} arrive`}>
          <h1 className={styles.display}>{t.explore.title}</h1>
          <p className={styles.lead}>{t.explore.lead}</p>
        </header>

        <ul className={local.places} role="list">
          {ENVIRONMENT_IDS.map((id, index) => {
            const { palette } = ENVIRONMENTS[id];
            const place = t.explore.places[id];
            const here = id === current;
            const swatch = {
              '--sw-top': palette.bgTop,
              '--sw-bottom': palette.horizon,
              '--sw-glow': palette.glow,
              '--sw-accent': palette.accent,
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
                    <span className={local.name}>{place.name}</span>
                    <span className={local.line}>{place.line}</span>
                  </span>
                  <span className={local.here} aria-hidden={!here}>
                    {here ? t.explore.here : ''}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className={`${local.tip} arrive`}>{t.explore.tip}</p>
      </div>
    </div>
  );
}
