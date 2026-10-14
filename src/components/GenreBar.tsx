import { ALL_GENRES } from '../lib/constants';
import { useApp } from '../context/AppContext';

export function GenreBar() {
  const { currentGenreId, currentTab, selectGenre, viewMode } = useApp();

  if (viewMode === 'search' || viewMode === 'grid' || currentTab === 'list') return null;

  return (
    <div className="genre-bar-scroll flex gap-2 overflow-x-auto scrollbar-none px-[4%] max-md:px-[3%] py-2.5 mt-(--nav-h) overscroll-x-contain cursor-grab active:cursor-grabbing">
      {ALL_GENRES.map((g) => (
        <button
          key={g.name}
          type="button"
          onClick={() => selectGenre(g.id, g.name)}
          className={`shrink-0 h-9 px-4 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
            g.id === currentGenreId
              ? 'bg-ink border-ink text-velvet'
              : 'bg-surface/60 border-white/10 text-neutral-300 backdrop-blur-sm hover:border-white/35 hover:text-ink'
          }`}
        >
          {g.name}
        </button>
      ))}
    </div>
  );
}
