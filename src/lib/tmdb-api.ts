import { mutate } from 'swr';
import { TMDB_BASE, TMDB_KEY } from './constants';
import type { MediaItem } from './types';

const REGION_ENDPOINTS = new Set([
  '/movie/popular', '/movie/top_rated', '/movie/now_playing', '/movie/upcoming',
  '/tv/popular', '/tv/top_rated', '/tv/airing_today', '/tv/on_the_air',
]);

export interface TmdbResponse {
  results?: MediaItem[];
  total_pages?: number;
  episodes?: unknown[];
  number_of_seasons?: number;
  genres?: { id: number; name: string }[];
}

export type TmdbSwrKey = readonly ['tmdb', string, string, string, string];

export function serializeParams(params: Record<string, string | number> = {}): string {
  return Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
}

export function tmdbSwrKey(
  endpoint: string,
  params: Record<string, string | number> = {},
  lang: string,
  region: string,
): TmdbSwrKey {
  return ['tmdb', endpoint, serializeParams(params), lang, region] as const;
}

export async function tmdbFetch(
  endpoint: string,
  params: Record<string, string | number> = {},
  userLang: string,
  userRegion: string,
): Promise<TmdbResponse> {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set('api_key', TMDB_KEY);
  url.searchParams.set('language', userLang);
  if (REGION_ENDPOINTS.has(endpoint)) url.searchParams.set('region', userRegion);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB error ${res.status}`);
  return res.json();
}

export async function tmdbFetcher(key: TmdbSwrKey): Promise<TmdbResponse> {
  const [, endpoint, paramsSerialized, lang, region] = key;
  const params: Record<string, string | number> = {};
  if (paramsSerialized) {
    paramsSerialized.split('&').forEach((pair) => {
      if (!pair) return;
      const [k, v] = pair.split('=');
      params[k] = Number.isNaN(Number(v)) ? v : Number(v);
    });
  }
  return tmdbFetch(endpoint, params, lang, region);
}

export const TMDB_SWR_OPTIONS = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 5 * 60 * 1000,
  keepPreviousData: true,
} as const;

export async function fetchTmdbCached(
  endpoint: string,
  params: Record<string, string | number> = {},
  lang: string,
  region: string,
): Promise<TmdbResponse> {
  const key = tmdbSwrKey(endpoint, params, lang, region);
  return mutate(key, () => tmdbFetch(endpoint, params, lang, region)) as Promise<TmdbResponse>;
}
