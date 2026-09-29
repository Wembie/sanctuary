import { useEffect, useRef } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useLowPerformance, useReducedMotion } from '../../hooks/usePreferences';
import styles from './CalmCursor.module.css';

const INTERACTIVE = 'a, button, input, select, [role="switch"], [role="radio"], [data-cursor]';

/**
 * A small dot with a halo that follows slowly behind.
 * Only on fine pointers, never with reduced motion or in light performance mode.
 */
export function CalmCursor() {
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');
  const reduced = useReducedMotion();
  const low = useLowPerformance();
  const enabled = finePointer && !reduced && !low;

  if (!enabled) return null;
  return <CursorLayer />;
}

function CursorLayer() {
  const dotRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const halo = haloRef.current;
    if (!dot || !halo) return;
    const root = document.documentElement;
    root.classList.add(styles.hideNative ?? '');

    const target = { x: -100, y: -100 };
    const trail = { x: -100, y: -100 };
    let raf = 0;
    let moving = false;

    const render = () => {
      trail.x += (target.x - trail.x) * 0.14;
      trail.y += (target.y - trail.y) * 0.14;
      dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
      halo.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0)`;
      // Stop the loop once the halo has caught up: no work while the mouse rests.
      if (Math.abs(target.x - trail.x) + Math.abs(target.y - trail.y) > 0.2) {
        raf = requestAnimationFrame(render);
      } else {
        moving = false;
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      target.x = e.clientX;
      target.y = e.clientY;
      root.dataset.cursor = 'visible';
      const over = (e.target as Element | null)?.closest(INTERACTIVE);
      halo.dataset.hover = over ? 'true' : 'false';
      if (!moving) {
        moving = true;
        raf = requestAnimationFrame(render);
      }
    };
    const onDown = () => (halo.dataset.pressed = 'true');
    const onUp = () => (halo.dataset.pressed = 'false');
    const onLeave = () => delete root.dataset.cursor;

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    root.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      root.removeEventListener('pointerleave', onLeave);
      root.classList.remove(styles.hideNative ?? '');
      delete root.dataset.cursor;
    };
  }, []);

  return (
    <div className={styles.layer} aria-hidden="true">
      <div ref={haloRef} className={styles.halo} />
      <div ref={dotRef} className={styles.dot} />
    </div>
  );
}
