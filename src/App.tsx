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
      className={`fixed bottom-8 max-md:bottom-[calc(1.2rem+72px)] left-1/2 -translate-x-1/2 bg-neutral-800/95 border border-white/10 text-white px-5 py-2.5 rounded-lg text-sm font-medium backdrop-blur-xl z-[9999] pointer-events-none transition-all duration-300 ${
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
