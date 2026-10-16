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
  title: ReactNode;
  size?: LiquidGlassModalSize;
  style?: CSSProperties;
  description?: ReactNode;
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
  closeOnOverlay = false,
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
      modal={true}
      disablePointerDismissal={!closeOnOverlay}
    >
      <DialogPortal>
        <DialogOverlay className="bg-black/25 supports-backdrop-filter:backdrop-blur-none" />

        <DialogPrimitive.Viewport className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          <DialogPrimitive.Popup
            className={cn(
              'pointer-events-auto flex flex-col gap-3 outline-none',
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
                className="shrink-0 rounded-full"
                contentClassName="flex min-w-0 items-center justify-center px-6 py-2"
              >
                {header}
              </LiquidGlass>
            ) : null}

            <LiquidGlass
              className={cn('min-h-0', autoHeight ? 'flex flex-auto flex-col' : 'flex-1')}
              style={{ borderRadius: CONTENT_RADIUS }}
              contentClassName={cn(
                'flex flex-col gap-4 overflow-auto overscroll-contain',
                autoHeight ? 'min-h-0 flex-auto' : 'h-full',
                !fit && 'p-2',
              )}
            >
              {description ? (
                <DialogDescription className="shrink-0 text-sm text-white/70">{description}</DialogDescription>
              ) : null}

              {children}
            </LiquidGlass>
            {footer != null ? (
              <LiquidGlass
                className="max-w-full shrink-0 self-center rounded-full"
                contentClassName="flex items-center justify-center gap-2 px-4 py-2"
              >
                {footer}
              </LiquidGlass>
            ) : null}
          </DialogPrimitive.Popup>
        </DialogPrimitive.Viewport>
      </DialogPortal>
    </Dialog>
  );
}
