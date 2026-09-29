import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/manrope/wght.css';
import './styles/global.css';
import { App } from './app/App';
import { experienceStore } from './store/experience';
import { applyTheme, getEnvironment } from './themes/environments';

// Paint the right sky before React's first frame: no flash of the wrong place.
applyTheme(getEnvironment(experienceStore.get().environment));

// Offline support. Production only: a service worker in dev would cache stale modules.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* offline mode is a bonus; the app works the same without it */
    });
  });
}

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
