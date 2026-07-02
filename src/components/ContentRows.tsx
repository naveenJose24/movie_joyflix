import { useApp } from '../context/AppContext';
import { MediaRow } from './MediaRow';

export function ContentRows() {
  const { rows, rowsLoading, viewMode } = useApp();

  if (viewMode !== 'browse') return null;

  if (rowsLoading) {
    return (
      <main className="relative z-2 pb-16 max-md:pb-[calc(4rem+72px)]">
        {Array.from({ length: 6 }, (_, i) => (
          <MediaRow key={i} title="Loading…" loading />
        ))}
      </main>
    );
  }

  return (
    <main className="relative z-2 pb-16 max-md:pb-[calc(4rem+72px)]">
      {rows?.map((row) => (
        <MediaRow
          key={row.title}
          row={row}
          variant={row.top10 ? 'top10' : 'default'}
        />
      ))}
    </main>
  );
}
