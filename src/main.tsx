import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/manrope/wght.css';
import './styles/global.css';
import { App } from './app/App';
import { experienceStore } from './store/experience';
import { applyTheme, getEnvironment } from './themes/environments';

// Paint the right sky before React's first frame: no flash of the wrong place.
applyTheme(getEnvironment(experienceStore.get().environment));

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
