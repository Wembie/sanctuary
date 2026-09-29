import { Suspense, useCallback, useState } from 'react';
import { AmbientBackground } from '../components/ambient/AmbientBackground';
import { CalmCursor } from '../components/cursor/CalmCursor';
import { Stillness } from '../components/experiences/Stillness';
import { Loader } from '../components/intro/Loader';
import { Threshold } from '../components/intro/Threshold';
import { FloatingNavigation } from '../components/navigation/FloatingNavigation';
import { SettingsPanel } from '../components/settings/SettingsPanel';
import { useHashRoute } from '../hooks/useHashRoute';
import { useStore } from '../hooks/useStore';
import { useT } from '../i18n';
import { experienceStore } from '../store/experience';
import { sceneStore } from '../store/scene';
import { PAGES, preloadPage } from './pages';
import {
  useAudioSync,
  useDocumentState,
  useEnvironmentTheme,
  useKeyboardShortcuts,
} from './useAppEffects';
import { ErrorBoundary } from './ErrorBoundary';
import styles from './App.module.css';

type Stage = 'loading' | 'threshold' | 'entered';

export function App() {
  const [route] = useHashRoute();
  const [stage, setStage] = useState<Stage>('loading');
  const [firstVisit] = useState(() => experienceStore.get().visits === 0);
  // Fonts and the first page load while the loader breathes.
  const [ready] = useState<Promise<unknown>>(() =>
    Promise.all([document.fonts?.ready ?? Promise.resolve(), preloadPage(route)]),
  );
  const entered = stage === 'entered';

  useEnvironmentTheme();
  useAudioSync();
  useDocumentState(route, entered);
  useKeyboardShortcuts(entered);

  const onLoaded = useCallback(() => setStage('threshold'), []);
  const onEnter = useCallback(() => {
    experienceStore.set((s) => ({ ...s, visits: s.visits + 1 }));
    setStage('entered');
  }, []);

  return (
    <>
      <AmbientBackground />
      <CalmCursor />
      {stage === 'loading' && <Loader ready={ready} onDone={onLoaded} />}
      {stage === 'threshold' && <Threshold firstVisit={firstVisit} onEnter={onEnter} />}
      {entered && <Sanctuary route={route} />}
    </>
  );
}

function Sanctuary({ route }: { route: ReturnType<typeof useHashRoute>[0] }) {
  const t = useT();
  const stillness = useStore(sceneStore, (s) => s.stillness);
  const Page = PAGES[route];

  return (
    <>
      <button
        type="button"
        className="skip-link"
        onClick={() => document.getElementById('main')?.focus()}
      >
        {t.common.skipToContent}
      </button>
      <main
        id="main"
        tabIndex={-1}
        className={styles.main}
        data-hidden={stillness || undefined}
        inert={stillness}
      >
        <ErrorBoundary key={route}>
          <Suspense fallback={null}>
            <div key={route} className={styles.view}>
              <Page />
            </div>
          </Suspense>
        </ErrorBoundary>
      </main>
      <FloatingNavigation route={route} />
      <SettingsPanel />
      {stillness && <Stillness />}
    </>
  );
}
