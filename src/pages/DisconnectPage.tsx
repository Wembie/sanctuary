import { useEffect, useState } from 'react';
import { Link } from '../components/navigation/Link';
import { DurationPicker, type DurationChoice } from '../components/session/DurationPicker';
import { SessionControls } from '../components/session/SessionControls';
import { FadeText } from '../components/ui/FadeText';
import { useReducedMotion } from '../hooks/usePreferences';
import { useImmersive } from '../hooks/useScene';
import { useSession } from '../hooks/useSession';
import { minutes } from '../lib/timer';
import { audio } from '../services/audio/AudioManager';
import styles from './Page.module.css';

const PRESETS: readonly DurationChoice[] = [5, 10, 20, 30];
const LINES = ['Put your phone down.', 'You don’t need to check anything right now.'];
const LINE_MS = 4200;

export default function DisconnectPage() {
  const reduced = useReducedMotion();
  const [line, setLine] = useState(0);
  const [choice, setChoice] = useState<DurationChoice>(10);
  const session = useSession(() => audio.playChime());
  const active = session.status === 'running' || session.status === 'paused';
  const ready = reduced || line >= LINES.length - 1;
  useImmersive(active);

  useEffect(() => {
    if (line >= LINES.length - 1) return;
    const timer = window.setTimeout(() => setLine((l) => l + 1), LINE_MS);
    return () => window.clearTimeout(timer);
  }, [line]);

  if (session.status === 'complete') {
    return (
      <div className={`${styles.page} ${styles.center}`}>
        <div className={styles.stack}>
          <FadeText as="h1" text="Welcome back." className={styles.display} />
          <p className={`${styles.lead} arrive`} style={{ animationDelay: '1.4s' }}>
            Take your time.
          </p>
          <div className={`${styles.row} arrive`} style={{ animationDelay: '2.6s' }}>
            <Link to="/" className={styles.ghost}>
              Return
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
        <h1 className="sr-only">Disconnected. The session ends on its own.</h1>
        <SessionControls session={session} endLabel="Come back" pausable={false} />
      </div>
    );
  }

  return (
    <div className={`${styles.page} ${styles.center}`}>
      <div className={`${styles.stack} ${styles.narrow}`}>
        <h1 className="sr-only">Disconnect</h1>
        <div
          style={{ minHeight: '6.5em', display: 'grid', placeItems: 'center' }}
          aria-live="polite"
        >
          <FadeText text={LINES[line] ?? ''} className={styles.title} exitMs={900} />
        </div>
        {ready && (
          <div className={`${styles.stack} arrive`}>
            <DurationPicker
              label="Time away"
              presets={PRESETS}
              value={choice}
              onChange={setChoice}
            />
            <button
              type="button"
              className={styles.action}
              onClick={() => session.start(minutes(choice ?? 10))}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
