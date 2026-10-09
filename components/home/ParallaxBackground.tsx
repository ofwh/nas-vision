'use client';

import { useRef } from 'react';
import { usePointerOffset } from '@/hooks/usePointerOffset';

const MAX_OFFSET_X = 40;
const MAX_OFFSET_Y = 24;

const RESPONSE_EXPONENT = 1.5;

/** -1 = 画面朝鼠标反方向走（视差纵深）。 */
const DIRECTION = -1;

export function ParallaxBackground() {
  const layerRef = useRef<HTMLDivElement>(null);
  const lastTransform = useRef('');

  usePointerOffset((offsetX, offsetY) => {
    const layer = layerRef.current;
    if (!layer) return;

    const dx = Math.sign(offsetX) * Math.abs(offsetX) ** RESPONSE_EXPONENT * MAX_OFFSET_X * DIRECTION;
    const dy = Math.sign(offsetY) * Math.abs(offsetY) ** RESPONSE_EXPONENT * MAX_OFFSET_Y * DIRECTION;

    const transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
    if (lastTransform.current === transform) return;
    layer.style.transform = transform;
    lastTransform.current = transform;
  });

  return (
    <div
      ref={layerRef}
      aria-hidden
      style={{
        top: -MAX_OFFSET_Y,
        bottom: -MAX_OFFSET_Y,
        left: -MAX_OFFSET_X,
        right: -MAX_OFFSET_X,
        backgroundImage: 'var(--bg-image)',
      }}
      className="pointer-events-none fixed -z-10 bg-cover bg-center bg-no-repeat will-change-transform"
    />
  );
}
