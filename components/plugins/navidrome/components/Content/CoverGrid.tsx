import { useLocale } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import type { MusicItem } from '../../types';
import { getTranslator } from '../../i18n';
import Cover from '../Cover';

type CoverGridProps = { items: MusicItem[]; onOpen: (item: MusicItem) => void };

export default function CoverGrid({ items, onOpen }: CoverGridProps) {
  const t = getTranslator(useLocale());

  return (
    <div
      data-navidrome-grid
      className="peer/grid grid grid-cols-[repeat(auto-fill,minmax(min(100%,clamp(132px,22cqi,175px)),1fr))] items-start gap-x-[clamp(12px,2.5cqi,24px)] gap-y-[clamp(20px,3cqi,27px)]"
    >
      {items.map((item) => (
        <button
          className="group/card w-full min-w-0 cursor-pointer text-left focus-visible:rounded-[9px] focus-visible:outline-2 focus-visible:outline-offset-[5px] focus-visible:outline-[#f0a17e] data-[kind=artist]:text-center [&>span]:block [&>span]:truncate [&>span]:text-xs [&>span]:leading-[1.7] [&>span]:text-[#fff8f1]/50 [&>strong]:block [&>strong]:truncate [&>strong]:text-sm [&>strong]:leading-normal [&>strong]:font-medium [&>strong]:text-[#fff8f1]/95"
          data-kind={item.kind}
          key={`${item.kind}:${item.id}`}
          onClick={() => onOpen(item)}
        >
          <div className="relative mb-2.5 aspect-square w-full">
            <Cover key={item.coverArt ?? item.id} item={item} />
            <span className="absolute right-2.5 bottom-2.5 flex size-[34px] translate-y-1 items-center justify-center rounded-full border border-white/20 bg-[rgb(35_25_21/65%)] opacity-0 transition-[opacity,transform] duration-180 group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-visible/card:translate-y-0 group-focus-visible/card:opacity-100 motion-reduce:transition-none">
              <ChevronRight size={22} />
            </span>
          </div>
          <strong>{item.name || t('common.unnamed')}</strong>
          <span>
            {item.artist ??
              (item.kind === 'playlist'
                ? t('common.songCount', { count: item.songCount ?? 0 })
                : item.kind === 'artist'
                  ? t('common.albumCount', { count: item.albumCount ?? 0 })
                  : t('common.unknownArtist'))}
          </span>
        </button>
      ))}
    </div>
  );
}
