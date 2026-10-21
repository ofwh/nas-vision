'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';

export default function useSliderPreview(max: number, orientation: 'horizontal' | 'vertical' = 'horizontal') {
  const [value, setValue] = useState<number | null>(null);
  const frame = useRef<number | null>(null);
  const pending = useRef(0);

  useEffect(
    () => () => {
      if (frame.current !== null) {
        cancelAnimationFrame(frame.current);
      }

      frame.current = null;
    },
    [],
  );

  const move = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const thumb = event.currentTarget.querySelector<HTMLElement>('[data-slot="slider-thumb"]');
    const thumbRect = thumb?.getBoundingClientRect();
    const vertical = orientation === 'vertical';
    const thumbSize = (vertical ? thumbRect?.height : thumbRect?.width) ?? 0;
    const length = (vertical ? rect.height : rect.width) - thumbSize;

    if (length <= 0) {
      return;
    }

    const offset = vertical ? rect.bottom - event.clientY : event.clientX - rect.left;

    pending.current = Math.max(0, Math.min(1, (offset - thumbSize / 2) / length)) * max;
    if (frame.current !== null) {
      return;
    }

    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      setValue(pending.current);
    });
  };

  return { value, move };
}
