import { Link } from '../components/navigation/Link';
import { DurationPicker } from '../components/session/DurationPicker';
import { ProgressRing } from '../components/session/ProgressRing';
import { SessionControls } from '../components/session/SessionControls';
import sessionStyles from '../components/session/Session.module.css';
import { FadeText } from '../components/ui/FadeText';
import { useImmersive } from '../hooks/useScene';
import { useSession } from '../hooks/useSession';
import { useStore } from '../hooks/useStore';
import { useWakeLock } from '../hooks/useWakeLock';
import { useT } from '../i18n';
import { formatClock, minutes, remainingMs, sessionProgress } from '../lib/timer';
import { audio } from '../services/audio/AudioManager';
import { experienceStore } from '../store/experience';
import styles from './Page.module.css';

const PRESETS = [25, 45, 60] as const;

export default function FocusPage() {
  const t = useT();
  const focusMinutes = useStore(experienceStore, (s) => s.focusMinutes);
  const session = useSession(() => audio.playChime());
  const active = session.status === 'running' || session.status === 'paused';
  useImmersive(active);
  // The clock should stay visible for the whole session; paused sessions let the screen rest.
  useWakeLock(session.status === 'running');

  if (session.status === 'complete') {
    return (
      <div className={`${styles.page} ${styles.center}`}>
        <div className={styles.stack}>
          <FadeText as="h1" text={t.focus.done} className={styles.display} />
          <p className={`${styles.lead} arrive`} style={{ animationDelay: '1.2s' }}>
            {t.common.takeYourTime}
          </p>
          <div className={`${styles.row} arrive`} style={{ animationDelay: '2.4s' }}>
            <button type="button" className={styles.action} onClick={session.reset}>
              {t.focus.another}
            </button>
            <Link to="/breathe" className={styles.ghost}>
              {t.focus.breatheAWhile}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (active && session.duration !== null) {
    const left = remainingMs(session.duration, session.elapsed);
    return (
      <div className={`${styles.page} ${styles.center}`}>
        <h1 className="sr-only">{t.focus.sessionHeading}</h1>
        <div className="arrive">
          <ProgressRing progress={sessionProgress(session.duration, session.elapsed)}>
            <span className={sessionStyles.clock} role="timer" aria-live="off">
              {formatClock(left)}
            </span>
            <span className={sessionStyles.clockLabel}>
              {session.status === 'paused' ? t.focus.paused : t.focus.running}
            </span>
          </ProgressRing>
        </div>
        <SessionControls session={session} />
      </div>
    );
  }

  return (
    <div className={`${styles.page} ${styles.center}`}>
      <div className={`${styles.stack} ${styles.narrow}`}>
        <header className={`${styles.stack} arrive`}>
          <h1 className={styles.display}>{t.focus.title}</h1>
          <p className={styles.lead}>{t.focus.lead}</p>
        </header>
        <div className="arrive" style={{ animationDelay: '150ms' }}>
          <DurationPicker
            label={t.focus.lengthLabel}
            presets={PRESETS}
            value={focusMinutes}
            custom={{ min: 1, max: 180 }}
            onChange={(value) => value !== null && experienceStore.set({ focusMinutes: value })}
          />
        </div>
        <button
          type="button"
          className={`${styles.action} arrive`}
          style={{ animationDelay: '300ms' }}
          onClick={() => session.start(minutes(focusMinutes))}
        >
          {t.common.begin}
        </button>
        <p className={`${styles.muted} arrive`} style={{ animationDelay: '450ms' }}>
          {t.focus.hint}
        </p>
      </div>
    </div>
  );
}
