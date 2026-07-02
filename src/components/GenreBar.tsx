import { ALL_GENRES } from '../lib/constants';
import { useApp } from '../context/AppContext';

export function GenreBar() {
  const { currentGenreId, selectGenre, viewMode } = useApp();

  if (viewMode === 'search' || viewMode === 'grid') return null;

  return (
    <div className="genre-bar-scroll flex gap-2 overflow-x-auto scrollbar-none px-[4%] max-md:px-[3%] py-2.5 mt-[68px] overscroll-x-contain cursor-grab active:cursor-grabbing">
      {ALL_GENRES.map((g) => (
        <button
          key={g.name}
          type="button"
          onClick={() => selectGenre(g.id, g.name)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
            g.id === currentGenreId
              ? 'bg-joyflix-red border-joyflix-red text-white'
              : 'bg-white/8 border-white/12 text-neutral-400 hover:bg-joyflix-red hover:border-joyflix-red hover:text-white'
          }`}
        >
          {g.name}
        </button>
      ))}
    </div>
  );
}
