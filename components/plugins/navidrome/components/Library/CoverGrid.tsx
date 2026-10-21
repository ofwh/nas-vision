import type { MusicItem } from '../../types';
import { useNavidromeTranslations } from '../../i18n/useTranslations';
import Cover from '../Cover';

type CoverGridProps = { items: MusicItem[]; onOpen: (item: MusicItem) => void };

export default function CoverGrid({ items, onOpen }: CoverGridProps) {
  const t = useNavidromeTranslations();

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
          <div
            className="relative mb-2.5 aspect-square w-full rounded-[9px] data-[kind=artist]:rounded-full"
            data-kind={item.kind}
          >
            <div className="size-full overflow-hidden rounded-[inherit]">
              <Cover
                key={item.coverArt ?? item.id}
                item={item}
                className="rounded-[9px] [&>:is(img,svg)]:transition-[scale,filter] [&>:is(img,svg)]:duration-350 [&>:is(img,svg)]:ease-in-out group-hover/card:[&>:is(img,svg)]:scale-[1.025] group-hover/card:[&>:is(img,svg)]:brightness-105 group-focus-visible/card:[&>:is(img,svg)]:scale-[1.025] group-focus-visible/card:[&>:is(img,svg)]:brightness-105 motion-reduce:[&>:is(img,svg)]:scale-100 motion-reduce:[&>:is(img,svg)]:transition-none"
              />
            </div>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 shadow-[0_0_0_1px_rgb(255_248_241/24%),0_0_12px_2px_rgb(255_234_215/18%),0_0_26px_5px_rgb(255_234_215/8%)] transition-opacity duration-650 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:opacity-100 group-focus-visible/card:opacity-100 motion-reduce:transition-none"
            />
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
