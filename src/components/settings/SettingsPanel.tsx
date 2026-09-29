import { setSoundEnabled } from '../../app/actions';
import { useStore } from '../../hooks/useStore';
import { LOCALE_NAMES, LOCALES, useT } from '../../i18n';
import { supportsFullscreen, toggleFullscreen } from '../../lib/device';
import { audio } from '../../services/audio/AudioManager';
import { sceneStore } from '../../store/scene';
import {
  settingsStore,
  type LanguageSetting,
  type MotionPreference,
  type PerformancePreference,
} from '../../store/settings';
import { Icon } from '../ui/Icon';
import { Modal } from '../ui/Modal';
import { Segmented } from '../ui/Segmented';
import { Slider } from '../ui/Slider';
import { Switch } from '../ui/Switch';
import styles from './SettingsPanel.module.css';

const MOTION: readonly MotionPreference[] = ['system', 'reduced', 'full'];
const PERFORMANCE: readonly PerformancePreference[] = ['auto', 'on', 'off'];

export function SettingsPanel() {
  const t = useT();
  const open = useStore(sceneStore, (s) => s.settingsOpen);
  const settings = useStore(settingsStore);
  const close = () => sceneStore.set({ settingsOpen: false });

  const languageOptions: { value: LanguageSetting; label: string }[] = [
    { value: 'auto', label: t.settings.languageAuto },
    ...LOCALES.map((locale) => ({ value: locale, label: LOCALE_NAMES[locale] })),
  ];

  return (
    <Modal open={open} onClose={close} title={t.settings.title}>
      <section className={styles.group} aria-label={t.settings.sound}>
        {audio.supported ? (
          <>
            <Switch
              label={t.settings.sound}
              checked={settings.soundEnabled}
              onChange={setSoundEnabled}
            />
            <Slider
              label={t.settings.masterVolume}
              showLabel
              value={settings.masterVolume}
              disabled={!settings.soundEnabled}
              onChange={(masterVolume) => settingsStore.set({ masterVolume })}
            />
          </>
        ) : (
          <p className={styles.note}>{t.settings.unsupported}</p>
        )}
      </section>

      <section className={styles.group} aria-label={t.settings.language}>
        <div className={styles.stackRow}>
          <span>{t.settings.language}</span>
          <Segmented
            label={t.settings.language}
            size="small"
            options={languageOptions}
            value={settings.language}
            onChange={(language) => settingsStore.set({ language })}
          />
        </div>
      </section>

      <section className={styles.group} aria-label={t.settings.motion}>
        <div className={styles.row}>
          <span>{t.settings.motion}</span>
          <Segmented
            label={t.settings.motion}
            size="small"
            options={MOTION.map((value) => ({ value, label: t.settings.motionOptions[value] }))}
            value={settings.motion}
            onChange={(motion) => settingsStore.set({ motion })}
          />
        </div>
        <div className={styles.row}>
          <span>{t.settings.performance}</span>
          <Segmented
            label={t.settings.performanceLabel}
            size="small"
            options={PERFORMANCE.map((value) => ({
              value,
              label: t.settings.performanceOptions[value],
            }))}
            value={settings.performance}
            onChange={(performance) => settingsStore.set({ performance })}
          />
        </div>
        <Switch
          label={t.settings.particles}
          checked={settings.particles}
          onChange={(particles) => settingsStore.set({ particles })}
        />
        <Switch
          label={t.settings.fade}
          description={t.settings.fadeHint}
          checked={settings.autoHide}
          onChange={(autoHide) => settingsStore.set({ autoHide })}
        />
      </section>

      {supportsFullscreen() && (
        <button type="button" className={styles.fullscreen} onClick={() => void toggleFullscreen()}>
          <Icon name="expand" size={18} />
          <span>{t.settings.fullscreen}</span>
          <kbd className={styles.kbd}>F</kbd>
        </button>
      )}

      <p className={styles.note}>{t.settings.privacy}</p>
    </Modal>
  );
}
