'use client';

import { useCallback, useEffect, useState } from 'react';

export type VirtualRowLayout = { columns: number; rowHeight: number; columnGap?: number };

export default function useVirtualRows(count: number, layout: (width: number) => VirtualRowLayout) {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0, offset: 0 });
  const { columns, rowHeight, columnGap = 0 } = layout(viewport.width);
  const rowCount = Math.ceil(count / columns);
  const start = Math.min(rowCount, Math.max(0, Math.floor(viewport.offset / rowHeight) - 4));
  const end = Math.min(rowCount, Math.max(start, Math.ceil((viewport.offset + viewport.height) / rowHeight) + 4));

  useEffect(() => {
    const scroller = node?.closest<HTMLElement>('[data-slot="scroll-area-viewport"]');

    if (!node || !scroller) {
      return;
    }

    let frame: number | null = null;
    const update = () => {
      frame = null;
      const bounds = node.getBoundingClientRect();
      const visible = scroller.getBoundingClientRect();
      const next = { width: bounds.width, height: scroller.clientHeight, offset: visible.top - bounds.top };

      setViewport((current) =>
        current.width === next.width && current.height === next.height && current.offset === next.offset
          ? current
          : next,
      );
    };
    const schedule = () => {
      if (frame === null) {
        frame = requestAnimationFrame(update);
      }
    };
    const observer = new ResizeObserver(schedule);

    observer.observe(node);
    observer.observe(scroller);
    scroller.addEventListener('scroll', schedule, { passive: true });
    schedule();

    return () => {
      observer.disconnect();
      scroller.removeEventListener('scroll', schedule);

      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
    };
  }, [node]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const scroller = node?.closest<HTMLElement>('[data-slot="scroll-area-viewport"]');

      if (!node || !scroller || index < 0) {
        return;
      }

      const { columns, rowHeight } = layout(node.clientWidth);
      const visible = scroller.getBoundingClientRect();
      const top = node.getBoundingClientRect().top + Math.floor(index / columns) * rowHeight;

      if (top < visible.top || top + rowHeight > visible.top + scroller.clientHeight) {
        scroller.scrollTo({
          top: scroller.scrollTop + top - visible.top - (scroller.clientHeight - rowHeight) / 2,
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        });
      }
    },
    [node, layout],
  );

  return {
    setContainer: setNode,
    rows: Array.from({ length: end - start }, (_, index) => start + index),
    columns,
    columnGap,
    rowHeight,
    height: rowCount * rowHeight,
    scrollToIndex,
  };
}
