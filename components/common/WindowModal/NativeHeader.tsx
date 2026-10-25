'use client';

import { useContext } from 'react';
import { WindowDragContext } from '@/hooks/useWindowDrag';
import type { HeaderContent, WindowHeaderRenderProps } from '@/types/window';

export function NativeHeader({
  header,
}: {
  header?: HeaderContent | ((props: WindowHeaderRenderProps) => HeaderContent);
}) {
  const onDragStart = useContext(WindowDragContext);
  const content =
    typeof header === 'function' && onDragStart
      ? header({ onDragStart })
      : typeof header === 'object'
        ? header
        : undefined;

  return (
    <header className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,auto)_minmax(0,1fr)] items-center gap-2 text-white">
      <div className="flex min-w-0 items-center gap-2">{content?.left}</div>
      <div className="min-w-0 text-center">{content?.center}</div>
      <div className="flex min-w-0 items-center justify-end gap-2">{content?.right}</div>
    </header>
  );
}
