import { IMG_BASE } from './constants';
import type { MediaItem } from './types';

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

export function pushNav(state: unknown, skipPush: boolean): void {
  if (skipPush) return;
  try {
    history.pushState(state, '');
  } catch {
    const s = state as { item?: MediaItem };
    if (s.item) {
      try {
        history.pushState({ ...(s as Record<string, unknown>), item: slimItem(s.item) }, '');
      } catch {
        /* state too large */
      }
    }
  }
}
