import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { mutate } from 'swr';
import { PROVIDERS } from '../lib/constants';
import type {
  GridState,
  HistoryState,
  MediaItem,
  RowData,
  Tab,
  ViewMode,
} from '../lib/types';
import {
  isStubItem,
  isTV,
  navUrl,
  normalizeMediaType,
  parseNavUrl,
  pushNav,
  slimItem,
} from '../lib/utils';
import { tmdbFetch, tmdbSwrKey } from '../lib/tmdb-api';
import { useBrowseRows, useGridPages, useSearchResults, useTvDetails } from '../hooks/useTmdbSwr';
import { useGlobalHorizontalScroll } from '../hooks/useHorizontalScroll';
import { getScrollY, scrollToTop } from '../lib/scroll';
import { getSettingsSnapshot, useSettingsStore } from '../store/settingsStore';
import { useWishlistStore } from '../store/wishlistStore';

interface AppContextValue {
  currentTab: Tab;
  viewMode: ViewMode;
  currentGenreId: number | null;
  heroItem: MediaItem | null;
  rows: RowData[] | null;
  rowsLoading: boolean;
  searchQuery: string;
  searchResults: MediaItem[] | null;
  searchLoading: boolean;
  gridState: GridState | null;
  gridItems: MediaItem[];
  gridLoading: boolean;
  gridHasMore: boolean;
  modalItem: MediaItem | null;
  modalOpen: boolean;
  selectedSeason: number;
  selectedEpisode: number;
  totalSeasons: number;
  playerOpen: boolean;
  playerItem: MediaItem | null;
  playerIsTV: boolean;
  toast: string | null;
  navbarScrolled: boolean;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  setSearchQuery: (q: string) => void;
  switchTab: (tab: Tab) => void;
  goHome: () => void;
  selectGenre: (genreId: number | null, genreName: string) => void;
  openGridPage: (title: string, endpoint: string, genreId: number | null, extraParams?: Record<string, string | number>) => void;
  openModal: (item: MediaItem) => void;
  closeModal: () => void;
  playItem: (item: MediaItem) => void;
  closePlayer: () => void;
  setSelectedSeason: (s: number) => void;
  setSelectedEpisode: (e: number) => void;
  openTrailer: (id: number, type: 'movie' | 'tv') => void;
  getPlayerUrl: () => string;
  historyBack: () => void;
  toggleWishlist: (item: MediaItem) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  useGlobalHorizontalScroll();

  const settingsOpen = useSettingsStore((s) => s.settingsOpen);

