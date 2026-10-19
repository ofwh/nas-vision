'use client';

import type { HeaderContent } from '@/types/window';

export function NativeHeader({ header }: { header?: HeaderContent }) {
  return (
    <header className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,auto)_minmax(0,1fr)] items-center gap-2 text-white">
      <div className="flex min-w-0 items-center gap-2">{header?.left}</div>
      <div className="min-w-0 text-center">{header?.center}</div>
      <div className="flex min-w-0 items-center justify-end gap-2">{header?.right}</div>
    </header>
  );
}
