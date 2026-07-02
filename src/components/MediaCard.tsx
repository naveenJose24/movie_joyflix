import { Play } from '@phosphor-icons/react';
import { useApp } from '../context/AppContext';
import type { MediaItem } from '../lib/types';
import { formatDate, getTitle, imgFallback, isTV, normalizeMediaType, scoreColor } from '../lib/utils';

type CardVariant = 'row' | 'grid';

interface MediaCardProps {
  item: MediaItem;
  variant?: CardVariant;
  className?: string;
}

export function MediaCard({ item, variant = 'row', className = '' }: MediaCardProps) {
  const { openModal, playItem } = useApp();
  const typed = normalizeMediaType(item);
  const tv = isTV(typed);
  const title = getTitle(typed);
  const score = (typed.vote_average || 0).toFixed(1);
  const year = formatDate(typed.release_date || typed.first_air_date);
  const poster = imgFallback(typed.poster_path, 'w342');
  const scoreC = scoreColor(parseFloat(score));

  const sizeClass = variant === 'row'
    ? 'w-[var(--card-width)] shrink-0'
    : 'w-full';

  return (
    <article className={`media-card group ${sizeClass} ${className}`}>
      <div className="relative aspect-2/3 w-full overflow-hidden rounded-md bg-neutral-800 ring-1 ring-white/0 transition-[box-shadow,ring-color] duration-500 ease-out group-hover:ring-white/15 group-hover:shadow-[0_10px_28px_rgba(0,0,0,0.5)]">
        <button
          type="button"
          onClick={() => openModal(typed)}
          className="absolute inset-0 z-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-inset"
          aria-label={`View details for ${title}`}
        >
          <img
            src={poster}
            alt=""
            loading="lazy"
            draggable={false}
            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/20 to-transparent opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 max-md:opacity-0" />
        </button>

        <button
          type="button"
          onClick={() => playItem({ ...typed, media_type: tv ? 'tv' : 'movie' })}
          className="absolute bottom-2.5 left-2.5 z-10 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-white text-black opacity-0 shadow-lg transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 hover:scale-105 max-md:hidden"
          aria-label={`Play ${title}`}
        >
          <Play weight="fill" size={14} className="ml-0.5" />
        </button>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] translate-y-2 p-2.5 pt-10 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 max-md:hidden">
          <p className="text-[0.72rem] font-semibold leading-snug text-white line-clamp-2">{title}</p>
          {year && <p className="text-[0.65rem] text-neutral-400">{year}</p>}
        </div>

        <span
          className="pointer-events-none absolute top-1.5 right-1.5 z-[2] rounded border border-white/10 bg-black/70 px-1.5 py-0.5 text-[0.62rem] font-bold backdrop-blur-sm"
          style={{ color: scoreC }}
        >
          ★ {score}
        </span>
      </div>
    </article>
  );
}

export function SkeletonCard() {
  return (
    <div className="w-[var(--card-width)] shrink-0">
      <div className="aspect-2/3 rounded-md skeleton-shimmer" />
    </div>
  );
}
