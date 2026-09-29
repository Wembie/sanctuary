import { useEffect, useState } from 'react';
import { BreathingOrb } from '../components/breathing/BreathingOrb';
import { PatternEditor } from '../components/breathing/PatternEditor';
import { FadeText } from '../components/ui/FadeText';
import { Segmented } from '../components/ui/Segmented';
import { useReducedMotion } from '../hooks/usePreferences';
import { useStore } from '../hooks/useStore';
import { TECHNIQUES, type TechniqueId } from '../lib/breathing';
import { experienceStore } from '../store/experience';
import styles from './Page.module.css';
import local from './BreathePage.module.css';

const OPTIONS: { value: TechniqueId; label: string }[] = [
  { value: 'calm', label: 'Calm' },
  { value: 'box', label: 'Box' },
  { value: 'deep', label: 'Deep' },
  { value: 'custom', label: 'Custom' },
];

const SETTLE_MS = 3500;

export default function BreathePage() {
  const { technique, customPattern, showBreathTimer } = useStore(experienceStore);
  const reduced = useReducedMotion();
  const [settled, setSettled] = useState(false);
  const [paused, setPaused] = useState(false);
  const pattern = technique === 'custom' ? customPattern : TECHNIQUES[technique].pattern;
  const description =
    technique === 'custom' ? 'Your own rhythm.' : TECHNIQUES[technique].description;
  const running = settled && !paused;

  // A few seconds to arrive before the first breath.
  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(true), reduced ? 800 : SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || (e.target as Element | null)?.closest('button, input')) return;
      e.preventDefault();
      setPaused((p) => !p);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={`${styles.page} ${styles.center}`}>
      <h1 className="sr-only">Breathe</h1>

      <div className={`${styles.topBar} chrome`}>
        <Segmented
          label="Breathing technique"
          options={OPTIONS}
          value={technique}
          onChange={(value) => experienceStore.set({ technique: value })}
        />
        <p className={styles.muted}>{description}</p>
        {technique === 'custom' && (
          <PatternEditor
            pattern={customPattern}
            onChange={(next) => experienceStore.set({ customPattern: next })}
          />
        )}
      </div>

      <div className={local.stage}>
        {settled ? (
          <BreathingOrb
            pattern={pattern}
            running={running}
            onToggle={() => setPaused((p) => !p)}
            showTimer={showBreathTimer}
            reduced={reduced}
          />
        ) : (
          <div className={local.settling}>
            <div className={local.restingOrb} aria-hidden="true" />
            <FadeText text="Get comfortable." className={local.settleText} />
          </div>
        )}
      </div>

      <div className={`${local.footer} chrome`}>
        <button
          type="button"
          className={styles.ghost}
          aria-pressed={showBreathTimer}
          onClick={() => experienceStore.set({ showBreathTimer: !showBreathTimer })}
        >
          {showBreathTimer ? 'Hide time' : 'Show time'}
        </button>
      </div>
    </div>
  );
}
