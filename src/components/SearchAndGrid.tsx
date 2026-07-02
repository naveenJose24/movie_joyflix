import { ArrowLeft } from '@phosphor-icons/react';
import { useApp } from '../context/AppContext';
import { MediaCard } from './MediaCard';
import { Spinner } from './Spinner';

export function SearchResults() {
  const { viewMode, searchQuery, searchResults, searchLoading } = useApp();

  if (viewMode !== 'search') return null;

  return (
    <div className="pt-20 max-md:pt-[90px] px-[4%] max-md:px-[3%] pb-16 max-md:pb-[calc(4rem+72px)]">
      <p className="text-lg font-bold mb-5 text-neutral-400">
        Results for: <span className="text-white">&quot;{searchQuery}&quot;</span>
      </p>
      {searchLoading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2.5">
          {searchResults?.length ? (
            searchResults.map((item) => (
              <MediaCard key={`${item.id}-${item.media_type}`} item={item} variant="grid" />
            ))
          ) : (
            <p className="text-neutral-500 col-span-full">No results found.</p>
          )}
        </div>
      )}
    </div>
  );
}

export function GridPage() {
  const { viewMode, gridState, gridItems, gridLoading, gridHasMore, historyBack } = useApp();

  if (viewMode !== 'grid' || !gridState) return null;

  return (
    <div className="pt-20 max-md:pt-20 px-[4%] max-md:px-[3%] pb-16 max-md:pb-[calc(4rem+72px)]">
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={historyBack}
          className="inline-flex items-center gap-1.5 border border-white/15 text-neutral-400 text-sm font-semibold px-3.5 py-1.5 rounded-md hover:text-white hover:border-white/35 transition-colors shrink-0 bg-transparent cursor-pointer"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <h2 className="text-xl font-bold text-white tracking-tight">{gridState.title}</h2>
      </div>
      {gridLoading && gridItems.length === 0 ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2.5">
          {gridItems.map((item) => (
            <MediaCard key={`${item.id}-${item.media_type}`} item={item} variant="grid" />
          ))}
          {!gridItems.length && (
            <p className="text-neutral-500 col-span-full">Failed to load.</p>
          )}
        </div>
      )}
      <div className="h-[60px] flex items-center justify-center">
        {gridLoading && gridItems.length > 0 && <Spinner small />}
        {!gridHasMore && gridItems.length > 0 && null}
      </div>
    </div>
  );
}
