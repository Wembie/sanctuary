import { useEffect, useState } from 'react';
import { Link } from '../components/navigation/Link';
import { DurationPicker, type DurationChoice } from '../components/session/DurationPicker';
import { SessionControls } from '../components/session/SessionControls';
import { FadeText } from '../components/ui/FadeText';
import { useReducedMotion } from '../hooks/usePreferences';
import { useImmersive } from '../hooks/useScene';
import { useT } from '../i18n';
import { useSession } from '../hooks/useSession';
import { minutes } from '../lib/timer';
import { audio } from '../services/audio/AudioManager';
import styles from './Page.module.css';

const PRESETS: readonly DurationChoice[] = [5, 10, 20, 30];
const LINE_MS = 4200;

export default function DisconnectPage() {
  const t = useT();
  const lines = t.disconnect.lines;
  const reduced = useReducedMotion();
  const [line, setLine] = useState(0);
  const [choice, setChoice] = useState<DurationChoice>(10);
  const session = useSession(() => audio.playChime());
  const active = session.status === 'running' || session.status === 'paused';
  const lineCount = lines.length;
  const ready = reduced || line >= lineCount - 1;
  useImmersive(active);

  useEffect(() => {
    if (line >= lineCount - 1) return;
    const timer = window.setTimeout(() => setLine((l) => l + 1), LINE_MS);
    return () => window.clearTimeout(timer);
  }, [line, lineCount]);

  if (session.status === 'complete') {
    return (
      <div className={`${styles.page} ${styles.center}`}>
        <div className={styles.stack}>
          <FadeText as="h1" text={t.disconnect.welcome} className={styles.display} />
          <p className={`${styles.lead} arrive`} style={{ animationDelay: '1.4s' }}>
            {t.common.takeYourTime}
          </p>
          <div className={`${styles.row} arrive`} style={{ animationDelay: '2.6s' }}>
            <Link to="/" className={styles.ghost}>
              {t.common.returnLabel}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (active) {
    // Nothing to read, nothing to watch. Just the place.
    return (
      <div className={`${styles.page} ${styles.center}`}>
        <h1 className="sr-only">{t.disconnect.activeHeading}</h1>
        <SessionControls session={session} endLabel={t.disconnect.comeBack} pausable={false} />
      </div>
    );
  }

  return (
    <div className={`${styles.page} ${styles.center}`}>
      <div className={`${styles.stack} ${styles.narrow}`}>
        <h1 className="sr-only">{t.disconnect.heading}</h1>
        <div
          style={{ minHeight: '6.5em', display: 'grid', placeItems: 'center' }}
          aria-live="polite"
        >
          <FadeText text={lines[line] ?? ''} className={styles.title} exitMs={900} />
        </div>
        {ready && (
          <div className={`${styles.stack} arrive`}>
            <DurationPicker
              label={t.disconnect.timeLabel}
              presets={PRESETS}
              value={choice}
              onChange={setChoice}
            />
            <button
              type="button"
              className={styles.action}
              onClick={() => session.start(minutes(choice ?? 10))}
            >
              {t.disconnect.start}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
