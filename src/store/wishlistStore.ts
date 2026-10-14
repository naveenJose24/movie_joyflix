import { create } from 'zustand';
import { WISHLIST_STORE } from '../lib/constants';
import type { MediaItem } from '../lib/types';
import { isTV, slimItem } from '../lib/utils';

export const wishlistKey = (item: MediaItem) => `${isTV(item) ? 'tv' : 'movie'}-${item.id}`;

function readList(): MediaItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(WISHLIST_STORE) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(items: MediaItem[]) {
  try {
    localStorage.setItem(WISHLIST_STORE, JSON.stringify(items));
  } catch {
    /* storage full or blocked — keep in memory only */
  }
}

interface WishlistState {
  /** Newest first. */
  items: MediaItem[];
  /** Adds or removes the item; returns true when it was added. */
  toggle: (item: MediaItem) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: readList(),

  toggle: (item) => {
    const key = wishlistKey(item);
    const current = get().items;
    const exists = current.some((i) => wishlistKey(i) === key);
    const next = exists
      ? current.filter((i) => wishlistKey(i) !== key)
      : [{ ...slimItem(item), media_type: isTV(item) ? 'tv' as const : 'movie' as const }, ...current];
    persist(next);
    set({ items: next });
    return !exists;
  },
}));

export function useInWishlist(item: MediaItem | null): boolean {
  return useWishlistStore((s) => !!item && s.items.some((i) => wishlistKey(i) === wishlistKey(item)));
}

// Keep tabs in sync when the list changes in another tab/window.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === WISHLIST_STORE) useWishlistStore.setState({ items: readList() });
  });
}
