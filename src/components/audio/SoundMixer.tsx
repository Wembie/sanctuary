import { setSoundEnabled } from '../../app/actions';
import { useStore } from '../../hooks/useStore';
import { useT } from '../../i18n';
import { SOUND_IDS, type SoundId } from '../../services/audio/catalog';
import { mixStore, setChannelVolume, toggleChannel } from '../../store/mix';
import { settingsStore } from '../../store/settings';
import { Icon } from '../ui/Icon';
import { Slider } from '../ui/Slider';
import styles from './SoundMixer.module.css';

/** Not a mixing desk: a handful of places you can turn up or down. */
export function SoundMixer({ disabled }: { disabled: boolean }) {
  const mix = useStore(mixStore);
  return (
    <ul className={styles.grid} data-disabled={disabled || undefined}>
      {SOUND_IDS.map((id) => (
        <SoundTile key={id} id={id} on={mix[id].on} volume={mix[id].volume} />
      ))}
    </ul>
  );
}

function SoundTile({ id, on, volume }: { id: SoundId; on: boolean; volume: number }) {
  const t = useT();
  const sound = t.sounds.items[id];
  return (
    <li className={styles.tile} data-on={on || undefined}>
      <button
        type="button"
        className={styles.toggle}
        aria-pressed={on}
        onClick={() => {
          toggleChannel(id);
          // Choosing a sound is a clear wish to hear it.
          if (!on && !settingsStore.get().soundEnabled) setSoundEnabled(true);
        }}
        title={sound.description}
      >
        <span className={styles.icon}>
          <Icon name={id} size={26} />
        </span>
        <span className={styles.label}>{sound.label}</span>
        <span className="sr-only">{sound.description}</span>
        <span className={styles.wave} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </button>
      <div className={styles.volume} inert={!on}>
        <Slider
          label={t.sounds.volume(sound.label)}
          value={volume}
          onChange={(value) => setChannelVolume(id, value)}
        />
      </div>
    </li>
  );
}
