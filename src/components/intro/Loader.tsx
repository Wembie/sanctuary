import { useEffect, useState } from 'react';
import styles from './Intro.module.css';

interface LoaderProps {
  /** Resolves when the first page and fonts are ready. */
  ready: Promise<unknown>;
  onDone: () => void;
}

const MIN_MS = 1800;
const EXIT_MS = 900;

/** Never "Loading...": a small sphere breathing while the space gets ready. */
export function Loader({ ready, onDone }: LoaderProps) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let exitTimer: number | undefined;
    const minimum = new Promise((resolve) => window.setTimeout(resolve, MIN_MS));
    // Whatever happens, the space opens: a failed preload must not trap anyone here.
    const safety = new Promise((resolve) => window.setTimeout(resolve, 6000));
    void Promise.race([Promise.all([minimum, ready.catch(() => undefined)]), safety]).then(() => {
      if (cancelled) return;
      setLeaving(true);
      exitTimer = window.setTimeout(onDone, EXIT_MS);
    });
    return () => {
      cancelled = true;
      window.clearTimeout(exitTimer);
    };
  }, [ready, onDone]);

  return (
    <div className={styles.loader} data-leaving={leaving || undefined} role="status">
      <div className={styles.loaderOrb} aria-hidden="true" />
      <p className={styles.loaderText}>preparing your space…</p>
    </div>
  );
}
