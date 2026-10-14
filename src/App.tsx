import { useApp } from './context/AppContext';
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
      <BottomNav />
    </>
  );
}
