import { setSoundEnabled } from '../../app/actions';
import { useStore } from '../../hooks/useStore';
import { useT } from '../../i18n';
import { ALL_TRACKS, type MusicTrack } from '../../services/audio/music/library';
import { trackText } from '../../services/audio/music/trackText';
import { musicStore } from '../../store/music';
import { settingsStore } from '../../store/settings';
import { Icon } from '../ui/Icon';
import { Slider } from '../ui/Slider';
import { MusicTimer } from './MusicTimer';
import styles from './MusicPlayer.module.css';

/** One track at a time. Tapping the playing one stops it. */
export function MusicPlayer() {
  const t = useT();
  const { trackId, volume } = useStore(musicStore);

  const toggle = (track: MusicTrack) => {
    const next = trackId === track.id ? null : track.id;
    musicStore.set({ trackId: next });
    // Choosing music is a clear wish to hear it.
    if (next && !settingsStore.get().soundEnabled) setSoundEnabled(true);
  };

  return (
    <div className={styles.player}>
      <div className={styles.volume}>
        <Slider
          label={t.sounds.musicVolume}
          showLabel
          value={volume}
          onChange={(value) => musicStore.set({ volume: value })}
        />
      </div>

      {trackId !== null && <MusicTimer />}

      <ul className={styles.list}>
        {ALL_TRACKS.map((track) => {
          const playing = trackId === track.id;
          const { title, detail } = trackText(t, track);
          return (
            <li key={track.id}>
              <button
                type="button"
                className={styles.track}
                aria-pressed={playing}
                aria-label={playing ? t.sounds.stop(title) : t.sounds.play(title)}
                onClick={() => toggle(track)}
              >
                <span className={styles.control} aria-hidden="true">
                  <Icon name={playing ? 'pause' : 'play'} size={16} />
                </span>
                <span className={styles.text}>
                  <span className={styles.category}>
                    {t.sounds.categories[track.category]}
                    {track.kind === 'generative' && ` · ${t.sounds.live}`}
                  </span>
                  <span className={styles.title}>{title}</span>
                  <span className={styles.detail}>{detail}</span>
                </span>
                <span className={styles.wave} aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
