export type Tab = 'home' | 'movies' | 'tv' | 'trending';
export type MediaType = 'movie' | 'tv';
export type ViewMode = 'browse' | 'search' | 'grid';

export interface MediaItem {
  id: number;
  media_type?: MediaType;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  adult?: boolean;
  number_of_seasons?: number;
}

export interface Language {
  code: string;
  tmdb: string;
  name: string;
  flag: string;
  region: string;
}

export interface Region {
  code: string;
  name: string;
}

export interface Provider {
  id: string;
  name: string;
  movie: (id: number) => string;
  tv: (id: number, season: number, episode: number) => string;
}

export interface RowConfig {
  title: string;
  endpoint: string;
  params?: Record<string, string | number>;
  top10?: boolean;
}

export interface GridState {
  title: string;
  endpoint: string;
  genreId: number | null;
  extraParams: Record<string, string | number>;
}

export interface NavState {
  type: 'tab';
  tab: Tab;
}

export interface GridNavState extends GridState {
  type: 'grid';
}

export interface ModalNavState {
  type: 'modal';
  item: MediaItem;
}

export interface PlayerNavState {
  type: 'player';
  item: MediaItem;
}

export type HistoryState = NavState | GridNavState | ModalNavState | PlayerNavState;

export interface RowData {
  title: string;
  items: MediaItem[];
  endpoint: string;
  params: Record<string, string | number>;
  top10: boolean;
}
