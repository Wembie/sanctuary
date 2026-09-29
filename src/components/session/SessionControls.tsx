import type { Session } from '../../hooks/useSession';
import { Icon } from '../ui/Icon';
import styles from './Session.module.css';

interface SessionControlsProps {
  session: Session;
  endLabel?: string;
  pausable?: boolean;
  /** Replaces the default "end the session" action. */
  onEnd?: () => void;
}

/** Pause and end, fading away with the rest of the interface. */
export function SessionControls({
  session,
  endLabel = 'End',
  pausable = true,
  onEnd,
}: SessionControlsProps) {
  const paused = session.status === 'paused';
  return (
    <div className={`${styles.controls} chrome`}>
      {pausable && (
        <button
          type="button"
          className={styles.control}
          onClick={paused ? session.resume : session.pause}
          aria-label={paused ? 'Resume' : 'Pause'}
          title={paused ? 'Resume' : 'Pause'}
        >
          <Icon name={paused ? 'play' : 'pause'} size={18} />
        </button>
      )}
      <button type="button" className={styles.endButton} onClick={onEnd ?? session.end}>
        {endLabel}
      </button>
    </div>
  );
}
