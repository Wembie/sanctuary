import { useEffect, useRef, useState } from 'react';
import { getBreathState, type BreathPattern, type BreathPhase } from '../../lib/breathing';
import { useT } from '../../i18n';
import { useAnimationFrame } from '../../hooks/useAnimationFrame';
import { formatClock, Stopwatch } from '../../lib/timer';
import { sceneSignals } from '../../store/scene';
import styles from './BreathingOrb.module.css';

interface BreathingOrbProps {
  pattern: BreathPattern;
  running: boolean;
  onToggle: () => void;
  showTimer: boolean;
  reduced: boolean;
}

/**
 * The orb fills and empties with the breath. Geometry updates through a CSS
 * variable every frame; React only re-renders when the phase word changes.
 */
export function BreathingOrb({
  pattern,
  running,
  onToggle,
  showTimer,
  reduced,
}: BreathingOrbProps) {
  const t = useT();
  const orbRef = useRef<HTMLButtonElement>(null);
  const watch = useRef(new Stopwatch());
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [seconds, setSeconds] = useState(pattern.inhale);
  const [clock, setClock] = useState('00:00');

  // A new pattern starts a fresh cycle from an empty breath.
  useEffect(() => {
    const wasRunning = watch.current.running;
    watch.current.reset();
    if (wasRunning) watch.current.start();
  }, [pattern]);

  useEffect(() => {
    if (running) watch.current.start();
    else watch.current.pause();
    sceneSignals.breathing = running;
    return () => {
      sceneSignals.breathing = false;
      sceneSignals.breath = 0;
    };
  }, [running]);

  useAnimationFrame(() => {
    const elapsed = watch.current.elapsed();
    const state = getBreathState(pattern, elapsed);
    sceneSignals.breath = state.expansion;
    orbRef.current?.style.setProperty('--expansion', state.expansion.toFixed(4));
    setPhase((prev) => (prev === state.phase ? prev : state.phase));
    setSeconds((prev) => (prev === state.secondsLeft ? prev : state.secondsLeft));
    const nextClock = formatClock(elapsed, { roundUp: false });
    setClock((prev) => (prev === nextClock ? prev : nextClock));
  }, running);

  return (
    <div className={styles.wrap} data-reduced={reduced || undefined}>
      <button
        ref={orbRef}
        type="button"
        className={styles.orb}
        data-phase={phase}
        data-running={running || undefined}
        onClick={onToggle}
        aria-label={running ? t.breathe.pauseAria : t.breathe.resumeAria}
      >
        <span className={styles.halo} aria-hidden="true" />
        <span className={styles.core} aria-hidden="true" />
      </button>

      <div className={styles.caption} aria-live="polite" aria-atomic="true">
        <span key={running ? phase : 'paused'} className={styles.phase}>
          {running ? t.breathe.phases[phase] : t.breathe.paused}
        </span>
        {reduced && running && (
          <span className={styles.count} aria-hidden="true">
            {seconds}
          </span>
        )}
      </div>

      {showTimer && (
        <p className={styles.timer} aria-label={t.breathe.timerAria(clock)}>
          {clock}
        </p>
      )}
    </div>
  );
}
