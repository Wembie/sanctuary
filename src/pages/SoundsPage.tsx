import { setSoundEnabled } from '../app/actions';
import { SoundMixer } from '../components/audio/SoundMixer';
import { Icon } from '../components/ui/Icon';
import { Slider } from '../components/ui/Slider';
import { useStore } from '../hooks/useStore';
import { audio } from '../services/audio/AudioManager';
import { MUSIC_TRACKS } from '../services/audio/catalog';
import { settingsStore } from '../store/settings';
import styles from './Page.module.css';
import local from './SoundsPage.module.css';

export default function SoundsPage() {
  const { soundEnabled, masterVolume } = useStore(settingsStore);

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <header className={`${styles.header} arrive`}>
          <h1 className={styles.display}>Listen.</h1>
          <p className={styles.lead}>Layer a few sounds until the room feels right.</p>
        </header>

        {!audio.supported ? (
          <p className={`${local.notice} arrive`}>
            Sound isn’t available in this browser. The rest of the sanctuary still is.
          </p>
        ) : (
          <>
            <div className={`${local.master} arrive`}>
              <button
                type="button"
                className={styles.action}
                aria-pressed={soundEnabled}
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                <Icon name={soundEnabled ? 'soundOn' : 'soundOff'} size={18} />
                {soundEnabled ? 'Sound on' : 'Turn sound on'}
              </button>
              <div className={local.masterSlider}>
                <Slider
                  label="Master volume"
                  value={masterVolume}
                  disabled={!soundEnabled}
                  onChange={(value) => settingsStore.set({ masterVolume: value })}
                />
              </div>
            </div>

            <section aria-label="Ambient sounds" className="arrive">
              <SoundMixer disabled={!soundEnabled} />
              <p className={local.saved}>Your mix is remembered on this device.</p>
            </section>
          </>
        )}

        <section className={`${local.music} arrive`} aria-labelledby="music-title">
          <h2 id="music-title" className={local.sectionTitle}>
            Music
          </h2>
          {MUSIC_TRACKS.length === 0 ? (
            <div className={local.empty}>
              <span className={local.emptyOrb} aria-hidden="true" />
              <p>Nothing here yet.</p>
              <p className={styles.muted}>Original, freely licensed pieces will live here soon.</p>
            </div>
          ) : (
            <ul className={local.tracks}>
              {MUSIC_TRACKS.map((track) => (
                <li key={track.id}>
                  {track.title} <span className={styles.muted}>{track.category}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
