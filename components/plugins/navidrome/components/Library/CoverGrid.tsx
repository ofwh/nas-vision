import type { MusicItem } from '../../types';
import { useNavidromeTranslations } from '../../i18n/useTranslations';
import Cover from '../Cover';
import useVirtualRows from '../../hooks/useVirtualRows';

type CoverGridProps = { items: MusicItem[]; onOpen: (item: MusicItem) => void };

function coverLayout(width: number) {
  const columnGap = Math.max(12, Math.min(24, width * 0.025));
  const minimum = Math.max(132, Math.min(175, width * 0.22));
  const columns = Math.max(1, Math.floor((width + columnGap) / (minimum + columnGap)));
  const cardWidth = Math.max(0, (width - columnGap * (columns - 1)) / columns);

  return { columns, columnGap, rowHeight: cardWidth + 51 + Math.max(20, Math.min(27, width * 0.03)) };
}

export default function CoverGrid({ items, onOpen }: CoverGridProps) {
  const t = useNavidromeTranslations();
  const { setContainer, rows, columns, columnGap, rowHeight, height } = useVirtualRows(items.length, coverLayout);

  return (
    <div ref={setContainer} data-navidrome-grid className="peer/grid relative" style={{ height }}>
      {rows.map((row) => (
        <div
          key={row}
          className="absolute inset-x-0 grid items-start"
          style={{
            top: row * rowHeight,
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            columnGap,
          }}
        >
          {items.slice(row * columns, (row + 1) * columns).map((item) => (
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
      ))}
    </div>
  );
}
