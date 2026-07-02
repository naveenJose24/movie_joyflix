import { SWRConfig } from 'swr';
import type { ReactNode } from 'react';
import { TMDB_SWR_OPTIONS, tmdbFetcher, type TmdbSwrKey } from '../lib/tmdb-api';

export function SwrProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: (key: TmdbSwrKey) => tmdbFetcher(key),
        ...TMDB_SWR_OPTIONS,
        provider: () => new Map(),
      }}
    >
      {children}
    </SWRConfig>
  );
}
