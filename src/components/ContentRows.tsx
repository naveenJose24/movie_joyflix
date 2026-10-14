import { Bookmark } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useWishlistStore } from '../store/wishlistStore';
import { MediaCard } from './MediaCard';
import { MediaRow } from './MediaRow';

function MyListPage() {
  const items = useWishlistStore((s) => s.items);
  const { switchTab } = useApp();

  return (
    <main className="pt-[calc(var(--nav-h)+0.75rem)] px-[4%] max-md:px-[3%] pb-16 max-md:pb-[calc(4rem+72px)]">
      <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-[-0.03em] mb-6 sm:mb-8">My List</h1>
      {items.length ? (
        <div className="grid grid-cols-3 sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-2 sm:gap-2.5">
          {items.map((item) => (
            <MediaCard key={`${item.media_type}-${item.id}`} item={item} variant="grid" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center text-center py-20 text-neutral-400">
          <Bookmark size={44} strokeWidth={1.5} className="mb-4 text-brand" />
          <p className="font-display text-xl font-bold text-ink mb-1">Nothing saved yet</p>
          <p className="text-sm mb-6 max-w-xs">Tap My List on any movie or show and it’ll wait for you here.</p>
          <button
            type="button"
            onClick={() => switchTab('home')}
            className="bg-brand text-brand-ink font-semibold h-12 px-8 rounded-full hover:brightness-110 transition-[filter]"
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
