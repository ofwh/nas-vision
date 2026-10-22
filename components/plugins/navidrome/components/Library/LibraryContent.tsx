import type { ReactNode } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { MusicItem } from '../../types';
import LibraryStatus from './LibraryStatus';
import CoverGrid from './CoverGrid';
import SongList from './SongList';
import LoadMore from './LoadMore';

type LibraryContentProps = {
  header: ReactNode;
  items: MusicItem[];
  isLoading: boolean;
  error?: Error;
  isQueue: boolean;
  isSearch: boolean;
  source: string;
  starringId: string | null;
  isLoadingMore: boolean;
  hasMore: boolean;
  onRetry: () => void;
  onOpen: (item: MusicItem) => void;
  onPlay: (index: number) => void;
  onStar: (song: MusicItem) => void;
  onLoadMore: () => void;
};

export default function LibraryContent({
  header,
  items,
  isLoading,
  error,
  isQueue,
  isSearch,
  source,
  starringId,
  isLoadingMore,
  hasMore,
  onRetry,
  onOpen,
  onPlay,
  onStar,
  onLoadMore,
}: LibraryContentProps) {
  const cards = items.filter((item) => item.kind !== 'song');
  const songs = items.filter((item) => item.kind === 'song');

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col">
      {header}
      <ScrollArea className="mt-[23px] h-0 min-h-0 min-w-0 flex-1 overflow-hidden [&_[data-slot=scroll-area-viewport]]:overscroll-contain">
        <div className="@container w-full min-w-0 px-[30px] pt-[23px] pb-[30px] @max-[850px]/music-window:px-[22px] @max-[560px]/music-window:px-4">
          <LibraryStatus
            isLoading={isLoading}
            error={items.length ? undefined : error}
            empty={!items.length}
            isQueue={isQueue}
            isSearch={isSearch}
            onRetry={onRetry}
          />
          {cards.length ? <CoverGrid items={cards} onOpen={onOpen} /> : null}
          {songs.length ? (
            <SongList
              songs={songs}
              isQueue={isQueue}
              source={source}
              starringId={starringId}
              onPlay={onPlay}
              onStar={onStar}
            />
          ) : null}
          {!isQueue && items.length > 0 && hasMore ? (
            <LoadMore isLoading={isLoadingMore} error={error} onLoad={onLoadMore} onRetry={onRetry} />
          ) : null}
        </div>
      </ScrollArea>
    </main>
  );
}
