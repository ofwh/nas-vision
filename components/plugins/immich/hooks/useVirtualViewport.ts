'use client';

import { type RefObject, useEffect, useRef, useState } from 'react';

type Viewport = { width: number; top: number; height: number };

export default function useVirtualViewport(scrollRef: RefObject<HTMLDivElement | null>) {
  const ref = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<Viewport>({ width: 0, top: 0, height: 0 });
  useEffect(() => {
    const root = scrollRef.current;
    const list = ref.current;
    if (!root || !list) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const rootRect = root.getBoundingClientRect();
      const listRect = list.getBoundingClientRect();
      const next = {
        width: list.clientWidth,
        top: rootRect.top + root.clientTop - listRect.top,
        height: root.clientHeight,
      };
      setViewport((previous) =>
        previous.width === next.width && previous.top === next.top && previous.height === next.height ? previous : next,
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    observer.observe(list);
    root.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      root.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [scrollRef]);
  return [ref, viewport] as const;
}

export function visibleRows(count: number, stride: number, top: number, height: number) {
  const start = Math.min(count, Math.max(0, Math.floor(top / stride) - 2));
  const end = Math.max(start, Math.min(count, Math.ceil((top + height) / stride) + 2));
  return { start, end };
}
