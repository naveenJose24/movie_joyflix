import { FilmSlate, Info, Play, TelevisionSimple } from '@phosphor-icons/react';
import { useApp } from '../context/AppContext';
import { formatDate, img, isTV, scoreColor } from '../lib/utils';

export function Hero() {
  const { heroItem, playItem, openModal, viewMode, currentTab } = useApp();

  if (viewMode !== 'browse' || currentTab === 'list' || !heroItem) return null;

  const tv = isTV(heroItem);
  const title = heroItem.title || heroItem.name || 'Unknown';
  const score = (heroItem.vote_average || 0).toFixed(1);
  const year = formatDate(heroItem.release_date || heroItem.first_air_date);
  const bgPath = img(heroItem.backdrop_path, 'original');

  return (
    <section className="relative h-[68svh] min-h-[400px] md:h-[clamp(min(480px,100svh),62vw,85svh)] md:min-h-0 flex items-end overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-[center_top] transition-opacity duration-1000 after:absolute after:inset-0 after:bg-[linear-gradient(to_right,rgba(20,20,20,0.95)_0%,rgba(20,20,20,0.6)_50%,transparent_100%),linear-gradient(to_top,rgba(20,20,20,1)_0%,rgba(20,20,20,0.3)_30%,transparent_100%)]"
        style={{ backgroundImage: bgPath ? `url(${bgPath})` : undefined }}
      />
      <div className="relative z-2 w-full px-[4%] max-md:px-[3%] pb-6 md:pb-[5%] max-w-[640px] max-md:max-w-full">
        <div className="inline-flex items-center gap-1.5 bg-joyflix-red/15 border border-joyflix-red/40 text-joyflix-red text-[0.72rem] font-bold tracking-widest uppercase px-2.5 py-1 rounded mb-3">
          {tv ? <TelevisionSimple weight="fill" size={14} /> : <FilmSlate weight="fill" size={14} />}
          {tv ? 'TV SHOW' : 'MOVIE'}
        </div>
        <h1 className="text-[clamp(2rem,5vw,3.6rem)] font-black leading-tight tracking-tight mb-3 text-shadow-hero max-md:text-[1.9rem] line-clamp-2">
          {title}
        </h1>
        <div className="flex items-center gap-3 text-sm text-neutral-400 mb-2">
          <span className="font-bold text-[0.9rem]" style={{ color: scoreColor(parseFloat(score)) }}>
            ★ {score}
          </span>
          {year && <span>{year}</span>}
          <span className="border border-white/20 px-1.5 py-0.5 rounded text-xs font-semibold text-neutral-400">
            {heroItem.adult ? '18+' : tv ? 'TV' : 'PG'}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-neutral-400 max-w-[480px] mb-5 line-clamp-3 max-sm:line-clamp-2 [@media(max-height:520px)]:hidden">
          {heroItem.overview}
        </p>
        <div className="grid grid-cols-2 sm:flex gap-3">
          <button
            type="button"
            onClick={() => playItem(heroItem)}
            className="inline-flex items-center justify-center gap-2 bg-white text-black font-bold text-[0.95rem] px-7 py-3 sm:py-2.5 rounded-md hover:bg-white/85 hover:scale-[1.03] transition-all"
          >
            <Play weight="fill" size={18} /> Play Now
          </button>
          <button
            type="button"
            onClick={() => openModal(heroItem)}
            className="inline-flex items-center justify-center gap-2 bg-neutral-500/70 text-white font-semibold text-[0.95rem] px-6 py-3 sm:py-2.5 rounded-md backdrop-blur-sm hover:bg-neutral-500/50 hover:scale-[1.03] transition-all"
          >
            <Info size={18} /> More Info
          </button>
        </div>
      </div>
    </section>
  );
}
