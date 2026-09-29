import { setSoundEnabled } from '../app/actions';
import { MusicPlayer } from '../components/audio/MusicPlayer';
import { SoundMixer } from '../components/audio/SoundMixer';
import { Icon } from '../components/ui/Icon';
import { Slider } from '../components/ui/Slider';
import { useStore } from '../hooks/useStore';
import { useT } from '../i18n';
import { audio } from '../services/audio/AudioManager';
import { settingsStore } from '../store/settings';
import styles from './Page.module.css';
import local from './SoundsPage.module.css';

export default function SoundsPage() {
  const t = useT();
  const { soundEnabled, masterVolume } = useStore(settingsStore);

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <header className={`${styles.header} arrive`}>
          <h1 className={styles.display}>{t.sounds.title}</h1>
          <p className={styles.lead}>{t.sounds.lead}</p>
        </header>

        {!audio.supported ? (
          <p className={`${local.notice} arrive`}>{t.sounds.unsupported}</p>
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
                {soundEnabled ? t.sounds.soundOn : t.sounds.turnOn}
              </button>
              <div className={local.masterSlider}>
                <Slider
                  label={t.sounds.masterVolume}
                  value={masterVolume}
                  disabled={!soundEnabled}
                  onChange={(value) => settingsStore.set({ masterVolume: value })}
                />
              </div>
            </div>

            <section aria-label={t.sounds.section} className="arrive">
              <SoundMixer disabled={!soundEnabled} />
              <p className={local.saved}>{t.sounds.saved}</p>
            </section>
          </>
        )}

        <section className={`${local.music} arrive`} aria-labelledby="music-title">
          <h2 id="music-title" className={local.sectionTitle}>
            {t.sounds.music}
          </h2>
          <p className={`${styles.muted} ${local.musicLead}`}>{t.sounds.musicLead}</p>
          <MusicPlayer />
        </section>
      </div>
    </div>
  );
}
