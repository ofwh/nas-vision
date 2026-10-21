'use client';

import { Play } from 'lucide-react';
import { type RefObject, useMemo } from 'react';
import { useImmichTranslations } from '../../i18n/useTranslations';
import useVirtualViewport, { visibleRows } from '../../hooks/useVirtualViewport';
import type { ImmichMedia } from '../../types';
import { formatDuration } from '../../utils/duration';
import DetailThumbnail from './DetailThumbnail';

function aspectRatio(image: ImmichMedia): number {
  return image.width && image.height && image.width > 0 && image.height > 0 ? image.width / image.height : 1;
}

export default function DetailGrid({
  images,
  onSelect,
  scrollRef,
}: {
  scrollRef: RefObject<HTMLDivElement | null>;
  images: ImmichMedia[];
  onSelect: (image: ImmichMedia) => void;
}) {
  const t = useImmichTranslations();
  const [listRef, viewport] = useVirtualViewport(scrollRef);
  const width = viewport.width;
  const target = viewport.width >= 1024 ? 256 : viewport.width >= 768 ? 224 : viewport.width >= 640 ? 192 : 160;
  const rows = useMemo(() => {
    const rows: ImmichMedia[][] = [];
    let row: ImmichMedia[] = [];
    let totalRatio = 0;

    for (const image of images) {
      const ratio = aspectRatio(image);

      if (row.length && (totalRatio + ratio) * target + row.length * 4 > width) {
        rows.push(row);
        row = [];
        totalRatio = 0;
      }

      row.push(image);
      totalRatio += ratio;
    }
    if (row.length) {
      rows.push(row);
    }

    return rows;
  }, [images, width, target]);
  const stride = target + 4;
  const { start, end } = visibleRows(rows.length, stride, viewport.top, viewport.height);

  return (
    <section aria-label={t('ui.media')}>
      <div ref={listRef} className="relative" style={{ height: Math.max(0, rows.length * stride - 4) }}>
        {rows.slice(start, end).map((items, index) => (
          <div
            key={items[0].id}
            className="absolute inset-x-0 flex gap-1"
            style={{ top: (start + index) * stride, height: target }}
          >
            {items.map((image) => (
              <button
                key={image.id}
                type="button"
                onClick={() => onSelect(image)}
                aria-label={t(image.type === 'video' ? 'ui.viewVideo' : 'ui.viewPhoto', { name: image.name })}
                title={image.name}
                style={{ flex: `${aspectRatio(image)} 1 0%` }}
                className="group relative min-w-0 cursor-pointer overflow-hidden bg-zinc-900 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-white"
              >
                <DetailThumbnail
                  id={image.id}
                  name={image.name}
                  className="h-full w-full [&_img]:transition-transform [&_img]:duration-300 [&_img]:ease-out group-hover:[&_img]:scale-105 motion-reduce:[&_img]:transform-none motion-reduce:[&_img]:transition-none"
                />
                {image.type === 'video' ? (
                  <span className="pointer-events-none absolute right-2 bottom-2 flex items-center gap-1 rounded bg-black/60 px-1.5 py-1 text-xs text-white">
                    <Play aria-hidden className="size-3 fill-current" />
                    {formatDuration(image.duration)}
                  </span>
                ) : null}
                <span className="pointer-events-none absolute inset-0 opacity-0 ring-1 ring-white/30 transition ring-inset group-hover:opacity-100" />
              </button>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
