import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './context/AppContext';
import { LenisScroll } from './components/LenisScroll';
import { SwrProvider } from './providers/SwrProvider';
import App from './App';
import './index.css';

// Offline support for the installed web app; the Tauri desktop build serves files itself.
if (!window.__TAURI_INTERNALS__ && 'serviceWorker' in navigator) {
  import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true }));
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SwrProvider>
      <AppProvider>
        <LenisScroll>
          <App />
        </LenisScroll>
      </AppProvider>
    </SwrProvider>
  </StrictMode>,
);
