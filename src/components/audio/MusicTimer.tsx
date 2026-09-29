import { useEffect, useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { useT } from '../../i18n';
import {
  minutesLeft,
  MUSIC_TIMER_OPTIONS,
  musicTimerStore,
  setMusicTimer,
} from '../../store/musicTimer';
import { Segmented } from '../ui/Segmented';
import styles from './MusicPlayer.module.css';

/** "Stop after 15 / 30 / 60 min", with a quiet countdown once set. */
export function MusicTimer() {
  const t = useT();
  const { endsAt, minutes } = useStore(musicTimerStore);
  const [now, setNow] = useState(() => Date.now());

  // Minutes are enough precision; refresh twice a minute while a timer runs.
  useEffect(() => {
    if (endsAt === null) return;
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, [endsAt]);

  const options = [
    { value: 'off', label: t.sounds.timerOff },
    ...MUSIC_TIMER_OPTIONS.map((m) => ({ value: String(m), label: t.common.minutesShort(m) })),
  ];

  return (
    <div className={styles.timer}>
      <span className={styles.timerLabel}>{t.sounds.timerLabel}</span>
      <Segmented
        label={t.sounds.timerLabel}
        size="small"
        options={options}
        value={minutes === null ? 'off' : String(minutes)}
        onChange={(value) => {
          setNow(Date.now());
          setMusicTimer(value === 'off' ? null : Number(value));
        }}
      />
      {endsAt !== null && (
        <span className={styles.timerLeft} aria-live="polite">
          {t.sounds.stopsIn(minutesLeft(endsAt, now))}
        </span>
      )}
    </div>
  );
}
