import { useMemo } from 'react';
import { Check, Play, Plus, X, YoutubeLogo } from '@phosphor-icons/react';
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
      data-lenis-prevent
      className={`fixed inset-0 z-[1000] flex justify-center overflow-y-auto overscroll-contain sm:p-6 md:p-8 transition-all duration-350 ${
        modalOpen ? 'bg-black/85 backdrop-blur-sm pointer-events-auto' : 'bg-transparent pointer-events-none'
      }`}
      onClick={(e) => e.target === e.currentTarget && historyBack()}
    >
      <div
        className={`bg-[#181818] sm:rounded-2xl max-w-[860px] w-full min-h-full sm:min-h-0 sm:my-auto h-fit overflow-hidden relative shadow-[0_30px_80px_rgba(0,0,0,0.8)] transition-all duration-380 ${
          modalOpen ? 'scale-100 opacity-100 translate-y-0' : 'sm:scale-[0.88] opacity-0 translate-y-8'
        }`}
      >
        <button
          type="button"
          onClick={historyBack}
          className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-5 w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-black/75 border border-white/15 text-white flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
          title="Close"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="relative aspect-video bg-neutral-800">
          <img src={backdrop} alt="" className="w-full h-full object-cover block" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] to-transparent" />
        </div>

        <div className="relative -mt-10 sm:-mt-16 px-4 sm:px-7 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-7">
          <h2 id="modalTitle" className="text-[1.6rem] sm:text-3xl font-black leading-tight tracking-tight mb-2 text-white text-shadow-hero">{title}</h2>
          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-neutral-400">
            <span className="font-bold text-[0.88rem]" style={{ color: scoreC }}>★ {score}</span>
            {year && <span>{year}</span>}
            <span className="border border-white/20 px-1.5 py-0.5 rounded text-xs font-semibold">{tv ? 'TV Show' : 'Movie'}</span>
            {modalItem.adult && <span className="border border-white/20 px-1.5 py-0.5 rounded text-xs font-semibold">18+</span>}
          </div>
          <p className="text-sm sm:text-[0.95rem] leading-relaxed text-neutral-300 mb-5">{modalItem.overview || 'No description available.'}</p>

          {tv && (
            <div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1">Season</p>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(44px,1fr))] sm:flex sm:flex-wrap gap-2 mb-4">
                {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setSelectedSeason(s); setSelectedEpisode(1); }}
                    className={`h-11 sm:w-[38px] sm:h-[38px] rounded-md text-sm font-semibold border transition-colors cursor-pointer ${
                      s === selectedSeason
                        ? 'bg-joyflix-red border-joyflix-red text-white'
                        : 'bg-neutral-800 border-white/8 text-neutral-200 hover:bg-joyflix-red hover:border-joyflix-red'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1">Episode</p>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(44px,1fr))] sm:flex sm:flex-wrap gap-2 mb-4">
                {episodesLoading ? (
                  <Spinner small />
                ) : (
                  Array.from({ length: maxEpisodes }, (_, i) => i + 1).map((ep) => (
                    <button
                      key={ep}
                      type="button"
                      onClick={() => setSelectedEpisode(ep)}
                      className={`h-11 sm:w-[38px] sm:h-[38px] rounded-md text-sm font-semibold border transition-colors cursor-pointer ${
                        ep === selectedEpisode
                          ? 'bg-joyflix-red border-joyflix-red text-white'
                          : 'bg-neutral-800 border-white/8 text-neutral-200 hover:bg-joyflix-red hover:border-joyflix-red'
                      }`}
                    >
                      {ep}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:flex gap-3 mb-5">
            <button
              type="button"
              onClick={() => { closeModal(); playItem({ ...modalItem, media_type: type }); }}
              className="inline-flex items-center justify-center gap-2 bg-white text-black font-bold px-7 py-3 sm:py-2.5 rounded-md hover:bg-white/85 hover:scale-[1.03] transition-all"
            >
              <Play weight="fill" size={18} /> Play
            </button>
            <button
              type="button"
              onClick={() => openTrailer(modalItem.id, type)}
              className="inline-flex items-center justify-center gap-2 bg-neutral-500/70 text-white font-semibold px-6 py-3 sm:py-2.5 rounded-md hover:bg-neutral-500/50 hover:scale-[1.03] transition-all"
            >
              <YoutubeLogo size={18} /> Trailer
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist({ ...modalItem, media_type: type })}
              aria-pressed={inList}
              className={`col-span-2 inline-flex items-center justify-center gap-2 font-semibold px-6 py-3 sm:py-2.5 rounded-md border transition-all hover:scale-[1.03] ${
                inList
                  ? 'bg-white/10 border-white/40 text-white'
                  : 'bg-transparent border-white/25 text-white hover:border-white/60'
              }`}
            >
              {inList ? <Check size={18} weight="bold" /> : <Plus size={18} weight="bold" />}
              {inList ? 'In My List' : 'My List'}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {genreNames.map((name) => (
              <span key={name} className="bg-white/7 border border-white/10 rounded-full px-3 py-1 text-xs font-medium text-neutral-400">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
