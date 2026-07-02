import { useMemo } from 'react';
import { Play, X, YoutubeLogo } from '@phosphor-icons/react';
import { useApp } from '../context/AppContext';
import { useGenreMap, useTvSeason } from '../hooks/useTmdbSwr';
import { formatDate, getTitle, img, imgFallback, isTV, scoreColor } from '../lib/utils';

export function DetailModal() {
  const {
    modalOpen, modalItem, closeModal, playItem, openTrailer, historyBack,
    selectedSeason, selectedEpisode, totalSeasons, setSelectedSeason, setSelectedEpisode,
  } = useApp();

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
      className={`fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto p-8 max-md:p-4 transition-all duration-350 ${
        modalOpen ? 'bg-black/85 backdrop-blur-sm pointer-events-auto' : 'bg-transparent pointer-events-none'
      }`}
      onClick={(e) => e.target === e.currentTarget && historyBack()}
    >
      <div
        className={`bg-[#181818] rounded-2xl max-w-[860px] w-full overflow-hidden relative shadow-[0_30px_80px_rgba(0,0,0,0.8)] transition-all duration-380 ${
          modalOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-[0.88] opacity-0 translate-y-8'
        }`}
      >
        <button
          type="button"
          onClick={historyBack}
          className="absolute top-3 right-3 z-5 w-8 h-8 rounded-full bg-black/75 border border-white/15 text-white flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
          title="Close"
        >
          <X size={16} />
        </button>

        <div className="relative aspect-video bg-neutral-800">
          <img src={backdrop} alt="" className="w-full h-full object-cover block" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] to-transparent" />
        </div>

        <div className="px-7 max-md:px-4 pb-7 max-md:pb-5">
          <h2 id="modalTitle" className="text-2xl font-black tracking-tight mb-2">{title}</h2>
          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-neutral-400">
            <span className="font-bold text-[0.88rem]" style={{ color: scoreC }}>★ {score}</span>
            {year && <span>{year}</span>}
            <span className="border border-white/20 px-1.5 py-0.5 rounded text-xs font-semibold">{tv ? 'TV Show' : 'Movie'}</span>
            {modalItem.adult && <span className="border border-white/20 px-1.5 py-0.5 rounded text-xs font-semibold">18+</span>}
          </div>
          <p className="text-sm leading-relaxed text-neutral-400 mb-5">{modalItem.overview || 'No description available.'}</p>

          {tv && (
            <div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1">Season</p>
              <div className="flex gap-2 flex-wrap mb-4">
                {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setSelectedSeason(s); setSelectedEpisode(1); }}
                    className={`w-[38px] h-[38px] rounded-md text-sm font-semibold border transition-colors cursor-pointer ${
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
              <div className="flex gap-2 flex-wrap mb-4">
                {episodesLoading ? (
                  <div className="spinner-small" />
                ) : (
                  Array.from({ length: maxEpisodes }, (_, i) => i + 1).map((ep) => (
                    <button
                      key={ep}
                      type="button"
                      onClick={() => setSelectedEpisode(ep)}
                      className={`w-[38px] h-[38px] rounded-md text-sm font-semibold border transition-colors cursor-pointer ${
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

          <div className="flex gap-3 flex-wrap mb-5">
            <button
              type="button"
              onClick={() => { closeModal(); playItem({ ...modalItem, media_type: type }); }}
              className="inline-flex items-center gap-2 bg-white text-black font-bold px-7 py-2.5 rounded-md hover:bg-white/85 hover:scale-[1.03] transition-all"
            >
              <Play weight="fill" size={18} /> Play
            </button>
            <button
              type="button"
              onClick={() => openTrailer(modalItem.id, type)}
              className="inline-flex items-center gap-2 bg-neutral-500/70 text-white font-semibold px-6 py-2.5 rounded-md hover:bg-neutral-500/50 hover:scale-[1.03] transition-all"
            >
              <YoutubeLogo size={18} /> Trailer
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
