'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { type CSSProperties, type ReactNode } from 'react';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Dialog, DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export type LiquidGlassModalSize = {
  width: number;
  height?: number;
};

export type LiquidGlassModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose?: () => void;
  title: string;
  size?: LiquidGlassModalSize;
  style?: CSSProperties;
  description?: ReactNode;
  modal?: boolean;
  top?: boolean;
  closeOnOverlay?: boolean;
  fit?: boolean;
  resizable?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children?: ReactNode;
};

const DEFAULT_SIZE: LiquidGlassModalSize = { width: 480, height: 400 };

const CONTENT_RADIUS = 20;

export function LiquidGlassModal({
  open,
  onOpenChange,
  onClose,
  title,
  size = DEFAULT_SIZE,
  style,
  description,
  modal = true,
  top = false,
  closeOnOverlay = true,
  fit = true,
  resizable = false,
  header,
  footer,
  className,
  children,
}: LiquidGlassModalProps) {
  const autoHeight = size.height === undefined && style?.height === undefined;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) onClose?.();
      }}
      modal={modal}
      disablePointerDismissal={!closeOnOverlay}
    >
      <DialogPortal className={cn(top && 'relative z-[1100]')}>
        {modal ? (
          <DialogOverlay forceRender className="bg-black/25 supports-backdrop-filter:backdrop-blur-none" />
        ) : null}

        <DialogPrimitive.Viewport className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          <DialogPrimitive.Popup
            className={cn(
              'pointer-events-auto relative flex flex-col gap-3 outline-none',
              resizable && 'min-h-40 min-w-60 resize overflow-auto',
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
                className="max-w-full shrink-0 self-center rounded-full"
                contentClassName="flex min-w-0 items-center justify-center p-1"
              >
                {header}
              </LiquidGlass>
            ) : null}
            <LiquidGlass
              className={cn('min-h-0', autoHeight ? 'flex flex-auto flex-col' : 'flex-1')}
              style={{ borderRadius: CONTENT_RADIUS, '--window-radius': `${CONTENT_RADIUS}px` } as CSSProperties}
              contentClassName={cn(
                'relative flex min-h-0 flex-col overflow-hidden',
                autoHeight ? 'min-h-0 flex-auto' : 'h-full',
              )}
            >
              <div className={cn('flex min-h-0 flex-1 flex-col overflow-auto overscroll-contain', !fit && 'p-5')}>
                {description ? (
                  <DialogDescription className="shrink-0 text-sm text-white/70">{description}</DialogDescription>
                ) : null}
                {children}
              </div>
            </LiquidGlass>
            {footer != null ? (
              <div className="absolute bottom-0 left-1/2 z-10 max-w-full shrink-0 -translate-x-1/2 translate-y-1/2 self-center">
                <LiquidGlass className="rounded-full" contentClassName="flex items-center justify-center gap-2 p-2">
                  {footer}
                </LiquidGlass>
              </div>
            ) : null}
          </DialogPrimitive.Popup>
        </DialogPrimitive.Viewport>
      </DialogPortal>
    </Dialog>
  );
}
