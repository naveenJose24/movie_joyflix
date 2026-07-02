import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { useApp } from '../context/AppContext';
import { useMediaRowScroll } from '../hooks/useMediaRowScroll';
import type { MediaItem, RowData } from '../lib/types';
import { MediaCard, SkeletonCard } from './MediaCard';

interface MediaRowProps {
  row?: RowData;
  title?: string;
  items?: MediaItem[];
  endpoint?: string;
  params?: Record<string, string | number>;
  variant?: 'default' | 'top10';
  loading?: boolean;
}

function RowHeader({
  title,
  onSeeAll,
  showSeeAll,
}: {
  title: string;
  onSeeAll?: () => void;
  showSeeAll?: boolean;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4 px-[4%] max-md:px-[3%]">
      <h2 className="text-lg font-bold tracking-tight text-white">{title}</h2>
      {showSeeAll && onSeeAll && (
        <button
          type="button"
          onClick={onSeeAll}
          className="shrink-0 text-xs font-semibold text-joyflix-red transition-colors hover:text-white hover:underline"
        >
          See all
        </button>
      )}
    </div>
  );
}

function ScrollButton({
  direction,
  visible,
  onClick,
}: {
  direction: 'prev' | 'next';
  visible: boolean;
  onClick: () => void;
}) {
  const isPrev = direction === 'prev';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isPrev ? 'Scroll row left' : 'Scroll row right'}
      className={`absolute top-0 z-10 flex h-full w-12 items-center justify-center text-white transition-all duration-300 ${
        isPrev
          ? 'left-0 bg-linear-to-r from-joyflix-bg via-joyflix-bg/80 to-transparent pl-1'
          : 'right-0 bg-linear-to-l from-joyflix-bg via-joyflix-bg/80 to-transparent pr-1'
      } ${visible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'} max-md:hidden`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/55 backdrop-blur-sm transition-transform duration-200 hover:scale-105 hover:bg-black/75">
        {isPrev ? <CaretLeft size={18} weight="bold" /> : <CaretRight size={18} weight="bold" />}
      </span>
    </button>
  );
}

function Top10Slide({ item, rank }: { item: MediaItem; rank: number }) {
  return (
    <div className="top10-slide">
      <span className="top10-rank pointer-events-none select-none" aria-hidden>
        {rank}
      </span>
      <div className="top10-poster">
        <MediaCard item={item} variant="row" />
      </div>
    </div>
  );
}

export function MediaRow({
  row,
  title: titleProp,
  items: itemsProp,
  endpoint: endpointProp,
  params: paramsProp,
  variant = 'default',
  loading = false,
}: MediaRowProps) {
  const { openGridPage } = useApp();
  const { scrollerRef, canPrev, canNext, scrollByPage } = useMediaRowScroll();

  const title = row?.title ?? titleProp ?? '';
  const items = row?.items ?? itemsProp ?? [];
  const endpoint = row?.endpoint ?? endpointProp;
  const params = row?.params ?? paramsProp ?? {};
  const isTop10 = variant === 'top10' || row?.top10;

  const handleSeeAll = endpoint
    ? () => openGridPage(title, endpoint, null, params)
    : undefined;

  if (loading) {
    return (
      <section className="media-row mb-11">
        <RowHeader title={title || 'Loading…'} />
        <div className="media-row-scroll">
          {Array.from({ length: 12 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (!items.length) return null;

  const displayItems = isTop10 ? items.slice(0, 10) : items;

  return (
    <section className="media-row group/row mb-11">
      <RowHeader title={title} showSeeAll={!!endpoint} onSeeAll={handleSeeAll} />

      <div className="relative">
        <ScrollButton direction="prev" visible={canPrev} onClick={() => scrollByPage('prev')} />
        <ScrollButton direction="next" visible={canNext} onClick={() => scrollByPage('next')} />

        <div ref={scrollerRef} className="media-row-scroll">
          {isTop10
            ? displayItems.map((item, i) => (
                <Top10Slide key={`${item.id}-${i}`} item={item} rank={i + 1} />
              ))
            : displayItems.map((item) => (
                <MediaCard key={`${item.id}-${item.media_type}`} item={item} variant="row" />
              ))}
        </div>
      </div>
    </section>
  );
}
