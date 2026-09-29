import {
  PATTERN_LIMITS,
  PHASE_LABEL,
  PHASE_ORDER,
  sanitizePattern,
  type BreathPattern,
} from '../../lib/breathing';
import styles from './PatternEditor.module.css';

interface PatternEditorProps {
  pattern: BreathPattern;
  onChange: (pattern: BreathPattern) => void;
}

/** Four small steppers. Seconds only: no one needs to breathe in half-seconds. */
export function PatternEditor({ pattern, onChange }: PatternEditorProps) {
  return (
    <fieldset className={styles.editor}>
      <legend className="sr-only">Custom rhythm, in seconds</legend>
      {PHASE_ORDER.map((phase) => {
        const value = pattern[phase];
        const min = phase === 'inhale' || phase === 'exhale' ? 1 : PATTERN_LIMITS.min;
        const set = (next: number) => onChange(sanitizePattern({ ...pattern, [phase]: next }));
        return (
          <div key={phase} className={styles.field}>
            <span className={styles.label} id={`pattern-${phase}`}>
              {PHASE_LABEL[phase]}
            </span>
            <div className={styles.stepper} role="group" aria-labelledby={`pattern-${phase}`}>
              <button
                type="button"
                onClick={() => set(value - 1)}
                disabled={value <= min}
                aria-label={`Shorter ${PHASE_LABEL[phase].toLowerCase()}`}
              >
                −
              </button>
              <output aria-live="polite">{value}s</output>
              <button
                type="button"
                onClick={() => set(value + 1)}
                disabled={value >= PATTERN_LIMITS.max}
                aria-label={`Longer ${PHASE_LABEL[phase].toLowerCase()}`}
              >
                +
              </button>
            </div>
          </div>
        );
      })}
    </fieldset>
  );
}
