import { useEffect, useState, type CSSProperties, type ElementType } from 'react';
import styles from './FadeText.module.css';

interface FadeTextProps {
  text: string;
  as?: ElementType;
  className?: string;
  /** How long the old line takes to leave before the new one arrives. */
  exitMs?: number;
}

/** Text that never changes abruptly: the old line dissolves, then the new one arrives. */
export function FadeText({ text, as: Tag = 'p', className, exitMs = 700 }: FadeTextProps) {
  const [shown, setShown] = useState(text);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (text === shown) return;
    const start = window.setTimeout(() => setLeaving(true), 0);
    const swap = window.setTimeout(() => {
      setShown(text);
      setLeaving(false);
    }, exitMs);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(swap);
    };
  }, [text, shown, exitMs]);

  return (
    <Tag
      key={shown}
      className={`${styles.text} ${className ?? ''}`}
      data-leaving={leaving || undefined}
      style={{ '--exit': `${exitMs}ms` } as CSSProperties}
    >
      {shown}
    </Tag>
  );
}
