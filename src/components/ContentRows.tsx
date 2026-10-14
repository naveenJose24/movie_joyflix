import { BookmarkSimple } from '@phosphor-icons/react';
import { useApp } from '../context/AppContext';
import { useWishlistStore } from '../store/wishlistStore';
import { MediaCard } from './MediaCard';
import { MediaRow } from './MediaRow';

function MyListPage() {
  const items = useWishlistStore((s) => s.items);
  const { switchTab } = useApp();

  return (
    <main className="pt-20 px-[4%] max-md:px-[3%] pb-16 max-md:pb-[calc(4rem+72px)]">
      <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-5 sm:mb-6">My List</h1>
      {items.length ? (
        <div className="grid grid-cols-3 sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-2 sm:gap-2.5">
          {items.map((item) => (
            <MediaCard key={`${item.media_type}-${item.id}`} item={item} variant="grid" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center text-center py-20 text-neutral-400">
          <BookmarkSimple size={48} className="mb-4 text-neutral-600" />
          <p className="text-white font-semibold mb-1">Nothing saved yet</p>
          <p className="text-sm mb-6 max-w-xs">Tap “My List” on any movie or show to save it here.</p>
          <button
            type="button"
            onClick={() => switchTab('home')}
            className="bg-white text-black font-bold px-6 py-2.5 rounded-md hover:bg-white/85 transition-colors"
          >
            Browse titles
          </button>
        </div>
      )}
    </main>
  );
}

export function ContentRows() {
  const { rows, rowsLoading, viewMode, currentTab, switchTab } = useApp();
  const wishlist = useWishlistStore((s) => s.items);

  if (viewMode !== 'browse') return null;
  if (currentTab === 'list') return <MyListPage />;

  if (rowsLoading) {
    return (
      <main className="relative z-2 pb-16 max-md:pb-[calc(4rem+72px)]">
        {Array.from({ length: 6 }, (_, i) => (
          <MediaRow key={i} title="Loading…" loading />
        ))}
      </main>
    );
  }

  return (
    <main className="relative z-2 pb-16 max-md:pb-[calc(4rem+72px)]">
      {currentTab === 'home' && wishlist.length > 0 && (
        <MediaRow title="My List" items={wishlist} onSeeAll={() => switchTab('list')} />
      )}
      {rows?.map((row) => (
        <MediaRow
          key={row.title}
          row={row}
          variant={row.top10 ? 'top10' : 'default'}
        />
      ))}
    </main>
  );
}
