import { useMemo } from 'react';
import { Check, Clapperboard, Play, Plus, Star, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useGenreMap, useTvSeason } from '../hooks/useTmdbSwr';
import { useInWishlist } from '../store/wishlistStore';
import { Spinner } from './Spinner';
import { formatDate, getTitle, img, imgFallback, isTV, scoreColor } from '../lib/utils';

export function DetailModal() {
  const {
    modalOpen, modalItem, closeModal, playItem, openTrailer, historyBack,
    selectedSeason, selectedEpisode, totalSeasons, setSelectedSeason, setSelectedEpisode, toggleWishlist,
  } = useApp();
  const inList = useInWishlist(modalItem);

  const tv = modalItem ? isTV(modalItem) : false;
  const type = tv ? 'tv' as const : 'movie' as const;

  const { map: genreMap } = useGenreMap(modalOpen);
  const genreNames = useMemo(() => {
    if (!modalItem) return [];
    return (modalItem.genre_ids || [])
      .slice(0, 6)
      .map((id) => genreMap[id])
      .filter(Boolean) as string[];
  }, [modalItem, genreMap]);

  const { data: seasonData, isLoading: episodesLoading } = useTvSeason(
    tv && modalItem ? modalItem.id : null,
    selectedSeason,
    modalOpen && tv,
  );
  const episodeCount = (seasonData?.episodes as unknown[] | undefined)?.length || 12;

  if (!modalItem) return null;

  const title = getTitle(modalItem);
  const score = (modalItem.vote_average || 0).toFixed(1);
  const year = formatDate(modalItem.release_date || modalItem.first_air_date);
  const scoreC = scoreColor(parseFloat(score));
  const backdrop = img(modalItem.backdrop_path, 'w1280') || imgFallback(modalItem.poster_path, 'w1280');

  const maxEpisodes = Math.min(episodeCount, 30);

  const chip = (active: boolean) =>
    `h-11 sm:w-11 sm:h-10 rounded-xl text-sm font-semibold tabular-nums border transition-colors cursor-pointer ${
      active
        ? 'bg-brand border-brand text-brand-ink'
        : 'bg-surface-2/60 border-white/8 text-neutral-200 hover:border-brand/60 hover:text-ink'
    }`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
      data-lenis-prevent
      className={`fixed inset-0 z-[1000] flex justify-center overflow-y-auto overscroll-contain sm:p-6 md:p-10 transition-all duration-350 ${
        modalOpen ? 'bg-[rgba(14,9,19,0.82)] backdrop-blur-md pointer-events-auto' : 'bg-transparent pointer-events-none'
      }`}
      onClick={(e) => e.target === e.currentTarget && historyBack()}
    >
      <div
        className={`bg-surface sm:rounded-3xl max-w-[880px] w-full min-h-full sm:min-h-0 sm:my-auto h-fit overflow-hidden relative ring-1 ring-white/8 shadow-[0_40px_100px_rgba(8,4,12,0.7)] transition-all duration-380 ${
          modalOpen ? 'scale-100 opacity-100 translate-y-0' : 'sm:scale-[0.94] opacity-0 translate-y-8'
        }`}
      >
        <button
          type="button"
          onClick={historyBack}
          className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-5 w-10 h-10 rounded-full bg-velvet/70 backdrop-blur-md border border-white/15 text-ink flex items-center justify-center hover:bg-velvet transition-colors cursor-pointer"
          title="Close"
          aria-label="Close"
        >
          <X size={19} />
        </button>

        <div className="relative aspect-video bg-surface-2">
          <img src={backdrop} alt="" className="w-full h-full object-cover block" />
          <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/40 to-transparent" />
        </div>

        <div className="relative -mt-14 sm:-mt-24 px-5 sm:px-9 pb-[max(1.75rem,env(safe-area-inset-bottom))] sm:pb-9">
          <h2 id="modalTitle" className="font-display text-[2rem] sm:text-[2.75rem] font-extrabold leading-[0.98] tracking-[-0.03em] mb-3 text-ink text-shadow-hero text-balance">{title}</h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-5 text-sm text-neutral-300">
            <span className="inline-flex items-center gap-1 font-semibold tabular-nums" style={{ color: scoreC }}>
              <Star size={15} fill="currentColor" strokeWidth={0} /> {score}
            </span>
            {year && <span>{year}</span>}
            <span>{tv ? 'TV show' : 'Movie'}</span>
            {modalItem.adult && <span className="rounded border border-white/25 px-1.5 text-xs font-semibold">18+</span>}
          </div>

          <div className="grid grid-cols-2 sm:flex gap-2.5 sm:gap-3 mb-6">
            <button
              type="button"
              onClick={() => { closeModal(); playItem({ ...modalItem, media_type: type }); }}
              className="col-span-2 inline-flex items-center justify-center gap-2 bg-brand text-brand-ink font-semibold h-12 px-8 rounded-full hover:brightness-110 active:scale-[0.98] transition-[filter,transform]"
            >
              <Play size={18} fill="currentColor" strokeWidth={0} />
              {tv ? `Play S${selectedSeason} E${selectedEpisode}` : 'Play'}
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist({ ...modalItem, media_type: type })}
              aria-pressed={inList}
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full border border-white/20 text-ink font-semibold hover:border-white/50 active:scale-[0.98] transition-[border-color,transform]"
            >
              {inList ? <Check size={18} className="text-brand" /> : <Plus size={18} />}
              {inList ? 'In My List' : 'My List'}
            </button>
            <button
              type="button"
              onClick={() => openTrailer(modalItem.id, type)}
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full border border-white/20 text-ink font-semibold hover:border-white/50 active:scale-[0.98] transition-[border-color,transform]"
            >
              <Clapperboard size={18} /> Trailer
            </button>
          </div>

          <p className="text-[0.95rem] sm:text-base leading-relaxed text-neutral-300 max-w-[65ch] mb-5">{modalItem.overview || 'No description available.'}</p>

          {genreNames.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-7">
              {genreNames.map((name) => (
                <span key={name} className="rounded-full bg-white/6 px-3 py-1 text-xs font-medium text-neutral-300">
                  {name}
                </span>
              ))}
            </div>
          )}

          {tv && (
            <div className="border-t border-white/8 pt-6">
              <h3 className="font-display text-lg font-bold text-ink mb-3">Seasons</h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(44px,1fr))] sm:flex sm:flex-wrap gap-2 mb-6">
                {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setSelectedSeason(s); setSelectedEpisode(1); }}
                    aria-pressed={s === selectedSeason}
                    aria-label={`Season ${s}`}
                    className={chip(s === selectedSeason)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <h3 className="font-display text-lg font-bold text-ink mb-3">Episodes</h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(44px,1fr))] sm:flex sm:flex-wrap gap-2">
                {episodesLoading ? (
                  <Spinner small />
                ) : (
                  Array.from({ length: maxEpisodes }, (_, i) => i + 1).map((ep) => (
                    <button
                      key={ep}
                      type="button"
                      onClick={() => setSelectedEpisode(ep)}
                      aria-pressed={ep === selectedEpisode}
                      aria-label={`Episode ${ep}`}
                      className={chip(ep === selectedEpisode)}
                    >
                      {ep}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
