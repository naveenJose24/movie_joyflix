import type { ReactNode } from 'react';
import { Bookmark, Clapperboard, Flame, House, Search, Settings, Tv, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useSettingsStore } from '../store/settingsStore';
import type { Tab } from '../lib/types';
import { Wordmark } from './Wordmark';

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: 'home', label: 'Home', icon: <House size={22} /> },
  { id: 'movies', label: 'Movies', icon: <Clapperboard size={22} /> },
  { id: 'tv', label: 'TV shows', icon: <Tv size={22} /> },
  { id: 'trending', label: 'Trending', icon: <Flame size={22} /> },
  { id: 'list', label: 'My List', icon: <Bookmark size={22} /> },
];

export function Navbar() {
  const {
    currentTab, navbarScrolled, searchOpen, searchQuery, setSearchOpen, setSearchQuery,
    switchTab, goHome,
  } = useApp();
  const openSettings = useSettingsStore((s) => s.openSettings);

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (searchOpen) setSearchQuery('');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[900] flex items-center gap-3 md:gap-10 px-[4%] max-md:px-[3%] h-[68px] transition-[background-color,box-shadow] duration-300 ${
        navbarScrolled
          ? 'bg-velvet/90 backdrop-blur-xl shadow-[0_1px_0_rgba(244,238,248,0.06)]'
          : 'bg-linear-to-b from-velvet/90 to-transparent'
      }`}
    >
      <button
        type="button"
        onClick={goHome}
        className={`shrink-0 ${searchOpen ? 'max-[420px]:hidden' : ''}`}
        aria-label="JoyFlix home"
      >
        <Wordmark className="text-[1.65rem] md:text-[1.85rem]" />
      </button>

      <ul className="hidden md:flex gap-1 list-none flex-1">
        {TABS.map(({ id, label }) => {
          const active = currentTab === id;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => switchTab(id)}
                aria-current={active ? 'page' : undefined}
                className={`relative px-3 py-2 text-[0.9rem] font-medium transition-colors ${
                  active ? 'text-ink' : 'text-neutral-400 hover:text-ink'
                }`}
              >
                {label}
                <span
                  className={`absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-brand transition-transform duration-300 origin-left ${
                    active ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center gap-1 md:gap-2 ml-auto min-w-0">
        <div
          className={`flex items-center min-w-0 h-10 rounded-full transition-[background-color,border-color,width] duration-300 border ${
            searchOpen
              ? 'w-[min(260px,calc(100vw-8.5rem))] md:w-[300px] bg-surface/90 border-white/15 focus-within:border-brand/70'
              : 'w-10 bg-transparent border-transparent'
          }`}
        >
          <button
            type="button"
            onClick={toggleSearch}
            className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-neutral-300 hover:text-ink"
            title={searchOpen ? 'Close search' : 'Search'}
            aria-label={searchOpen ? 'Close search' : 'Search'}
          >
            {searchOpen && searchQuery ? <X size={18} /> : <Search size={19} />}
          </button>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Titles, people, genres"
            autoComplete="off"
            enterKeyHint="search"
            aria-label="Search movies and shows"
            tabIndex={searchOpen ? 0 : -1}
            className={`min-w-0 flex-1 bg-transparent text-ink text-base md:text-sm pr-4 outline-none focus-visible:outline-none placeholder:text-neutral-500 [&::-webkit-search-cancel-button]:hidden ${
              searchOpen ? 'opacity-100' : 'opacity-0 pointer-events-none w-0'
            }`}
          />
        </div>
        <button
          type="button"
          onClick={openSettings}
          className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-neutral-300 hover:text-ink hover:bg-white/8 transition-colors"
          title="Settings"
          aria-label="Settings"
        >
          <Settings size={20} />
        </button>
      </div>
    </nav>
  );
}

export function BottomNav() {
  const { currentTab, switchTab, goHome } = useApp();

  return (
    <nav
      aria-label="Main navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-[850] flex bg-velvet/95 backdrop-blur-xl border-t border-white/8 pb-[env(safe-area-inset-bottom)]"
    >
      {TABS.map(({ id, label, icon }) => {
        const active = currentTab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={id === 'home' ? goHome : () => switchTab(id)}
            aria-current={active ? 'page' : undefined}
            className={`flex-1 flex flex-col items-center justify-center gap-1 min-h-14 py-2 text-[0.68rem] font-medium [-webkit-tap-highlight-color:transparent] transition-colors ${
              active ? 'text-ink' : 'text-neutral-500'
            }`}
          >
            <span
              className={`flex items-center justify-center w-12 h-7 rounded-full transition-colors ${
                active ? 'bg-brand/15 text-brand' : ''
              }`}
            >
              {icon}
            </span>
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
