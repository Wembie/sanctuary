import { useState } from 'react';
import { DurationPicker, type DurationChoice } from '../components/session/DurationPicker';
import { SessionControls } from '../components/session/SessionControls';
import { FadeText } from '../components/ui/FadeText';
import { useImmersive } from '../hooks/useScene';
import { useSession } from '../hooks/useSession';
import { useT } from '../i18n';
import { minutes } from '../lib/timer';
import styles from './Page.module.css';
import local from './SleepPage.module.css';

const PRESETS: readonly DurationChoice[] = [15, 30, 60, 90, null];

export default function SleepPage() {
  const t = useT();
  const [choice, setChoice] = useState<DurationChoice>(30);
  const session = useSession('sleep');
  const { active } = session;
  useImmersive(active || session.status === 'complete');

  // Light and sound come back slowly (see useSleepFade); the session simply ends.
  const wake = session.reset;

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
