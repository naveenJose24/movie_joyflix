import { WifiOff } from 'lucide-react';
import { useApp } from './context/AppContext';
import { useOnline } from './hooks/useOnline';
import { BottomNav, Navbar } from './components/Navbar';
import { GenreBar } from './components/GenreBar';
import { Hero } from './components/Hero';
import { ContentRows } from './components/ContentRows';
import { SearchResults, GridPage } from './components/SearchAndGrid';
import { DetailModal } from './components/DetailModal';
import { PlayerOverlay } from './components/PlayerOverlay';
import { Onboarding, SettingsModal } from './components/SettingsAndOnboarding';

function ToastBanner() {
  const { toast } = useApp();
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-8 max-md:bottom-[calc(1rem+64px+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 max-w-[calc(100vw-2rem)] text-center bg-ink text-velvet px-5 py-3 rounded-full text-sm font-semibold shadow-[0_12px_32px_rgba(8,4,12,0.5)] z-[9999] pointer-events-none transition-all duration-300 ${
        toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
    >
      {toast}
    </div>
  );
}

function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div
      role="status"
      className="fixed top-[calc(var(--nav-h)+0.5rem)] left-1/2 -translate-x-1/2 z-[950] flex items-center gap-2 whitespace-nowrap rounded-full bg-surface-2/95 backdrop-blur-xl ring-1 ring-white/10 px-4 py-2 text-[0.8rem] font-medium text-neutral-200 shadow-[0_12px_32px_rgba(8,4,12,0.5)]"
    >
      <WifiOff size={15} className="shrink-0 text-brand" />
      Offline. Showing saved pages.
    </div>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <GenreBar />
      <Hero />
      <SearchResults />
      <GridPage />
      <ContentRows />
      <DetailModal />
      <PlayerOverlay />
      <SettingsModal />
      <Onboarding />
      <ToastBanner />
      <OfflineBanner />
      <BottomNav />
    </>
  );
}
