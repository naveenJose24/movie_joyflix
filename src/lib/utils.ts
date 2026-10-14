import { IMG_BASE } from './constants';
import type { HistoryState, MediaItem, Tab } from './types';

export function img(path: string | null | undefined, size = 'w500'): string | null {
  return path ? `${IMG_BASE}${size}${path}` : null;
}

export function imgFallback(path: string | null | undefined, size: string): string {
  return img(path, size) || `https://via.placeholder.com/300x450/1a1a1a/666?text=No+Image`;
}

export function scoreColor(score: number): string {
  if (score >= 7.5) return '#46d369';
  if (score >= 6) return '#f5c518';
  return '#e74c3c';
}

export function formatDate(str?: string): string {
  if (!str) return '';
  return String(new Date(str).getFullYear());
}

export function isTV(item: MediaItem): boolean {
  return item.media_type === 'tv' || item.first_air_date !== undefined;
}

export function getTitle(item: MediaItem): string {
  return item.title || item.name || '—';
}

export function normalizeMediaType(item: MediaItem): MediaItem {
  return {
    ...item,
    media_type: item.media_type || (item.first_air_date ? 'tv' : 'movie'),
  };
}

export function slimItem(item: MediaItem): MediaItem {
  return {
    id: item.id,
    media_type: item.media_type,
    title: item.title || item.name,
    name: item.name,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    overview: item.overview,
    release_date: item.release_date,
    first_air_date: item.first_air_date,
    vote_average: item.vote_average,
    genre_ids: item.genre_ids,
  };
}

const TABS: Tab[] = ['home', 'movies', 'tv', 'trending', 'list'];

/** URL (path + query) that represents a nav state, so refresh / shared links reopen it. */
export function navUrl(state: HistoryState): string {
  const p = new URLSearchParams();
  if (state.type === 'tab') {
    if (state.tab !== 'home') p.set('tab', state.tab);
  } else if (state.type === 'grid') {
    p.set('list', state.title);
    p.set('src', state.endpoint);
    if (state.genreId != null) p.set('genre', String(state.genreId));
    if (Object.keys(state.extraParams || {}).length) p.set('params', JSON.stringify(state.extraParams));
  } else {
    const type = isTV(state.item) ? 'tv' : 'movie';
    if (state.type === 'modal') {
      p.set(type, String(state.item.id));
    } else {
      p.set('watch', `${type}-${state.item.id}`);
      if (type === 'tv') {
        p.set('s', String(state.season ?? 1));
        p.set('e', String(state.episode ?? 1));
      }
    }
  }
  const qs = p.toString();
  return location.pathname + (qs ? `?${qs}` : '');
}

/**
 * Parse the current URL back into a nav state. Modal/player items are stubs
 * ({ id, media_type }) that need hydrating from TMDB — see `isStubItem`.
 */
export function parseNavUrl(search: string): HistoryState | null {
  const p = new URLSearchParams(search);
  const toInt = (v: string | null) => {
    const n = Number(v);
    return Number.isInteger(n) && n > 0 ? n : null;
  };

  const watch = p.get('watch')?.match(/^(movie|tv)-(\d+)$/);
  if (watch) {
    return {
      type: 'player',
      item: { id: Number(watch[2]), media_type: watch[1] as 'movie' | 'tv' },
      season: toInt(p.get('s')) ?? 1,
      episode: toInt(p.get('e')) ?? 1,
    };
  }
  for (const type of ['movie', 'tv'] as const) {
    const id = toInt(p.get(type));
    if (id) return { type: 'modal', item: { id, media_type: type } };
  }
  const list = p.get('list');
  const src = p.get('src');
  if (list && src?.startsWith('/')) {
    let extraParams: Record<string, string | number> = {};
    try {
      extraParams = JSON.parse(p.get('params') || '{}');
    } catch {
      /* ignore malformed params */
    }
    return { type: 'grid', title: list, endpoint: src, genreId: toInt(p.get('genre')), extraParams };
  }
  const tab = p.get('tab') as Tab | null;
  if (tab && TABS.includes(tab)) return { type: 'tab', tab };
  return null;
}

export function isStubItem(item: MediaItem): boolean {
  return !item.title && !item.name;
}

export function pushNav(state: HistoryState, skipPush: boolean): void {
  if (skipPush) return;
  const url = navUrl(state);
  try {
    history.pushState(state, '', url);
  } catch {
    if ('item' in state) {
      try {
        history.pushState({ ...state, item: slimItem(state.item) }, '', url);
      } catch {
        /* state too large */
      }
    }
  }
}
