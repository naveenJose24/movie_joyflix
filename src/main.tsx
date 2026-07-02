import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './context/AppContext';
import { LenisScroll } from './components/LenisScroll';
import { SwrProvider } from './providers/SwrProvider';
import App from './App';
import './index.css';

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
