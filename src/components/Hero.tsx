import { Check, Info, Play, Plus, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useInWishlist } from '../store/wishlistStore';
import { formatDate, img, isTV, scoreColor } from '../lib/utils';

export function Hero() {
  const { heroItem, playItem, openModal, toggleWishlist, viewMode, currentTab } = useApp();
  const inList = useInWishlist(heroItem);

  if (viewMode !== 'browse' || currentTab === 'list' || !heroItem) return null;

  const tv = isTV(heroItem);
  const title = heroItem.title || heroItem.name || 'Unknown';
  const score = heroItem.vote_average || 0;
  const year = formatDate(heroItem.release_date || heroItem.first_air_date);
  const bgPath = img(heroItem.backdrop_path, 'original');
  const typed = { ...heroItem, media_type: tv ? 'tv' as const : 'movie' as const };

  return (
    <section className="relative h-[72svh] min-h-[420px] md:h-[clamp(min(520px,100svh),62vw,88svh)] md:min-h-0 flex items-end overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-[center_top] after:absolute after:inset-0 after:bg-[linear-gradient(to_right,rgba(26,19,34,0.92)_0%,rgba(26,19,34,0.55)_45%,transparent_80%),linear-gradient(to_top,#1A1322_0%,rgba(26,19,34,0.35)_35%,transparent_70%)] max-md:after:bg-[linear-gradient(to_top,#1A1322_8%,rgba(26,19,34,0.6)_45%,rgba(26,19,34,0.1)_100%)]"
        style={{ backgroundImage: bgPath ? `url(${bgPath})` : undefined }}
      />
      <div className="relative z-2 w-full px-[4%] max-md:px-[3%] pb-8 md:pb-[6%] max-w-[700px] max-md:max-w-full">
        <p className="mb-3 text-sm font-medium text-neutral-300">
          {tv ? 'TV show' : 'Movie'}
          {year && <span className="text-neutral-400">, {year}</span>}
        </p>
        <h1 className="font-display text-[clamp(2.4rem,6vw,4.75rem)] font-extrabold leading-[0.95] tracking-[-0.035em] text-ink mb-4 text-shadow-hero line-clamp-2 text-balance">
          {title}
        </h1>
        <div className="flex items-center gap-3 text-sm text-neutral-300 mb-3">
          <span className="inline-flex items-center gap-1 font-semibold" style={{ color: scoreColor(score) }}>
            <Star size={15} fill="currentColor" strokeWidth={0} /> {score.toFixed(1)}
          </span>
          {heroItem.adult && <span className="rounded border border-white/25 px-1.5 text-xs font-semibold">18+</span>}
        </div>
        <p className="text-[0.95rem] leading-relaxed text-neutral-300 max-w-[52ch] mb-6 line-clamp-3 max-sm:line-clamp-2 [@media(max-height:520px)]:hidden">
          {heroItem.overview}
        </p>
        <div className="flex gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => playItem(typed)}
            className="max-sm:flex-1 inline-flex items-center justify-center gap-2 bg-brand text-brand-ink font-semibold text-base h-12 px-8 rounded-full hover:brightness-110 active:scale-[0.98] transition-[filter,transform]"
          >
            <Play size={18} fill="currentColor" strokeWidth={0} /> Play
          </button>
          <button
            type="button"
            onClick={() => toggleWishlist(typed)}
            aria-pressed={inList}
            aria-label={inList ? 'Remove from My List' : 'Add to My List'}
            className="inline-flex items-center justify-center gap-2 h-12 max-sm:w-12 sm:px-6 rounded-full border border-white/25 bg-velvet/40 backdrop-blur-md text-ink font-semibold hover:border-white/60 active:scale-[0.98] transition-[border-color,transform]"
          >
            {inList ? <Check size={19} className="text-brand" /> : <Plus size={19} />}
            <span className="max-sm:hidden">{inList ? 'In My List' : 'My List'}</span>
          </button>
          <button
            type="button"
            onClick={() => openModal(heroItem)}
            aria-label="More info"
            className="inline-flex items-center justify-center gap-2 h-12 max-sm:w-12 sm:px-5 rounded-full text-ink font-semibold hover:bg-white/10 active:scale-[0.98] transition-[background-color,transform]"
          >
            <Info size={19} />
            <span className="max-sm:hidden">More info</span>
          </button>
        </div>
      </div>
    </section>
  );
}
