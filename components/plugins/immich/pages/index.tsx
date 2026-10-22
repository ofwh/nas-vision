'use client';

import { useCallback, useRef, useState } from 'react';
import { Images, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePlugin } from '@/hooks/usePlugin';
import type { PluginViewProps } from '@/types/plugins';
import { useImmichTranslations } from '../i18n/useTranslations';
import type { ImmichMedia, ImmichMode, ImmichOrder } from '../types';
import DirectoryGrid from '../components/Directory/DirectoryGrid';
import PhotoModal from '../components/Photo/PhotoModal';
import VideoModal from '../components/Video/VideoModal';
import DetailGrid from '../components/Detail/DetailGrid';
import GalleryHeader from '../components/GalleryHeader';
import useGallery from '../hooks/useGallery';

function Gallery({
  directory,
  mode,
  order,
  onOrderChange,
}: {
  directory?: string;
  mode?: ImmichMode;
  order: ImmichOrder;
  onOrderChange: (order: ImmichOrder) => void;
}) {
  const t = useImmichTranslations();
  const { page: navigation } = usePlugin('immich');
  const container = useRef<HTMLDivElement>(null);
  const setScrollArea = useCallback((node: HTMLDivElement | null) => {
    container.current = node?.querySelector<HTMLDivElement>('[data-slot="scroll-area-viewport"]') ?? null;
  }, []);
  const [selected, setSelected] = useState<ImmichMedia | null>(null);
  const { data, items, error, isLoading, isValidating, hasMore, sentinel, refresh, retry } = useGallery(
    directory,
    mode,
    order,
    container,
  );
  const directories = items.filter((item) => item.type === 'directory');
  const images = items.filter((item) => item.type !== 'directory');
  const selectedIndex = selected ? images.findIndex((image) => image.id === selected.id) : -1;
  const previous = selectedIndex > 0 ? images[selectedIndex - 1] : undefined;
  const next = selectedIndex >= 0 ? images[selectedIndex + 1] : undefined;
  const root = data ? `/${data.mode}` : '/';
  const navigate = (id: string) => navigation.navigate(`${root}/directory/${encodeURIComponent(id)}`);

  return (
    <div className="relative flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden text-zinc-100">
      <GalleryHeader
        mode={data?.mode}
        order={order}
        onOrderChange={onOrderChange}
        loading={isLoading || isValidating}
        canGoBack={Boolean(data && data.parent !== null)}
        onBack={() => (data?.parent ? navigate(data.parent) : navigation.navigate(root))}
        onRoot={() => navigation.navigate(root)}
        onModeChange={(mode) => navigation.navigate(`/${mode}`)}
        onRefresh={error ? retry : refresh}
      />
      {isLoading ? (
        <div role="status" className="flex min-h-0 flex-1 items-center justify-center gap-3 p-6 text-sm text-white/50">
          <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" />
          {t('ui.loading')}
        </div>
      ) : error ? (
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-6">
          <div role="alert" className="max-w-full rounded-xl bg-white/5 p-6 text-center wrap-break-word">
            <p className="text-sm text-red-300">{error.message}</p>
            <p className="mt-2 text-sm text-white/50">{t('ui.settingsHint')}</p>
            <Button variant="ghost" className="mt-4" onClick={retry}>
              {t('ui.retry')}
            </Button>
          </div>
        </div>
      ) : (
        <ScrollArea
          ref={setScrollArea}
          className="min-h-0 w-full min-w-0 flex-1 overflow-hidden [&_[data-slot=scroll-area-viewport]]:overscroll-contain"
        >
          <main className="flex min-h-full w-full min-w-0 flex-col">
            {data && !items.length ? (
              <div className="flex min-h-60 flex-col items-center justify-center gap-3 text-white/40">
                <Images className="size-10" strokeWidth={1} />
                <p className="text-sm">{t('ui.empty')}</p>
              </div>
            ) : null}
            {data && directories.length ? (
              <DirectoryGrid mode={data.mode} directories={directories} onOpen={navigate} scrollRef={container} />
            ) : null}
            {images.length ? <DetailGrid images={images} onSelect={setSelected} scrollRef={container} /> : null}
            {hasMore ? <div ref={sentinel} className="h-px shrink-0" aria-hidden="true" /> : null}
            {isValidating && items.length ? (
              <div
                className="flex min-h-12 items-center justify-center py-4 text-sm text-white/50"
                role="status"
                aria-live="polite"
              >
                <LoaderCircle className="mr-2 size-4 animate-spin motion-reduce:animate-none" />
                {t('ui.loadingMore')}
              </div>
            ) : null}
          </main>
        </ScrollArea>
      )}
      {selected?.type === 'video' ? (
        <VideoModal
          key={selected.id}
          video={selected}
          onClose={() => setSelected(null)}
          onPrevious={previous ? () => setSelected(previous) : undefined}
          onNext={next ? () => setSelected(next) : undefined}
        />
      ) : selected ? (
        <PhotoModal
          key={selected.id}
          image={selected}
          onClose={() => setSelected(null)}
          onPrevious={previous ? () => setSelected(previous) : undefined}
          onNext={next ? () => setSelected(next) : undefined}
        />
      ) : null}
    </div>
  );
}

export default function Immich({ path }: PluginViewProps) {
  const [order, setOrder] = useState<ImmichOrder>('asc');
  const t = useImmichTranslations();
  const [, segment, section, ...parts] = path.split('/');
  const mode = segment === 'folders' || segment === 'albums' ? segment : undefined;
  let directory: string | undefined;

  try {
    directory = mode && section === 'directory' ? decodeURIComponent(parts.join('/')) : undefined;
  } catch {
    return (
      <p role="alert" className="flex min-h-0 flex-1 items-center justify-center p-6 text-center text-red-300">
        {t('ui.invalidPath')}
      </p>
    );
  }

  return <Gallery key={`${path}:${order}`} directory={directory} mode={mode} order={order} onOrderChange={setOrder} />;
}
