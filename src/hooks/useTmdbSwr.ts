import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { ROW_CONFIG, getLangRows } from '../lib/constants';
import type { GridState, MediaItem, RowData, Tab } from '../lib/types';
import { normalizeMediaType } from '../lib/utils';
import {
  TMDB_SWR_OPTIONS,
  fetchTmdbCached,
  tmdbFetcher,
  tmdbSwrKey,
  type TmdbResponse,
} from '../lib/tmdb-api';
import { useSettingsStore } from '../store/settingsStore';

function useLocale() {
  const primaryLang = useSettingsStore((s) => s.primaryLang);
  const region = useSettingsStore((s) => s.region);
  return { primaryLang, region };
}

export function useTmdb(
  endpoint: string | null,
  params: Record<string, string | number> = {},
  enabled = true,
) {
  const { primaryLang, region } = useLocale();
  const key = enabled && endpoint ? tmdbSwrKey(endpoint, params, primaryLang, region) : null;
  return useSWR(key, tmdbFetcher, TMDB_SWR_OPTIONS);
}

async function fetchRow(
  row: { title: string; endpoint: string; params?: Record<string, string | number>; top10?: boolean },
  lang: string,
  region: string,
): Promise<RowData> {
  const base = { ...(row.params || {}) };
  try {
    const [d1, d2] = await Promise.all([
      fetchTmdbCached(row.endpoint, { ...base, page: 1 }, lang, region),
      fetchTmdbCached(row.endpoint, { ...base, page: 2 }, lang, region),
    ]);
    let items = [...(d1.results || []), ...(d2.results || [])].filter((i) => i.poster_path);
    items = items.map(normalizeMediaType);
    return { title: row.title, items, endpoint: row.endpoint, params: row.params || {}, top10: !!row.top10 };
  } catch {
    return { title: row.title, items: [], endpoint: row.endpoint, params: row.params || {}, top10: !!row.top10 };
  }
}

export function useBrowseRows(tab: Tab, enabled: boolean) {
  const langs = useSettingsStore((s) => s.langs);
  const { primaryLang, region } = useLocale();
  const key = enabled ? (['browse-rows', tab, langs.join(','), primaryLang, region] as const) : null;

  return useSWR(
    key,
    async ([, t, , lang, reg]) => {
      const typedTab = t as Tab;
      const baseRows = ROW_CONFIG[typedTab] || ROW_CONFIG.home;
      const langType = typedTab === 'home' ? 'all' : typedTab === 'movies' ? 'movie' : typedTab === 'tv' ? 'tv' : 'all';
      const langRows = typedTab === 'trending' ? [] : getLangRows(langs, langType);
      const splitAt = Math.min(2, baseRows.length);
      const rowDefs = langRows.length
        ? [...baseRows.slice(0, splitAt), ...langRows, ...baseRows.slice(splitAt)]
        : baseRows;

      const results = await Promise.all(rowDefs.map((row) => fetchRow(row, lang, reg)));
      const rows = results.filter((r) => r.items.length > 0);
      let hero: MediaItem | null = null;
      if (rows[0]?.items.length) {
        hero = rows[0].items[Math.floor(Math.random() * Math.min(5, rows[0].items.length))];
      }
      return { rows, hero };
    },
    TMDB_SWR_OPTIONS,
  );
}

export function useSearchResults(query: string, enabled: boolean) {
  const trimmed = query.trim();
  const { primaryLang, region } = useLocale();
  const key = enabled && trimmed.length >= 2
    ? tmdbSwrKey('/search/multi', { query: trimmed }, primaryLang, region)
    : null;

  return useSWR(
    key,
    async (k) => {
      const data = await tmdbFetcher(k);
      return (data.results || [])
        .filter((i) => (i.media_type === 'movie' || i.media_type === 'tv') && i.poster_path)
        .map(normalizeMediaType);
    },
    TMDB_SWR_OPTIONS,
  );
}

export function useGridPages(gridState: GridState | null, enabled: boolean) {
  const { primaryLang, region } = useLocale();

  const getKey = (pageIndex: number, previousPageData: TmdbResponse | null) => {
    if (!enabled || !gridState) return null;
    if (previousPageData && pageIndex >= Math.min(previousPageData.total_pages || 1, 500)) return null;

    const params: Record<string, string | number> = { ...gridState.extraParams, page: pageIndex + 1 };
    if (gridState.genreId) params.with_genres = gridState.genreId;
    return tmdbSwrKey(gridState.endpoint, params, primaryLang, region);
  };

  return useSWRInfinite(getKey, tmdbFetcher, {
    ...TMDB_SWR_OPTIONS,
    initialSize: 2,
    revalidateFirstPage: false,
  });
}

export function useGenreMap(enabled = true) {
  const { primaryLang, region } = useLocale();
  const movieKey = enabled ? tmdbSwrKey('/genre/movie/list', {}, primaryLang, region) : null;
  const tvKey = enabled ? tmdbSwrKey('/genre/tv/list', {}, primaryLang, region) : null;

  const movie = useSWR(movieKey, tmdbFetcher, TMDB_SWR_OPTIONS);
  const tv = useSWR(tvKey, tmdbFetcher, TMDB_SWR_OPTIONS);

  const map: Record<number, string> = {};
  [...(movie.data?.genres || []), ...(tv.data?.genres || [])].forEach((g) => {
    map[g.id] = g.name;
  });

  return {
    map,
    isLoading: movie.isLoading || tv.isLoading,
  };
}

export function useTvDetails(tvId: number | null, enabled: boolean) {
  return useTmdb(tvId ? `/tv/${tvId}` : null, {}, enabled);
}

export function useTvSeason(tvId: number | null, season: number, enabled: boolean) {
  return useTmdb(tvId ? `/tv/${tvId}/season/${season}` : null, {}, enabled);
}

export function useTmdbVideos(type: 'movie' | 'tv', id: number | null, enabled: boolean) {
  return useTmdb(id ? `/${type}/${id}/videos` : null, {}, enabled);
}
