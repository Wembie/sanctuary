import type { SessionView } from '../../hooks/useSession';
import { useT } from '../../i18n';
import { Icon } from '../ui/Icon';
import styles from './Session.module.css';

interface SessionControlsProps {
  session: SessionView;
  /** Defaults to the translated "End". */
  endLabel?: string;
  pausable?: boolean;
  /** Replaces the default "end the session" action. */
  onEnd?: () => void;
}

/** Pause and end, fading away with the rest of the interface. */
export function SessionControls({
  session,
  endLabel,
  pausable = true,
  onEnd,
}: SessionControlsProps) {
  const t = useT();
  const paused = session.status === 'paused';
  const toggleLabel = paused ? t.common.resume : t.common.pause;
  return (
    <div className={`${styles.controls} chrome`}>
      {pausable && (
        <button
          type="button"
          className={styles.control}
          onClick={paused ? session.resume : session.pause}
          aria-label={toggleLabel}
          title={toggleLabel}
        >
          <Icon name={paused ? 'play' : 'pause'} size={18} />
        </button>
      )}
      <button type="button" className={styles.endButton} onClick={onEnd ?? session.end}>
        {endLabel ?? t.common.end}
      </button>
    </div>
  );
}
