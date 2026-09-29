import { useEffect, useState } from 'react';
import { DurationPicker, type DurationChoice } from '../components/session/DurationPicker';
import { SessionControls } from '../components/session/SessionControls';
import { FadeText } from '../components/ui/FadeText';
import { useImmersive, useSceneIntensityReset } from '../hooks/useScene';
import { useSession } from '../hooks/useSession';
import { useT } from '../i18n';
import { minutes } from '../lib/timer';
import { sleepFade } from '../lib/sleep';
import { audio } from '../services/audio/AudioManager';
import { sceneStore } from '../store/scene';
import styles from './Page.module.css';
import local from './SleepPage.module.css';

const PRESETS: readonly DurationChoice[] = [15, 30, 60, 90, null];

export default function SleepPage() {
  const t = useT();
  const [choice, setChoice] = useState<DurationChoice>(30);
  const session = useSession();
  const active = session.status === 'running' || session.status === 'paused';
  useImmersive(active || session.status === 'complete');
  useSceneIntensityReset();

  // The whole world dims with the session: light first, sound only at the end.
  useEffect(() => {
    if (session.status === 'idle') return;
    const { intensity, volume } = sleepFade(session.elapsed, session.duration);
    const rounded = Math.round(intensity * 100) / 100;
    if (sceneStore.get().intensity !== rounded) sceneStore.set({ intensity: rounded });
    audio.setMasterScale(volume, 3);
  }, [session.elapsed, session.duration, session.status]);

  // Leaving sleep brings the light and sound back slowly.
  useEffect(
    () => () => {
      audio.setMasterScale(1, 4);
    },
    [],
  );

  const wake = () => {
    sceneStore.set({ intensity: 1 });
    audio.setMasterScale(1, 4);
    session.reset();
  };

  if (session.status === 'complete') {
    return (
      <div className={`${styles.page} ${styles.center}`}>
        <div className={local.goodnight}>
          <FadeText as="h1" text={t.sleep.goodnight} className={styles.title} />
        </div>
        <div className={`${styles.bottomBar} chrome`}>
          <button type="button" className={styles.ghost} onClick={wake}>
            {t.sleep.awake}
          </button>
        </div>
      </div>
    );
  }

  if (active) {
    return (
      <div className={`${styles.page} ${styles.center}`}>
        <h1 className="sr-only">{t.sleep.sessionHeading}</h1>
        <div className={local.moon} aria-hidden="true" />
        <div className={local.whisper}>
          <FadeText text={t.sleep.whisper} className={styles.lead} />
        </div>
        <SessionControls session={session} endLabel={t.sleep.wake} pausable={false} onEnd={wake} />
      </div>
    );
  }

  return (
    <div className={`${styles.page} ${styles.center}`}>
      <div className={`${styles.stack} ${styles.narrow}`}>
        <header className={`${styles.stack} arrive`}>
          <h1 className={styles.display}>{t.sleep.title}</h1>
          <p className={styles.lead}>{t.sleep.lead}</p>
        </header>
        <div className="arrive" style={{ animationDelay: '150ms' }}>
          <DurationPicker
            label={t.sleep.fadeLabel}
            presets={PRESETS}
            value={choice}
            onChange={setChoice}
          />
        </div>
        <button
          type="button"
          className={`${styles.action} arrive`}
          style={{ animationDelay: '300ms' }}
          onClick={() => session.start(choice === null ? null : minutes(choice))}
        >
          {t.common.begin}
        </button>
        <p className={`${styles.muted} arrive`} style={{ animationDelay: '450ms' }}>
          {t.sleep.hint}
        </p>
      </div>
    </div>
  );
}