  const skipPushRef = useRef(false);
  const restoredRef = useRef(false);
  const seasonRef = useRef(1);
  const episodeRef = useRef(1);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [currentTab, setCurrentTab] = useState<Tab>('home');
  const [viewMode, setViewMode] = useState<ViewMode>('browse');
  const [currentGenreId, setCurrentGenreId] = useState<number | null>(null);
  const [searchQuery, setSearchQueryState] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [gridState, setGridState] = useState<GridState | null>(null);
  const [modalItem, setModalItem] = useState<MediaItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerItem, setPlayerItem] = useState<MediaItem | null>(null);
  const [playerIsTV, setPlayerIsTV] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [navbarScrolled, setNavbarScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    seasonRef.current = selectedSeason;
    episodeRef.current = selectedEpisode;
  }, [selectedSeason, selectedEpisode]);

  const browseEnabled = viewMode === 'browse' && currentTab !== 'list';
  const { data: browseData, isLoading: rowsLoading } = useBrowseRows(currentTab, browseEnabled);
  const rows = browseData?.rows ?? null;
  const heroItem = browseData?.hero ?? null;

  const searchEnabled = viewMode === 'search' && debouncedSearch.length >= 2;
  const { data: searchResults = null, isLoading: searchLoading } = useSearchResults(debouncedSearch, searchEnabled);

  const {
    data: gridPages,
    size: gridSize,
    setSize: setGridSize,
    isLoading: gridInitialLoading,
    isValidating: gridValidating,
  } = useGridPages(gridState, viewMode === 'grid');

  const gridItems = useMemo(() => {
    if (!gridPages) return [];
    return gridPages.flatMap((page) =>
      (page.results || []).filter((i: MediaItem) => i.poster_path).map(normalizeMediaType),
    );
  }, [gridPages]);

  const gridHasMore = useMemo(() => {
    if (!gridPages?.length) return true;
    const lastPage = gridPages[gridPages.length - 1];
    const totalPages = Math.min(lastPage.total_pages || 1, 500);
    return gridSize < totalPages;
  }, [gridPages, gridSize]);

  const gridLoading = gridInitialLoading || (gridValidating && gridItems.length === 0);

  const tvDetailsId = modalOpen && modalItem && isTV(modalItem) ? modalItem.id : null;
  const { data: tvDetails } = useTvDetails(tvDetailsId, modalOpen);
  const totalSeasons = tvDetails?.number_of_seasons || modalItem?.number_of_seasons || 1;

  const showToast = useCallback((msg: string, duration = 2500) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), duration);
  }, []);

  const openGridPageInternal = useCallback((
    title: string,
    endpoint: string,
    genreId: number | null,
    extraParams: Record<string, string | number> = {},
    pushHistory = true,
  ) => {
    if (pushHistory) {
      pushNav({ type: 'grid', title, endpoint, genreId, extraParams }, skipPushRef.current);
    }
    setGridState({ title, endpoint, genreId, extraParams });
    setViewMode('grid');
  }, []);

  const setSearchQuery = useCallback((q: string) => {
    setSearchQueryState(q);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (q.trim().length < 2) {
      setDebouncedSearch('');
      setViewMode('browse');
      return;
    }
    setViewMode('search');
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(q.trim()), 420);
  }, []);

  const switchTab = useCallback((tab: Tab) => {
    setCurrentTab(tab);
    setCurrentGenreId(null);
    setSearchOpen(false);
    setSearchQueryState('');
    setDebouncedSearch('');
    setViewMode('browse');
    setGridState(null);
    pushNav({ type: 'tab', tab }, skipPushRef.current);
  }, []);

  const goHome = useCallback(() => {
    if (currentTab === 'home' && viewMode === 'browse') {
      scrollToTop();
      return;
    }
    switchTab('home');
  }, [currentTab, viewMode, switchTab]);

  const selectGenre = useCallback((genreId: number | null, genreName: string) => {
    setCurrentGenreId(genreId);
    if (genreId === null) {
      setViewMode('browse');
      setGridState(null);
    } else {
      const endpoint = currentTab === 'tv' ? '/discover/tv' : '/discover/movie';
      openGridPageInternal(genreName, endpoint, genreId);
    }
  }, [currentTab, openGridPageInternal]);

  const openGridPage = useCallback((
    title: string,
    endpoint: string,
    genreId: number | null,
    extraParams: Record<string, string | number> = {},
  ) => {
    openGridPageInternal(title, endpoint, genreId, extraParams);
  }, [openGridPageInternal]);

  const openModal = useCallback((item: MediaItem) => {
    pushNav({ type: 'modal', item: slimItem(item) }, skipPushRef.current);
    setModalItem(item);
    setModalOpen(true);
    setSelectedSeason(1);
    setSelectedEpisode(1);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setModalItem(null);
  }, []);

  const playItem = useCallback((item: MediaItem) => {
    pushNav(
      { type: 'player', item: slimItem(item), season: seasonRef.current, episode: episodeRef.current },
      skipPushRef.current,
    );
    setModalOpen(false);
    setModalItem(null);
    setPlayerItem(item);
    setPlayerIsTV(isTV(item));
    setPlayerOpen(true);
  }, []);

  const closePlayer = useCallback(() => {
    setPlayerOpen(false);
    setPlayerItem(null);
  }, []);

  const openTrailer = useCallback(async (id: number, type: 'movie' | 'tv') => {
    const { primaryLang, region } = getSettingsSnapshot();
    const endpoint = `/${type}/${id}/videos`;
    const key = tmdbSwrKey(endpoint, {}, primaryLang, region);
    try {
      const data = await mutate(key, () => tmdbFetch(endpoint, {}, primaryLang, region)) as {
        results?: { site: string; type: string; key: string }[];
      };
      const trailer = (data.results || []).find(
        (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'),
      );
      if (trailer) {
        window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
      } else {
        showToast('No trailer available');
      }
    } catch {
      showToast('Could not load trailer');
    }
  }, [showToast]);

  const getPlayerUrl = useCallback(() => {
    if (!playerItem) return '';
    const { providerId } = getSettingsSnapshot();
    const provider = PROVIDERS.find((p) => p.id === providerId) || PROVIDERS[0];
    return playerIsTV
      ? provider.tv(playerItem.id, selectedSeason, selectedEpisode)
      : provider.movie(playerItem.id);
  }, [playerItem, playerIsTV, selectedSeason, selectedEpisode]);

  const historyBack = useCallback(() => history.back(), []);

  const toggleWishlist = useCallback((item: MediaItem) => {
    const added = useWishlistStore.getState().toggle(item);
    showToast(added ? 'Added to My List' : 'Removed from My List', 1800);
  }, [showToast]);

  useEffect(() => {
    const onScroll = () => setNavbarScrolled(getScrollY() > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /** Apply a nav state without pushing history (used by back/forward and restore-on-load). */
  const applyNavState = useCallback((state: HistoryState | null) => {
    skipPushRef.current = true;
    try {
      if (!state || state.type === 'tab') {
        const tab = state?.tab || 'home';
        closePlayer();
        closeModal();
        setSearchOpen(false);
        setSearchQueryState('');
        setDebouncedSearch('');
        setViewMode('browse');
        setGridState(null);
        setCurrentGenreId(null);
        setCurrentTab(tab);
      } else if (state.type === 'grid') {
        closePlayer();
        closeModal();
        setCurrentGenreId(state.genreId);
        openGridPageInternal(state.title, state.endpoint, state.genreId, state.extraParams || {}, false);
      } else if (state.type === 'modal') {
        closePlayer();
        openModal(state.item);
      } else if (state.type === 'player') {
        playItem(state.item);
        setSelectedSeason(state.season ?? 1);
        setSelectedEpisode(state.episode ?? 1);
      }
    } finally {
      skipPushRef.current = false;
    }
  }, [closeModal, closePlayer, openGridPageInternal, openModal, playItem]);

  useEffect(() => {
    const onPopState = (e: PopStateEvent) => applyNavState(e.state as HistoryState | null);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [applyNavState]);

  // Restore the view on load: history.state survives a refresh; otherwise fall back to the URL
  // (shared link / new tab), seeding a home entry underneath so Back/close stays in the app.
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    if (window.__TAURI_INTERNALS__) {
      document.documentElement.classList.add('tauri');
    }

    const home: HistoryState = { type: 'tab', tab: 'home' };
    const saved = history.state as HistoryState | null;
    const target = saved?.type ? saved : parseNavUrl(location.search);

    if (!target || (target.type === 'tab' && target.tab === 'home')) {
      history.replaceState(home, '', navUrl(home));
      return;
    }
    if (saved?.type) {
      history.replaceState(saved, '', navUrl(saved));
    } else {
      history.replaceState(home, '', navUrl(home));
      history.pushState(target, '', navUrl(target));
    }

    if (!('item' in target) || !isStubItem(target.item)) {
      applyNavState(target);
      return;
    }

    const type = target.item.media_type === 'tv' ? 'tv' : 'movie';
    const { primaryLang, region } = getSettingsSnapshot();
    tmdbFetch(`/${type}/${target.item.id}`, {}, primaryLang, region)
      .then((data) => {
        const details = data as unknown as MediaItem & { genres?: { id: number }[] };
        const item: MediaItem = {
          ...details,
          media_type: type,
          genre_ids: details.genre_ids ?? details.genres?.map((g) => g.id),
        };
        const full = { ...target, item } as HistoryState;
        history.replaceState({ ...full, item: slimItem(item) }, '', navUrl(full));
        applyNavState(full);
      })
      .catch(() => {
        history.back();
        showToast('Could not load that title');
      });
  }, [applyNavState, showToast]);

  useEffect(() => {
    if (viewMode !== 'grid' || !gridState || !gridHasMore || gridValidating) return;
    const onScroll = () => {
      const dist = document.documentElement.scrollHeight - window.innerHeight - getScrollY();
      if (dist < 500) setGridSize((s) => s + 1);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [viewMode, gridState, gridHasMore, gridValidating, setGridSize]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (playerOpen || modalOpen)) historyBack();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [playerOpen, modalOpen, historyBack]);

  useEffect(() => {
    document.body.style.overflow = modalOpen || playerOpen || settingsOpen ? 'hidden' : '';
  }, [modalOpen, playerOpen, settingsOpen]);

  const value = useMemo<AppContextValue>(() => ({
    currentTab, viewMode, currentGenreId, heroItem, rows, rowsLoading,
    searchQuery, searchResults, searchLoading, gridState, gridItems, gridLoading, gridHasMore,
    modalItem, modalOpen, selectedSeason, selectedEpisode, totalSeasons,
    playerOpen, playerItem, playerIsTV, toast,
    navbarScrolled, searchOpen,
    setSearchOpen, setSearchQuery, switchTab, goHome, selectGenre, openGridPage,
    openModal, closeModal, playItem, closePlayer, setSelectedSeason, setSelectedEpisode,
    openTrailer, getPlayerUrl,
    historyBack, toggleWishlist,
  }), [
    currentTab, viewMode, currentGenreId, heroItem, rows, rowsLoading,
    searchQuery, searchResults, searchLoading, gridState, gridItems, gridLoading, gridHasMore,
    modalItem, modalOpen, selectedSeason, selectedEpisode, totalSeasons,
    playerOpen, playerItem, playerIsTV, toast,
    navbarScrolled, searchOpen,
    setSearchQuery, switchTab, goHome, selectGenre, openGridPage,
    openModal, closeModal, playItem, closePlayer,
    openTrailer, getPlayerUrl, historyBack, toggleWishlist,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
  }
}
