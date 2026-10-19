'use client';

import type { ReactNode } from 'react';
import { useWindow } from '@/hooks/useWindow';
import { cn } from '@/lib/utils';
import type { HeaderContent } from '@/types/window';

export function ControlsHeader({
  title,
  controls,
  header,
}: {
  title: string;
  controls: ReactNode;
  header?: HeaderContent;
}) {
  const { maximized } = useWindow();

  return (
    <header
      className={cn(
        'grid min-h-12 shrink-0 grid-cols-[minmax(0,1fr)_minmax(0,auto)_minmax(0,1fr)] items-center gap-3 px-5 text-white',
        maximized && 'bg-[#202024]',
      )}
    >
      <div className="flex min-w-0 items-center gap-2">{controls}</div>
      <span className="max-w-full truncate text-center text-sm font-semibold">{header?.center ?? title}</span>
      <div className="flex min-w-0 items-center justify-end gap-2">{header?.right}</div>
    </header>
  );
}
