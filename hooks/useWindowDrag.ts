'use client';

import { createContext, useRef, type PointerEvent, type PointerEventHandler } from 'react';

export const WindowDragContext = createContext<PointerEventHandler<HTMLElement> | null>(null);

const INTERACTIVE =
  'button, a, input, textarea, select, label, [role="button"], [role="link"], [role="slider"], [role="tab"], [contenteditable]:not([contenteditable="false"]), [tabindex], [data-window-no-drag]';

type DragStart = {
  pointerId: number;
  x: number;
  y: number;
  left: number;
  top: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
};

export function useWindowDrag(enabled: boolean) {
  const drag = useRef<DragStart | null>(null);

  const startDrag = (event: PointerEvent<HTMLElement>, handle = event.currentTarget) => {
    const popup = handle.closest<HTMLElement>('[data-window-popup]');
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const interactive = target.closest(INTERACTIVE);

    if (
      !enabled ||
      !popup ||
      event.defaultPrevented ||
      event.button !== 0 ||
      !event.isPrimary ||
      target.closest('[data-window-popup]') !== popup ||
      (interactive && handle.contains(interactive))
    ) {
      return;
    }

    event.preventDefault();
    const rect = popup.getBoundingClientRect();

    drag.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      offsetX: parseFloat(popup.style.getPropertyValue('--window-x')) || 0,
      offsetY: parseFloat(popup.style.getPropertyValue('--window-y')) || 0,
    };
    popup.setPointerCapture(event.pointerId);
  };

  const finish = (event: PointerEvent<HTMLElement>) => {
    if (drag.current?.pointerId !== event.pointerId) {
      return;
    }

    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return {
    startDrag,
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      const target = event.target;

      if (!(target instanceof Element) || target.closest('[data-window-popup]') !== event.currentTarget) {
        return;
      }

      const handle = target.closest<HTMLElement>('[data-window-drag-handle]');

      if (handle) {
        startDrag(event, handle);
      }
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      const start = drag.current;

      if (!enabled || !start || start.pointerId !== event.pointerId) {
        return;
      }

      const left = Math.max(
        Math.min(0, window.innerWidth - start.width),
        Math.min(start.left + event.clientX - start.x, Math.max(0, window.innerWidth - start.width)),
      );
      const top = Math.max(
        0,
        Math.min(start.top + event.clientY - start.y, Math.max(0, window.innerHeight - start.height)),
      );

      event.currentTarget.style.setProperty('--window-x', `${start.offsetX + left - start.left}px`);
      event.currentTarget.style.setProperty('--window-y', `${start.offsetY + top - start.top}px`);
    },
    onPointerUp: finish,
    onPointerCancel: finish,
    onLostPointerCapture: finish,
  };
}
