import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { MusicItem } from '../../types';
import { useNavidromeTranslations } from '../../i18n/useTranslations';
import { usePlaylistsStore } from '../../stores/context';
import Cover from '../Cover';
import CreatePlaylistModal from '../Playlist/CreatePlaylistModal';
import useVirtualRows from '../../hooks/useVirtualRows';

type PlaylistMenuProps = {
  activeId?: string;
  onOpen: (item: MusicItem) => void;
};

const playlistLayout = () => ({ columns: 1, rowHeight: 53 });

export default function PlaylistMenu({ activeId, onOpen }: PlaylistMenuProps) {
  const locale = useLocale();
  const t = useNavidromeTranslations();
  const { items, isLoading, error, list, upsert } = usePlaylistsStore((state) => state);
  const [creating, setCreating] = useState(false);
  const { setContainer, rows, rowHeight, height } = useVirtualRows(items.length, playlistLayout);

  return (
    <>
      <div className="flex items-center justify-between gap-2.5 pt-[30px] pb-3 pl-[13px] text-xs font-semibold @max-[560px]/music-window:justify-center @max-[560px]/music-window:px-0 @max-[560px]/music-window:pt-5 @max-[560px]/music-window:[&>span]:hidden">
        <span>{t('library.myPlaylists')}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-xs"
            className="rounded-full text-white/60 hover:bg-white/10 hover:text-white"
            aria-label={t('playlist.create')}
            title={t('playlist.create')}
            onClick={() => setCreating(true)}
          >
            <Plus aria-hidden className="size-4" />
          </Button>
        </div>
      </div>
      {creating ? <CreatePlaylistModal onClose={() => setCreating(false)} onCreated={upsert} /> : null}
      <ScrollArea className="h-0 min-h-0 min-w-0 flex-1 overflow-hidden [&_[data-slot=scroll-area-viewport]]:overscroll-contain">
        <div>
          <div ref={setContainer} className="relative" style={{ height }}>
            {rows.map((index) => {
              const item = items[index];

              return (
                <Button
                  key={item.id}
                  style={{ top: index * rowHeight }}
                  variant="ghost"
                  className="absolute inset-x-0 h-12 w-full shrink-0 justify-start gap-3 rounded-lg px-3 py-1.5 font-normal text-white/85 transition-colors duration-200 hover:bg-white/10 hover:text-white active:bg-white/15 active:text-white data-[active=true]:bg-white/15 data-[active=true]:text-white motion-reduce:transition-none @max-[560px]/music-window:justify-center @max-[560px]/music-window:px-0 dark:hover:bg-white/10 [&>span:last-child]:truncate @max-[560px]/music-window:[&>span:last-child]:hidden"
                  aria-label={item.name || t('common.unnamed')}
                  title={item.name || t('common.unnamed')}
                  aria-current={activeId === item.id ? 'page' : undefined}
                  data-active={activeId === item.id}
                  onClick={() => onOpen(item)}
                >
                  <Cover key={item.coverArt ?? item.id} item={item} className="size-[30px] shrink-0 rounded-full" />
                  <span>{item.name || t('common.unnamed')}</span>
                </Button>
              );
            })}
          </div>
          {isLoading ? (
            <p className="p-3 text-xs leading-[1.8] text-[#fff8f1]/40">{t('library.loadingPlaylists')}</p>
          ) : error ? (
            <Button variant="ghost" onClick={() => void list(locale)}>
              {t('library.retryPlaylists')}
            </Button>
          ) : !items.length ? (
            <p className="p-3 text-xs leading-[1.8] text-[#fff8f1]/40">{t('library.emptyPlaylists')}</p>
          ) : null}
        </div>
      </ScrollArea>
    </>
  );
}
