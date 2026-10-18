'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';

export default function useSliderPreview(max: number) {
  const [value, setValue] = useState<number | null>(null);
  const frame = useRef<number | null>(null);
  const pending = useRef(0);
  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    },
    [],
  );

  const move = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const thumb = event.currentTarget.querySelector<HTMLElement>('[data-slot="slider-thumb"]');
    const thumbWidth = thumb?.getBoundingClientRect().width ?? 0;
    const width = rect.width - thumbWidth;
    if (width <= 0) return;
    pending.current = Math.max(0, Math.min(1, (event.clientX - rect.left - thumbWidth / 2) / width)) * max;
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      setValue(pending.current);
    });
  };
  return { value, move };
}
