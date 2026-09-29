import { useEffect, useRef, useState } from 'react';
import { AmbientEngine } from '../../lib/ambient/engine';
import { useLowPerformance, useReducedMotion } from '../../hooks/usePreferences';
import { useStore } from '../../hooks/useStore';
import { audio } from '../../services/audio/AudioManager';
import { experienceStore } from '../../store/experience';
import { sceneSignals, sceneStore } from '../../store/scene';
import { settingsStore } from '../../store/settings';
import { getEnvironment } from '../../themes/environments';
import styles from './AmbientBackground.module.css';

/** Anything that should never trigger a background pulse. */
const INTERACTIVE =
  'a, button, input, select, textarea, label, dialog, [role="dialog"], [data-no-pulse]';

/**
 * The scene behind everything: a CSS sky (gradients, aurora, mist, grain)
 * and one canvas of particles. If canvas is unavailable the CSS layers
 * alone still make a complete, calm background.
 */
export function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<AmbientEngine | null>(null);
  const [canvasFailed, setCanvasFailed] = useState(false);
  const environmentId = useStore(experienceStore, (s) => s.environment);
  const particles = useStore(settingsStore, (s) => s.particles);
  const intensity = useStore(sceneStore, (s) => s.intensity);
  const reduced = useReducedMotion();
  const lowPerformance = useLowPerformance();
  const environment = getEnvironment(environmentId);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let engine: AmbientEngine;
    try {
      engine = new AmbientEngine(canvas, {
        breath: () => (sceneSignals.breathing ? sceneSignals.breath : null),
        level: () => audio.getLevel(),
      });
    } catch {
      // Draw the CSS scene only: still beautiful, never blank.
      queueMicrotask(() => setCanvasFailed(true));
      return;
    }
    engineRef.current = engine;
    engine.onDegrade = () => document.documentElement.setAttribute('data-performance', 'low');

    const onPointerMove = (e: PointerEvent) => engine.setPointer(e.clientX, e.clientY, true);
    const onPointerLeave = () => engine.setPointer(0, 0, false);
    // A finger that lifts is gone; a mouse that stops is still there.
    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') onPointerLeave();
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (target?.closest(INTERACTIVE)) return;
      engine.pulse(e.clientX, e.clientY);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerUp, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('blur', onPointerLeave);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('blur', onPointerLeave);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.configure({
      quality: lowPerformance ? 'low' : 'high',
      reduced,
      enabled: particles,
    });
  }, [lowPerformance, reduced, particles]);

  useEffect(() => {
    const { palette, particles: preset } = environment;
    engineRef.current?.setPreset({
      kind: preset.kind,
      density: preset.density,
      particle: palette.particle,
      glow: palette.glow,
      accent: palette.accent,
    });
  }, [environment]);

  useEffect(() => {
    engineRef.current?.setIntensity(intensity);
  }, [intensity]);

  return (
    <div className={styles.scene} data-env={environment.id} aria-hidden="true">
      <div className={styles.sky} />
      <div className={styles.aurora}>
        <span className={styles.auroraA} />
        <span className={styles.auroraB} />
      </div>
      <div className={styles.rays} />
      {!canvasFailed && <canvas ref={canvasRef} className={styles.canvas} />}
      <div className={styles.mist} />
      <div className={styles.vignette} />
      <div className={styles.grain} />
      <div className={styles.dim} style={{ opacity: 1 - intensity }} />
    </div>
  );
}
