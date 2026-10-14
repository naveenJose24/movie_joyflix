import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './context/AppContext';
import { LenisScroll } from './components/LenisScroll';
import { SwrProvider } from './providers/SwrProvider';
import App from './App';
import './index.css';

// Offline support for the installed web app; the Tauri desktop build serves files itself.
if (!window.__TAURI_INTERNALS__ && 'serviceWorker' in navigator) {
  import('virtual:pwa-register').then(({ registerSW }) => registerSW({
    immediate: true,
    // An installed app can stay open for days; look for a new deploy regularly and on return
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      const check = () => {
        if (navigator.onLine) registration.update().catch(() => {});
      };
      setInterval(check, 30 * 60 * 1000);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check();
      });
    },
  }));
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
