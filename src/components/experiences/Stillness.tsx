import { useEffect, useState } from 'react';
import { useT } from '../../i18n';
import { sceneSignals, sceneStore } from '../../store/scene';
import styles from './Stillness.module.css';

/**
 * "Do nothing" mode. One sentence, then the interface leaves entirely.
 * Much later, a second sentence. Then only the place remains.
 */
type Line = 'first' | 'second' | null;
const SCRIPT: { at: number; line: Line }[] = [
  { at: 0, line: 'first' },
  { at: 6000, line: null },
  { at: 40_000, line: 'second' },
  { at: 46_000, line: null },
];

export function Stillness() {
  const t = useT();
  const [line, setLine] = useState<Line>(null);
  const text = line ? t.stillness[line] : null;

  useEffect(() => {
    const timers = SCRIPT.map(({ at, line: next }) =>
      window.setTimeout(() => setLine(next), at + 400),
    );
    // A very slow visual breath in the particles, with no orb to watch.
    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      sceneSignals.breath = (1 - Math.cos(((now - start) / 12_000) * Math.PI * 2)) / 2;
      raf = requestAnimationFrame(loop);
    };
    sceneSignals.breathing = true;
    raf = requestAnimationFrame(loop);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') sceneStore.set({ stillness: false });
    };
    window.addEventListener('keydown', onKey);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      cancelAnimationFrame(raf);
      sceneSignals.breathing = false;
      sceneSignals.breath = 0;
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className={styles.stillness}>
      <p className={styles.line} data-visible={text !== null || undefined} aria-live="polite">
        {text}
      </p>
      <button
        type="button"
        className={`${styles.return} chrome`}
        onClick={() => sceneStore.set({ stillness: false })}
      >
        {t.common.returnLabel}
      </button>
    </div>
  );
}
