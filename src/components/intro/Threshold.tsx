import { useEffect, useState } from 'react';
import { setSoundEnabled } from '../../app/actions';
import { useReducedMotion } from '../../hooks/usePreferences';
import { audio } from '../../services/audio/AudioManager';
import { settingsStore } from '../../store/settings';
import { FadeText } from '../ui/FadeText';
import styles from './Intro.module.css';

interface ThresholdProps {
  firstVisit: boolean;
  onEnter: () => void;
}

const FIRST_VISIT = [
  'Take a breath.',
  'You’re safe here.',
  'This place is yours.',
  'There are no goals here.',
  'Take what you need.',
];
const RETURNING = ['Welcome back.', 'Take a breath.', 'You’re safe here.'];

const LINE_MS = 3600;
const DOOR_AFTER_LINES = 2;
const ENTER_MS = 1600;

/**
 * The door into the sanctuary. A few quiet lines, then a way in.
 * Choosing sound here is the user gesture that lets audio start at all.
 */
export function Threshold({ firstVisit, onEnter }: ThresholdProps) {
  const reduced = useReducedMotion();
  const lines = firstVisit ? FIRST_VISIT : RETURNING;
  const [index, setIndex] = useState(0);
  const [entering, setEntering] = useState(false);
  const doorVisible = reduced || index >= DOOR_AFTER_LINES - 1;

  useEffect(() => {
    if (index >= lines.length - 1) return;
    const timer = window.setTimeout(() => setIndex((i) => i + 1), LINE_MS);
    return () => window.clearTimeout(timer);
  }, [index, lines.length]);

  const enter = (withSound: boolean) => {
    if (entering) return;
    if (withSound) setSoundEnabled(true);
    else settingsStore.set({ soundEnabled: false });
    setEntering(true);
    window.setTimeout(onEnter, reduced ? 200 : ENTER_MS);
  };

  return (
    <div className={styles.threshold} data-entering={entering || undefined}>
      <h1 className="sr-only">Sanctuary</h1>
      <div className={styles.lines} aria-live="polite">
        <FadeText text={lines[index] ?? ''} className={styles.line} exitMs={900} />
      </div>

      <div className={styles.doorway} data-visible={doorVisible || undefined} inert={!doorVisible}>
        <button
          type="button"
          className={styles.door}
          onClick={() => enter(audio.supported)}
          aria-describedby="door-hint"
        >
          <span className={styles.arch} aria-hidden="true">
            <span className={styles.archLight} />
          </span>
          <span className={styles.doorLabel}>Enter Sanctuary</span>
        </button>
        {audio.supported && (
          <>
            <p id="door-hint" className={styles.hint}>
              with sound · headphones recommended
            </p>
            <button type="button" className={styles.silent} onClick={() => enter(false)}>
              or enter in silence
            </button>
          </>
        )}
      </div>
    </div>
  );
}
