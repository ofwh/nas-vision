'use client';

import { type RefObject } from 'react';
import { useImmichTranslations } from '../../i18n/useTranslations';
import type { ImmichDirectory, ImmichMode } from '../../types';
import useVirtualViewport, { visibleRows } from '../../hooks/useVirtualViewport';
import DirectoryCard from './DirectoryCard';

export default function DirectoryGrid({
  directories,
  mode,
  onOpen,
  scrollRef,
}: {
  directories: ImmichDirectory[];
  mode: ImmichMode;
  onOpen: (id: string) => void;
  scrollRef: RefObject<HTMLDivElement | null>;
}) {
  const t = useImmichTranslations();
  const [listRef, viewport] = useVirtualViewport(scrollRef);
  const columns = Math.max(1, Math.floor((viewport.width + 8) / 248));
  const rowHeight = viewport.width >= 1024 ? 256 : viewport.width >= 768 ? 224 : viewport.width >= 640 ? 192 : 160;
  const count = Math.ceil(directories.length / columns);
  const stride = rowHeight + 8;
  const { start, end } = visibleRows(count, stride, viewport.top, viewport.height);

  return (
    <section className="mb-8" aria-label={t('ui.folders')}>
      <div ref={listRef} className="relative" style={{ height: Math.max(0, count * stride - 8) }}>
        {Array.from({ length: end - start }, (_, offset) => {
          const row = start + offset;

          return (
            <div
              key={row}
              className="absolute inset-x-0 grid gap-2"
              style={{
                top: row * stride,
                height: rowHeight,
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              }}
            >
              {directories.slice(row * columns, (row + 1) * columns).map((directory) => (
                <DirectoryCard
                  key={`${mode}-${directory.id}`}
                  mode={mode}
                  directory={directory}
                  onOpen={() => onOpen(directory.id)}
                />
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}
