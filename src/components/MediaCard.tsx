import { Bookmark, BookmarkCheck, Play, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { MediaItem } from '../lib/types';
import { useInWishlist } from '../store/wishlistStore';
import { formatDate, getTitle, imgFallback, isTV, normalizeMediaType, scoreColor } from '../lib/utils';

type CardVariant = 'row' | 'grid';

interface MediaCardProps {
  item: MediaItem;
  variant?: CardVariant;
  className?: string;
}

export function MediaCard({ item, variant = 'row', className = '' }: MediaCardProps) {
  const { openModal, playItem, toggleWishlist } = useApp();
  const typed = normalizeMediaType(item);
  const tv = isTV(typed);
  const title = getTitle(typed);
  const score = (typed.vote_average || 0).toFixed(1);
  const year = formatDate(typed.release_date || typed.first_air_date);
  const poster = imgFallback(typed.poster_path, 'w342');
  const scoreC = scoreColor(parseFloat(score));
  const inList = useInWishlist(typed);

  const sizeClass = variant === 'row'
    ? 'w-[var(--card-width)] shrink-0'
    : 'w-full';

  return (
    <article className={`media-card group ${sizeClass} ${className}`}>
      <div className="relative aspect-2/3 w-full overflow-hidden rounded-lg bg-surface ring-1 ring-white/5 transition-[box-shadow,ring-color] duration-500 ease-out group-hover:ring-brand/50 group-hover:shadow-[0_14px_32px_rgba(10,6,14,0.6)]">
        <button
          type="button"
          onClick={() => openModal(typed)}
          className="absolute inset-0 z-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset"
          aria-label={`View details for ${title}`}
        >
          <img crossOrigin="anonymous"
            src={poster}
            alt=""
            loading="lazy"
            draggable={false}
            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
          />
          <div className="absolute inset-0 bg-linear-to-t from-velvet via-velvet/30 to-transparent opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 max-md:opacity-0" />
        </button>

        <button
          type="button"
          onClick={() => playItem({ ...typed, media_type: tv ? 'tv' : 'movie' })}
          className="absolute bottom-2.5 left-2.5 z-10 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-brand text-brand-ink opacity-0 shadow-lg transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 hover:scale-105 max-md:hidden"
          aria-label={`Play ${title}`}
        >
          <Play size={14} fill="currentColor" strokeWidth={0} className="ml-0.5" />
        </button>

        <button
          type="button"
          onClick={() => toggleWishlist(typed)}
          className={`absolute bottom-2.5 left-13 z-10 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full border border-white/30 bg-velvet/70 text-ink opacity-0 shadow-lg backdrop-blur-sm transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 hover:scale-105 hover:border-white max-md:hidden`}
          aria-label={inList ? `Remove ${title} from My List` : `Add ${title} to My List`}
          aria-pressed={inList}
        >
          {inList ? <BookmarkCheck size={15} className="text-brand" /> : <Bookmark size={15} />}
        </button>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] translate-y-2 px-2.5 pb-14 pt-10 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 max-md:hidden">
          <p className="text-[0.75rem] font-semibold leading-snug text-ink line-clamp-2">{title}</p>
          {year && <p className="text-[0.65rem] text-neutral-400">{year}</p>}
        </div>

        <span
          className="pointer-events-none absolute top-1.5 right-1.5 z-[2] inline-flex items-center gap-0.5 rounded-full bg-velvet/80 px-1.5 py-0.5 text-[0.65rem] font-semibold tabular-nums backdrop-blur-sm"
          style={{ color: scoreC }}
        >
          <Star size={10} fill="currentColor" strokeWidth={0} /> {score}
        </span>
        {inList && (
          <span className="pointer-events-none absolute top-0 left-2 z-[2] text-brand drop-shadow" aria-hidden>
            <Bookmark size={18} fill="currentColor" strokeWidth={0} />
          </span>
        )}
      </div>
    </article>
  );
}

export function SkeletonCard() {
  return (
    <div className="w-[var(--card-width)] shrink-0">
      <div className="aspect-2/3 rounded-lg skeleton-shimmer" />
    </div>
  );
}
