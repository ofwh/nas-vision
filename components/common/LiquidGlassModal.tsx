'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { useRef } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Dialog, DialogOverlay, DialogPortal, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { LiquidGlassModalProps, ModalSize } from '@/types/window';
import styles from '@/styles/LiquidGlassModal.module.css';

const DEFAULT_SIZE: ModalSize = { width: 480, height: 400 };

function resize(popup: HTMLElement, width: number, height: number) {
  popup.style.width = `${Math.max(240, Math.min(width, window.innerWidth - 48))}px`;
  popup.style.height = `${Math.max(160, Math.min(height, window.innerHeight - 48))}px`;
}

function ResizeHandle() {
  const drag = useRef<{ pointerId: number; x: number; y: number; width: number; height: number } | null>(null);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="调整弹窗大小"
      title="拖动调整大小，或使用方向键"
      className={cn(
        'absolute right-0 bottom-0 z-20 size-8 cursor-nwse-resize touch-none rounded-br-(--window-radius) text-white opacity-20 transition-opacity duration-200 ease-out outline-none select-none [--handle-half-stroke:calc(var(--spacing)*0.625)] [--handle-radius:calc(var(--spacing)*3.25)] hover:opacity-90 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white/50 motion-reduce:transition-none',
      )}
      onPointerDown={(event) => {
        if (event.button !== 0) {
          return;
        }

        const popup = event.currentTarget.parentElement;

        if (!popup) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.focus({ preventScroll: true });
        const rect = popup.getBoundingClientRect();

        drag.current = {
          pointerId: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          width: rect.width,
          height: rect.height,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const start = drag.current;
        const popup = event.currentTarget.parentElement;

        if (!start || !popup || event.pointerId !== start.pointerId) {
          return;
        }

        resize(popup, start.width + (event.clientX - start.x) * 2, start.height + (event.clientY - start.y) * 2);
      }}
      onPointerUp={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
          return;
        }

        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onLostPointerCapture={() => {
        drag.current = null;
      }}
      onKeyDown={(event) => {
        const popup = event.currentTarget.parentElement;

        if (!popup || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        const rect = popup.getBoundingClientRect();
        const step = event.shiftKey ? 50 : 10;

        resize(
          popup,
          rect.width + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0),
          rect.height + (event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0),
        );
      }}
    >
      <span aria-hidden className={cn('pointer-events-none absolute right-5 bottom-5 size-0', styles.resizeCurve)}>
        <span className={styles.resizeArc} />
      </span>
    </div>
  );
}

export function LiquidGlassModal({
  open,
  onOpenChange,
  onClose,
  title,
  size = DEFAULT_SIZE,
  style,
  modal = true,
  transparent = false,
  top = false,
  closeOnOverlay = true,
  fit = true,
  resizable = false,
  header,
  footer,
  className,
  children,
}: LiquidGlassModalProps) {
  const hasAutoHeight = size.height === undefined && style?.height === undefined;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          onClose?.();
        }
      }}
      modal={modal}
      disablePointerDismissal={!closeOnOverlay}
    >
      <DialogPortal className={cn(top && 'relative z-[1100]')}>
        {modal ? (
          <DialogOverlay
            forceRender
            className={cn(
              'supports-backdrop-filter:backdrop-blur-none',
              transparent ? 'bg-transparent' : 'bg-black/25',
            )}
          />
        ) : null}

        <DialogPrimitive.Viewport className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          <DialogPrimitive.Popup
            className={cn(
              'pointer-events-auto relative flex flex-col gap-3 outline-none [--window-radius:calc(var(--spacing)*5)]',
              resizable && 'min-h-40 min-w-60',
              className,
            )}
            style={{
              width: size.width,
              height: size.height,
              ...style,
            }}
          >
            <DialogTitle className="sr-only">{title}</DialogTitle>
            {header != null ? (
              <LiquidGlass
                transparent={transparent}
                className="max-w-full shrink-0 self-center rounded-full"
                contentClassName="flex min-w-0 items-center justify-center p-1"
              >
                {header}
              </LiquidGlass>
            ) : null}
            <LiquidGlass
              transparent={transparent}
              className={cn(
                'flex min-h-0 min-w-0 flex-col rounded-(--window-radius)',
                hasAutoHeight ? 'flex-auto' : 'flex-1',
              )}
              contentClassName={cn(
                'relative flex min-h-0 min-w-0 flex-col overflow-hidden',
                hasAutoHeight ? 'flex-auto' : 'flex-1',
              )}
            >
              <ScrollArea
                className={cn(
                  'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden [&>[data-slot=scroll-area-viewport]]:flex [&>[data-slot=scroll-area-viewport]]:h-auto [&>[data-slot=scroll-area-viewport]]:min-h-0 [&>[data-slot=scroll-area-viewport]]:flex-1 [&>[data-slot=scroll-area-viewport]]:flex-col [&>[data-slot=scroll-area-viewport]]:overscroll-contain',
                  !fit && '[&>[data-slot=scroll-area-viewport]]:p-5',
                )}
              >
                {children}
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </LiquidGlass>
            {footer != null ? (
              <div className="absolute bottom-0 left-1/2 z-10 max-w-full shrink-0 -translate-x-1/2 translate-y-1/2 self-center">
                <LiquidGlass
                  transparent={transparent}
                  className="rounded-full"
                  contentClassName="flex items-center justify-center gap-2 p-2"
                >
                  {footer}
                </LiquidGlass>
              </div>
            ) : null}
            {resizable ? <ResizeHandle /> : null}
          </DialogPrimitive.Popup>
        </DialogPrimitive.Viewport>
      </DialogPortal>
    </Dialog>
  );
}
