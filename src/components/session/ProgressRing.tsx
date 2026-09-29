import type { ReactNode } from 'react';
import styles from './Session.module.css';

interface ProgressRingProps {
  /** 0 – 1 */
  progress: number;
  children?: ReactNode;
  size?: number;
}

const STROKE = 1.5;

/** A hairline circle that slowly closes. Informative, never insistent. */
export function ProgressRing({ progress, children, size = 280 }: ProgressRingProps) {
  const r = size / 2 - STROKE * 4;
  const circumference = 2 * Math.PI * r;
  return (
    <div className={styles.ring} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          className={styles.ringTrack}
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={STROKE}
        />
        <circle
          className={styles.ringValue}
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={STROKE}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
        />
      </svg>
      <div className={styles.ringContent}>{children}</div>
    </div>
  );
}
