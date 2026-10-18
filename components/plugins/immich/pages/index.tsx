'use client';

import { useCallback, useRef, useState } from 'react';
import { Images, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePlugin } from '@/hooks/usePlugin';
import type { PluginViewProps } from '@/types/plugins';
import type { ImmichMedia, ImmichMode } from '../types';
import ForderView from '../components/ForderView';
import Detail from '../components/Detail';
import VideoView from '../components/VideoView';
import PhotoView from '../components/PhotoView';
import Footer from '../components/Footer';
import useGallery from '../hooks/useGallery';

function Gallery({ directory, mode }: { directory?: string; mode?: ImmichMode }) {
  const { page: navigation } = usePlugin('immich');
  const container = useRef<HTMLDivElement>(null);
  const setScrollArea = useCallback((node: HTMLDivElement | null) => {
    container.current = node?.querySelector<HTMLDivElement>('[data-slot="scroll-area-viewport"]') ?? null;
  }, []);
  const [selected, setSelected] = useState<ImmichMedia | null>(null);
  const { data, items, error, isLoading, isValidating, hasMore, sentinel, refresh, retry } = useGallery(
    directory,
    mode,
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
    <div className="relative h-full w-full min-w-0 overflow-hidden text-zinc-100">
      <ScrollArea
        ref={setScrollArea}
        className="h-full w-full min-w-0 overflow-hidden [&_[data-slot=scroll-area-thumb]]:bg-white/35 [&_[data-slot=scroll-area-thumb]]:hover:bg-white/55 [&_[data-slot=scroll-area-viewport]]:overscroll-contain"
      >
        <main className="flex min-h-full w-full min-w-0 flex-col">
          {isLoading ? (
            <div role="status" className="flex min-h-60 items-center justify-center gap-3 text-sm text-white/50">
              <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" />
              正在加载媒体资料库…
            </div>
          ) : null}
          {data && !items.length ? (
            <div className="flex min-h-60 flex-col items-center justify-center gap-3 text-white/40">
              <Images className="size-10" strokeWidth={1} />
              <p className="text-sm">这里还没有目录、照片或视频</p>
            </div>
          ) : null}
          {data && directories.length ? (
            <ForderView mode={data.mode} directories={directories} onOpen={navigate} scrollRef={container} />
          ) : null}
          {images.length ? <PhotoView images={images} onSelect={setSelected} scrollRef={container} /> : null}
          {error ? (
            <div role="alert" className="rounded-xl bg-white/5 p-6">
              <p className="text-sm text-red-300">{error.message}</p>
              <p className="mt-2 text-sm text-white/50">
                请检查插件设置中的服务地址与认证信息，以及 API Key 对应的读取权限。
              </p>
              <Button variant="ghost" className="mt-4" onClick={retry}>
                重试
              </Button>
            </div>
          ) : null}
          {hasMore ? <div ref={sentinel} className="h-px shrink-0" aria-hidden="true" /> : null}
          {isValidating && items.length ? (
            <div
              className="flex min-h-12 items-center justify-center py-4 text-sm text-white/50"
              role="status"
              aria-live="polite"
            >
              <LoaderCircle className="mr-2 size-4 animate-spin motion-reduce:animate-none" />
              正在加载更多…
            </div>
          ) : null}
        </main>
      </ScrollArea>
      {data ? (
        <Footer
          name={data.name}
          mode={data.mode}
          loading={isValidating}
          canGoBack={data.parent !== null}
          onBack={() => (data.parent ? navigate(data.parent) : navigation.navigate(root))}
          onRoot={() => navigation.navigate(root)}
          onModeChange={(mode) => navigation.navigate(`/${mode}`)}
          onRefresh={refresh}
        />
      ) : null}
      {selected?.type === 'video' ? (
        <VideoView
          key={selected.id}
          video={selected}
          onClose={() => setSelected(null)}
          onPrevious={previous ? () => setSelected(previous) : undefined}
          onNext={next ? () => setSelected(next) : undefined}
        />
      ) : selected ? (
        <Detail
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
  const [, segment, section, ...parts] = path.split('/');
  const mode = segment === 'folders' || segment === 'albums' ? segment : undefined;
  let directory: string | undefined;
  try {
    directory = mode && section === 'directory' ? decodeURIComponent(parts.join('/')) : undefined;
  } catch {
    return (
      <p role="alert" className="p-6 text-red-300">
        目录路径无效
      </p>
    );
  }
  return <Gallery key={path} directory={directory} mode={mode} />;
}
