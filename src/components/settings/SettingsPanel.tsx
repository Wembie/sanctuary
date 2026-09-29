import { setSoundEnabled } from '../../app/actions';
import { useStore } from '../../hooks/useStore';
import { supportsFullscreen, toggleFullscreen } from '../../lib/device';
import { audio } from '../../services/audio/AudioManager';
import { sceneStore } from '../../store/scene';
import {
  settingsStore,
  type MotionPreference,
  type PerformancePreference,
} from '../../store/settings';
import { Icon } from '../ui/Icon';
import { Modal } from '../ui/Modal';
import { Segmented } from '../ui/Segmented';
import { Slider } from '../ui/Slider';
import { Switch } from '../ui/Switch';
import styles from './SettingsPanel.module.css';

const MOTION_OPTIONS = [
  { value: 'system', label: 'System' },
  { value: 'reduced', label: 'Reduced' },
  { value: 'full', label: 'Full' },
] as const satisfies readonly { value: MotionPreference; label: string }[];

const PERFORMANCE_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'on', label: 'Light' },
  { value: 'off', label: 'Full' },
] as const satisfies readonly { value: PerformancePreference; label: string }[];

export function SettingsPanel() {
  const open = useStore(sceneStore, (s) => s.settingsOpen);
  const settings = useStore(settingsStore);
  const close = () => sceneStore.set({ settingsOpen: false });

  return (
    <Modal open={open} onClose={close} title="Settings">
      <section className={styles.group} aria-label="Sound">
        {audio.supported ? (
          <>
            <Switch label="Sound" checked={settings.soundEnabled} onChange={setSoundEnabled} />
            <Slider
              label="Master volume"
              showLabel
              value={settings.masterVolume}
              disabled={!settings.soundEnabled}
              onChange={(masterVolume) => settingsStore.set({ masterVolume })}
            />
          </>
        ) : (
          <p className={styles.note}>Sound isn’t available in this browser. Everything else is.</p>
        )}
      </section>

      <section className={styles.group} aria-label="Visuals">
        <div className={styles.row}>
          <span>Motion</span>
          <Segmented
            label="Motion"
            size="small"
            options={MOTION_OPTIONS}
            value={settings.motion}
            onChange={(motion) => settingsStore.set({ motion })}
          />
        </div>
        <div className={styles.row}>
          <span>Performance</span>
          <Segmented
            label="Performance mode"
            size="small"
            options={PERFORMANCE_OPTIONS}
            value={settings.performance}
            onChange={(performance) => settingsStore.set({ performance })}
          />
        </div>
        <Switch
          label="Particles"
          checked={settings.particles}
          onChange={(particles) => settingsStore.set({ particles })}
        />
        <Switch
          label="Let the interface fade"
          description="Controls disappear when you’re still."
          checked={settings.autoHide}
          onChange={(autoHide) => settingsStore.set({ autoHide })}
        />
      </section>

      {supportsFullscreen() && (
        <button type="button" className={styles.fullscreen} onClick={() => void toggleFullscreen()}>
          <Icon name="expand" size={18} />
          <span>Fullscreen</span>
          <kbd className={styles.kbd}>F</kbd>
        </button>
      )}

      <p className={styles.note}>Preferences stay on this device. Nothing is sent anywhere.</p>
    </Modal>
  );
}
