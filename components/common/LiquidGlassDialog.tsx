'use client';

import { useTranslations } from 'next-intl';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { ExternalLink, X } from 'lucide-react';
import { type CSSProperties, type ReactNode, useEffect, useState } from 'react';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Loading } from '@/components/common/Loading';
import { WindowControls } from '@/components/common/WindowControls';
import { fetchApi } from '@/lib/api/client';
import type { IframeCheckRes } from '@/lib/services/iframe';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export type LiquidGlassDialogType = 'builtin' | 'url' | 'garfish';

export type LiquidGlassDialogSize = {
  width: number;
  height?: number;
};

export type LiquidGlassDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose?: () => void;
  type?: LiquidGlassDialogType;
  title: ReactNode;
  icon?: ReactNode;
  size?: LiquidGlassDialogSize;
  style?: CSSProperties;
  url?: string; /** 站外地址 */
  innerUrl?: string; /** 站内地址 */
  description?: ReactNode;
  closeOnOverlay?: boolean;
  fit?: boolean;
  /** 关掉只留内容块，标题仍以 sr-only 挂着给读屏。 */
  header?: boolean;
  className?: string;
  children?: ReactNode;
};

const DEFAULT_SIZE: LiquidGlassDialogSize = { width: 480, height: 400 };

const HEADER_HEIGHT = 40;

const CONTENT_PADDING = 8;

/** 头部胶囊取半高(20)，内容块同值；内嵌页再减内边距(12)，三圈弧线才平行。 */
const CONTENT_RADIUS = HEADER_HEIGHT / 2;
const EMBED_RADIUS = CONTENT_RADIUS - CONTENT_PADDING;

/** 状态只由 /api/public/iframe 决定，iframe 自身的事件不回写。 */
type EmbedStatus = 'checking' | 'allowed' | 'blocked';

function IframeComponent({
  src,
  title,
  maximized,
  onMaximize,
}: {
  src: string;
  title: ReactNode;
  maximized: boolean;
  onMaximize: () => void;
}) {
  const t = useTranslations();
  const [status, setStatus] = useState<EmbedStatus>('checking');

  useEffect(() => {
    let alive = true;
    void fetchApi<IframeCheckRes>('/api/public/iframe', { referer: window.location.href, url: src }).then(
      (response) => {
        if (alive) setStatus(response.data?.deny ? 'blocked' : 'allowed');
      },
    );
    return () => {
      alive = false;
    };
  }, [src]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative flex h-12 shrink-0 items-center justify-center px-24 text-white">
        <WindowControls className="absolute left-5" maximized={maximized} onMaximize={onMaximize} />
        <span className="truncate text-sm font-semibold">{title}</span>
      </div>
      <div className="min-h-0 flex-1 px-2 pt-0 pb-2">
        <div className="relative size-full min-h-0 overflow-hidden" style={{ borderRadius: EMBED_RADIUS }}>
          {status === 'blocked' ? (
            <div className="flex size-full flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-sm text-white/80">{t('common.iframeBlocked')}</p>

              <a
                href={src}
                target="_blank"
                rel="noreferrer"
                title={src}
                className="flex h-6 items-center gap-1.5 rounded-full bg-white/10 px-3 text-sm text-white/70 transition-colors hover:bg-white/20 hover:text-white"
                style={{ maxWidth: 'min(75vw, 100%)' }}
              >
                <span className="truncate">{src}</span>
                <ExternalLink className="size-4 shrink-0" aria-hidden />
              </a>
            </div>
          ) : (
            <iframe
              src={src}
              title={typeof title === 'string' ? title : undefined}
              allow="fullscreen; autoplay; clipboard-read; clipboard-write; encrypted-media; picture-in-picture; display-capture; screen-wake-lock; web-share; geolocation; camera; microphone"
              className="size-full border-0 bg-transparent"
              style={{ borderRadius: EMBED_RADIUS }}
            />
          )}

          {status === 'checking' ? <Loading className="pointer-events-none absolute inset-0" /> : null}
        </div>
      </div>
    </div>
  );
}

function GarfishComponent() {
  return <div className="size-full min-h-0" style={{ borderRadius: EMBED_RADIUS }} />;
}

export function LiquidGlassDialog({
  open,
  onOpenChange,
  onClose,
  type = 'builtin',
  title,
  icon,
  size = DEFAULT_SIZE,
  style,
  url,
  innerUrl,
  description,
  closeOnOverlay = false,
  fit = true,
  header = false,
  className,
  children,
}: LiquidGlassDialogProps) {
  const t = useTranslations();
  const [maximized, setMaximized] = useState(false);
  const src = url ?? innerUrl;
  const frameSrc = type === 'url' ? src : undefined;
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
            className={cn('pointer-events-auto flex flex-col gap-3 outline-none', className)}
            style={{
              width: size.width,
              height: size.height,
              ...style,
              ...(frameSrc && maximized ? { width: 'calc(100vw - 48px)', height: 'calc(100dvh - 48px)' } : {}),
            }}
          >
            {header ? (
              <LiquidGlass
                className="h-10 shrink-0 rounded-full"
                contentClassName="relative flex h-full min-w-0 items-center justify-center px-6"
              >
                <DialogTitle className="flex min-w-0 items-center gap-2 text-[18px] font-bold">
                  {icon ? <span className="flex size-7 shrink-0 items-center justify-center">{icon}</span> : null}
                  <span className="truncate">{title}</span>
                </DialogTitle>

                <DialogClose
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t('common.close')}
                      className="absolute inset-y-0 right-1 my-auto rounded-full text-white hover:bg-white/15 hover:text-white"
                    />
                  }
                >
                  <X aria-hidden />
                </DialogClose>
              </LiquidGlass>
            ) : (
              // 头部不画，但留个标题给读屏，顺带把 aria-labelledby 接上
              <DialogTitle className="sr-only">{title}</DialogTitle>
            )}

            <LiquidGlass
              className={cn('min-h-0', autoHeight ? 'flex flex-auto flex-col' : 'flex-1')}
              style={{ borderRadius: CONTENT_RADIUS }}
              contentClassName={cn(
                'flex flex-col overflow-auto overscroll-contain',
                frameSrc ? 'gap-0' : 'gap-4',
                autoHeight ? 'min-h-0 flex-auto' : 'h-full',
                !fit && 'p-2',
              )}
            >
              {description ? (
                <DialogDescription className="shrink-0 text-sm text-white/70">{description}</DialogDescription>
              ) : null}

              {type === 'garfish' ? (
                <GarfishComponent />
              ) : frameSrc ? (
                <IframeComponent
                  key={frameSrc}
                  src={frameSrc}
                  title={title}
                  maximized={maximized}
                  onMaximize={() => setMaximized((value) => !value)}
                />
              ) : (
                children
              )}
            </LiquidGlass>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Viewport>
      </DialogPortal>
    </Dialog>
  );
}
