import {
  FilmStrip, FireSimple, GearSix, HouseSimple, MagnifyingGlass,
  TelevisionSimple, FilmSlate,
} from '@phosphor-icons/react';
import { useApp } from '../context/AppContext';
import { useSettingsStore } from '../store/settingsStore';
import type { Tab } from '../lib/types';

const TABS: { id: Tab; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'movies', label: 'Movies' },
  { id: 'tv', label: 'TV Shows' },
  { id: 'trending', label: 'Trending' },
];

export function Navbar() {
  const {
    currentTab, navbarScrolled, searchOpen, searchQuery, setSearchOpen, setSearchQuery,
    switchTab, goHome,
  } = useApp();
  const openSettings = useSettingsStore((s) => s.openSettings);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[900] flex items-center gap-3 md:gap-8 px-[4%] max-md:px-[3%] h-[68px] transition-all duration-300 ${
        navbarScrolled
          ? 'bg-[rgba(20,20,20,0.92)] backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.05)]'
          : 'bg-gradient-to-b from-black/85 to-transparent'
      }`}
    >
      <button
        type="button"
        onClick={goHome}
        className={`flex items-center gap-1.5 text-[1.5rem] md:text-[1.8rem] font-black tracking-tight text-joyflix-red shrink-0 ${searchOpen ? 'max-[420px]:hidden' : ''}`}
        aria-label="JoyFlix Home"
      >
        <FilmStrip weight="fill" size={22} />
        Joy<span className="text-white">Flix</span>
      </button>

      <ul className="hidden md:flex gap-5 list-none flex-1">
        {TABS.map(({ id, label }) => (
          <li key={id}>
            <button
              type="button"
              onClick={() => switchTab(id)}
              className={`text-sm font-medium transition-colors ${
                currentTab === id ? 'text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2 md:gap-4 ml-auto min-w-0">
        <div className="relative flex items-center min-w-0">
          <button
            type="button"
            onClick={() => {
              setSearchOpen(!searchOpen);
              if (searchOpen) setSearchQuery('');
            }}
            className="absolute left-0 z-10 w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-white"
            title="Search"
            aria-label="Search"
          >
            <MagnifyingGlass size={16} />
          </button>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies, shows…"
            autoComplete="off"
            enterKeyHint="search"
            className={`bg-black/75 border border-white/20 text-white text-base md:text-sm rounded pl-9 pr-3 py-1.5 font-[inherit] transition-all duration-400 placeholder:text-neutral-500 outline-none focus-visible:outline-none focus:border-white/45 focus:bg-black/90 ${
              searchOpen ? 'w-[min(220px,calc(100vw-9rem))] md:w-[260px] opacity-100' : 'w-9 opacity-0 border-transparent pointer-events-none'
            }`}
          />
        </div>
        <button
          type="button"
          onClick={openSettings}
          className="text-neutral-400 hover:text-white text-xl p-2 shrink-0 transition-colors"
          title="Settings"
          aria-label="Settings"
        >
          <GearSix size={22} />
        </button>
        <div className="max-sm:hidden shrink-0 w-[34px] h-[34px] rounded-md bg-joyflix-red flex items-center justify-center font-bold text-sm tracking-wide">
          JF
        </div>
      </div>
    </nav>
  );
}

export function BottomNav() {
  const { currentTab, switchTab, goHome } = useApp();

  const items: { id: Tab; label: string; icon: React.ReactNode; action: () => void }[] = [
    { id: 'home', label: 'Home', icon: <HouseSimple weight="fill" size={22} />, action: goHome },
    { id: 'movies', label: 'Movies', icon: <FilmSlate weight="fill" size={22} />, action: () => switchTab('movies') },
    { id: 'tv', label: 'TV Shows', icon: <TelevisionSimple weight="fill" size={22} />, action: () => switchTab('tv') },
    { id: 'trending', label: 'Trending', icon: <FireSimple weight="fill" size={22} />, action: () => switchTab('trending') },
  ];

  return (
    <nav
      aria-label="Main navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-[850] flex bg-[rgba(12,12,12,0.98)] border-t border-white/7 pb-[env(safe-area-inset-bottom)]"
    >
      {items.map(({ id, label, icon, action }) => (
        <button
          key={id}
          type="button"
          onClick={action}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 min-h-14 py-2 text-[0.68rem] [-webkit-tap-highlight-color:transparent] font-semibold transition-colors ${
            currentTab === id ? 'text-white' : 'text-neutral-500'
          }`}
        >
          <span className={currentTab === id ? 'text-joyflix-red' : ''}>{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
