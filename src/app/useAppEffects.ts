import { useEffect } from 'react';
import { useIdle } from '../hooks/useIdle';
import { useLowPerformance, useReducedMotion } from '../hooks/usePreferences';
import { useStore } from '../hooks/useStore';
import { toggleFullscreen } from '../lib/device';
import { audio } from '../services/audio/AudioManager';
import { experienceStore } from '../store/experience';
import { findTrack } from '../services/audio/music/library';
import { mixStore, toSoundMix } from '../store/mix';
import { musicStore } from '../store/music';
import { MUSIC_TIMER_FADE_SECONDS, musicTimerStore, setMusicTimer } from '../store/musicTimer';
import { sceneStore } from '../store/scene';
import { settingsStore } from '../store/settings';
import { applyTheme, getEnvironment } from '../themes/environments';
import { setSoundEnabled } from './actions';
import { useLocale, useT } from '../i18n';
import { ROUTE_NAME, type RoutePath } from './routes';

/** Mirrors preferences onto <html> so CSS can respond without prop drilling. */
export function useDocumentState(route: RoutePath, entered: boolean): void {
  const reduced = useReducedMotion();
  const low = useLowPerformance();
  const t = useT();
  const locale = useLocale();
  const autoHide = useStore(settingsStore, (s) => s.autoHide);
  const stillness = useStore(sceneStore, (s) => s.stillness);
  const settingsOpen = useStore(sceneStore, (s) => s.settingsOpen);
  const idleAfter = stillness ? 2500 : route === '/' ? 20_000 : 6000;
  const idle = useIdle(idleAfter, entered && !settingsOpen && (autoHide || stillness));

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.motion = reduced ? 'reduced' : 'full';
    root.dataset.performance = low ? 'low' : 'high';
  }, [reduced, low]);

  useEffect(() => {
    document.documentElement.dataset.idle = String(idle);
  }, [idle]);

  useEffect(() => {
    document.title =
      route === '/' ? t.routes.homeTitle : t.routes.pageTitle(t.routes[ROUTE_NAME[route]]);
  }, [route, t]);

  useEffect(() => {
    if (entered && route !== '/') experienceStore.set({ lastRoute: route });
  }, [route, entered]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
}

/** The scene's colors follow the chosen environment. */
export function useEnvironmentTheme(): void {
  const environment = useStore(experienceStore, (s) => s.environment);
  useEffect(() => {
    applyTheme(getEnvironment(environment));
  }, [environment]);
}

/** Keeps the audio engine in step with the stored mix and settings. */
export function useAudioSync(): void {
  const mix = useStore(mixStore);
  const { soundEnabled, masterVolume } = useStore(settingsStore);
  useEffect(() => {
    audio.setMaster(masterVolume, soundEnabled);
  }, [masterVolume, soundEnabled]);
  useEffect(() => {
    // Silent voices still cost CPU; stop them entirely when sound is off.
    audio.sync(soundEnabled ? toSoundMix(mix) : {});
  }, [mix, soundEnabled]);
  const { trackId, volume: musicVolume } = useStore(musicStore);
  useEffect(() => {
    audio.playMusic(soundEnabled ? findTrack(trackId) : null, musicVolume);
  }, [trackId, musicVolume, soundEnabled]);
}

/** Stops the music with a long fade when the music timer runs out. */
export function useMusicTimer(): void {
  const endsAt = useStore(musicTimerStore, (s) => s.endsAt);
  const trackId = useStore(musicStore, (s) => s.trackId);

  // Stopping the music by hand also cancels its timer.
  useEffect(() => {
    if (trackId === null && musicTimerStore.get().endsAt !== null) setMusicTimer(null);
  }, [trackId]);

  useEffect(() => {
    if (endsAt === null) return;
    const fire = () => {
      // Fade first; the store change right after is then a no-op for the audio engine.
      audio.playMusic(null, 0, MUSIC_TIMER_FADE_SECONDS);
      setMusicTimer(null);
      musicStore.set({ trackId: null });
    };
    const delay = endsAt - Date.now();
    if (delay <= 0) {
      fire();
      return;
    }
    const id = window.setTimeout(fire, delay);
    return () => window.clearTimeout(id);
  }, [endsAt]);
}

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

/** F: fullscreen. M: sound. Escape: leave stillness. */
export function useKeyboardShortcuts(entered: boolean): void {
  useEffect(() => {
    if (!entered) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      const key = e.key.toLowerCase();
      if (key === 'f') void toggleFullscreen();
      else if (key === 'm' && audio.supported) setSoundEnabled(!settingsStore.get().soundEnabled);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [entered]);
}
