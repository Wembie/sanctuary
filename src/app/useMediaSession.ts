import { useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { useT } from '../i18n';
import { audio } from '../services/audio/AudioManager';
import { findTrack } from '../services/audio/music/library';
import { trackText } from '../services/audio/music/trackText';
import { experienceStore } from '../store/experience';
import { musicStore } from '../store/music';
import { settingsStore } from '../store/settings';
import { setSoundEnabled } from './actions';

const supported = () =>
  typeof navigator !== 'undefined' &&
  'mediaSession' in navigator &&
  typeof MediaMetadata !== 'undefined';

const artwork = (): MediaImage[] =>
  [192, 512].map((size) => ({
    src: new URL(`icons/icon-${size}.png`, document.baseURI).href,
    sizes: `${size}x${size}`,
    type: 'image/png',
  }));

/**
 * Lock-screen and notification controls. Shows what is playing (the piece of
 * music, or the place you're in) and maps play/pause to the sound switch.
 */
export function useMediaSession(): void {
  const t = useT();
  const soundEnabled = useStore(settingsStore, (s) => s.soundEnabled);
  const trackId = useStore(musicStore, (s) => s.trackId);
  const environment = useStore(experienceStore, (s) => s.environment);

  useEffect(() => {
    if (!supported()) return;
    const track = findTrack(trackId);
    const place = t.explore.places[environment];
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track ? trackText(t, track).title : place.name,
      artist: 'Sanctuary',
      album: track ? t.sounds.categories[track.category] : place.line,
      artwork: artwork(),
    });
  }, [t, trackId, environment]);

  useEffect(() => {
    if (!supported()) return;
    navigator.mediaSession.playbackState = soundEnabled ? 'playing' : 'paused';
  }, [soundEnabled]);

  useEffect(() => {
    if (!supported()) return;
    const session = navigator.mediaSession;
    const handle = (action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
      try {
        session.setActionHandler(action, handler);
      } catch {
        /* this action isn't supported here */
      }
    };
    handle('play', () => setSoundEnabled(true));
    handle('pause', () => setSoundEnabled(false));
    handle('stop', () => setSoundEnabled(false));
    // Paused from outside (headphones unplugged, another app): keep the switch honest.
    const offExternal = audio.onExternalPause(() => settingsStore.set({ soundEnabled: false }));
    return () => {
      handle('play', null);
      handle('pause', null);
      handle('stop', null);
      offExternal();
    };
  }, []);
}
