'use client';

import { useTranslations } from 'next-intl';
import { ExternalLink, X } from 'lucide-react';
import { createContext, type ReactNode, useContext, useEffect, useId, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { LiquidGlassModal } from '@/components/common/LiquidGlassModal';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { WindowControls } from '@/components/common/WindowControls';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Loading } from '@/components/common/Loading';
import { fetchApi } from '@/lib/api/client';
import { useWindow, WindowContext } from '@/hooks/useWindow';
import type { IframeCheckRes } from '@/lib/services/iframe';
import type { HeaderContent, WindowContextValue, WindowModalProps } from '@/types/window';

const WindowFooterContext = createContext<{
  target: HTMLDivElement | null;
  setHasContent: (hasContent: boolean) => void;
} | null>(null);

export function WindowFooter({ children }: { children: ReactNode }) {
  const context = useContext(WindowFooterContext);
  const setHasContent = context?.setHasContent;
  useEffect(() => {
    setHasContent?.(true);
    return () => setHasContent?.(false);
  }, [setHasContent]);
  return context?.target ? createPortal(children, context.target) : null;
}

/** 状态只由 /api/public/iframe 决定，iframe 自身的事件不回写。 */
type IframeAccessStatus = 'checking' | 'allowed' | 'blocked';

function IframeContent({ src, title }: { src: string; title: string }) {
  const t = useTranslations();
  const [status, setStatus] = useState<IframeAccessStatus>('checking');

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
    <div className="relative size-full min-h-0 overflow-hidden">
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
          title={title}
          allow="fullscreen; autoplay; clipboard-read; clipboard-write; encrypted-media; picture-in-picture; display-capture; screen-wake-lock; web-share; geolocation; camera; microphone"
          className="size-full border-0 bg-transparent"
        />
      )}

      {status === 'checking' ? <Loading className="pointer-events-none absolute inset-0" /> : null}
    </div>
  );
}

function ControlsHeader({ title, controls, header }: { title: string; controls: ReactNode; header?: HeaderContent }) {
  const { maximized } = useWindow();
  return (
    <header
      className={cn(
        'grid min-h-12 shrink-0 grid-cols-[minmax(0,1fr)_minmax(0,auto)_minmax(0,1fr)] items-center gap-3 px-5 text-white',
        maximized && 'bg-[#202024]',
      )}
    >
      <div className="flex min-w-0 items-center gap-2">{controls}</div>
      <span className="max-w-full truncate text-center text-sm font-semibold">{header?.center ?? title}</span>
      <div className="flex min-w-0 items-center justify-end gap-2">{header?.right}</div>
    </header>
  );
}

function FloatingHeader({
  title,
  header,
  transparent,
}: {
  title: string;
  header?: HeaderContent;
  transparent: boolean;
}) {
  const t = useTranslations();
  const Surface = transparent ? 'div' : LiquidGlass;
  return (
    <header className="pointer-events-none absolute inset-x-5 top-3.5 z-40 grid min-h-12 shrink-0 grid-cols-[minmax(0,1fr)_minmax(0,auto)_minmax(0,1fr)] items-center gap-3 text-white">
      <div className="pointer-events-auto flex min-w-0 items-center gap-3">
        <Surface className="shrink-0 rounded-full">
          <DialogClose
            render={
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label={t('common.close')}
                title={t('common.close')}
              />
            }
          >
            <X aria-hidden />
          </DialogClose>
        </Surface>
        <div className="flex min-w-0 items-center gap-2">{header?.left}</div>
      </div>
      <span className="max-w-full truncate text-center text-sm font-semibold">{header?.center ?? title}</span>
      <div className="pointer-events-auto flex min-w-0 items-center justify-end gap-2">{header?.right}</div>
    </header>
  );
}

function HeaderLayout({ header }: { header?: HeaderContent }) {
  return (
    <header className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,auto)_minmax(0,1fr)] items-center gap-2 text-white">
      <div className="flex min-w-0 items-center gap-2">{header?.left}</div>
      <div className="min-w-0 text-center">{header?.center}</div>
      <div className="flex min-w-0 items-center justify-end gap-2">{header?.right}</div>
    </header>
  );
}

export function WindowModal({
  id,
  open,
  onOpenChange,
  onClose,
  src,
  title,
  children,
  footer,
  mode,
  header,
  controls: controlsConfig,
  style,
  fit = true,
  transparent = false,
  resizable = false,
  className,
  ...props
}: WindowModalProps) {
  const generatedId = useId();
  const [maximized, setMaximized] = useState(false);
  const windowContext = useMemo<WindowContextValue>(() => {
    const close = () => {
      onOpenChange(false);
      onClose?.();
    };
    return {
      id: id ?? generatedId,
      state: !open ? 'closed' : maximized ? 'maximized' : 'normal',
      open,
      maximized,
      close,
      minimize: close,
      maximize: () => setMaximized(true),
      restore: () => setMaximized(false),
      toggleMaximize: () => setMaximized((value) => !value),
    };
  }, [id, generatedId, open, maximized, onOpenChange, onClose]);
  const resolvedTransparent = transparent || windowContext.state === 'maximized';
  const showHeader = header !== false;
  const controls = showHeader ? (
    <WindowControls maximized={maximized} onMaximize={windowContext.toggleMaximize} controls={controlsConfig} />
  ) : null;
  const resolvedHeaderMode = mode ?? 'controls';
  const hasContentRenderer = typeof children === 'function';
  const [footerTarget, setFooterTarget] = useState<HTMLDivElement | null>(null);
  const [hasFooterContent, setHasFooterContent] = useState(false);
  const footerContext = useMemo(() => ({ target: footerTarget, setHasContent: setHasFooterContent }), [footerTarget]);

  return (
    <WindowContext.Provider value={windowContext}>
      <WindowFooterContext.Provider value={footerContext}>
        <LiquidGlassModal
          {...props}
          open={open}
          onOpenChange={onOpenChange}
          onClose={onClose}
          className={maximized ? '[--window-radius:0px]' : undefined}
          resizable={resizable && !maximized}
          transparent={resolvedTransparent}
          title={title}
          header={
            showHeader && mode === 'native' ? (
              <HeaderLayout header={typeof header === 'object' ? header : undefined} />
            ) : undefined
          }
          style={{
            ...style,
            ...(maximized ? { width: '100vw', height: '100dvh', maxWidth: 'none', maxHeight: 'none' } : {}),
          }}
          footer={
            hasFooterContent ? (
              <div className="flex min-w-0 items-center gap-2">
                {footer}
                <div ref={setFooterTarget} className="min-w-0 flex-1" />
              </div>
            ) : (
              footer
            )
          }
        >
          <div className="relative flex min-h-0 flex-1 flex-col">
            {showHeader && !hasContentRenderer && resolvedHeaderMode === 'controls' ? (
              <ControlsHeader
                title={title}
                controls={controls}
                header={typeof header === 'object' ? header : undefined}
              />
            ) : null}
            <div
              className={cn(
                'flex min-h-0 flex-1 flex-col',
                maximized
                  ? undefined
                  : hasContentRenderer
                    ? fit
                      ? undefined
                      : 'p-5'
                    : resolvedHeaderMode === 'floating'
                      ? 'p-2.5'
                      : showHeader && resolvedHeaderMode === 'controls'
                        ? 'px-5 pb-5'
                        : 'p-5',
              )}
            >
              <div
                className={cn(
                  'flex min-h-0 flex-1 flex-col overflow-auto overscroll-contain',
                  maximized
                    ? 'rounded-none'
                    : hasContentRenderer
                      ? fit
                        ? 'rounded-(--window-radius)'
                        : 'rounded-none'
                      : resolvedHeaderMode === 'floating'
                        ? 'rounded-[calc(var(--window-radius)-var(--spacing)*2.5)]'
                        : resolvedHeaderMode === 'controls'
                          ? 'rounded-none'
                          : undefined,
                  className,
                )}
              >
                {typeof children === 'function' ? (
                  children(controls)
                ) : children !== undefined ? (
                  children
                ) : src ? (
                  <IframeContent key={src} src={src} title={title} />
                ) : null}
              </div>
            </div>
            {showHeader && !hasContentRenderer && mode === 'floating' ? (
              <FloatingHeader
                title={title}
                header={typeof header === 'object' ? header : undefined}
                transparent={resolvedTransparent}
              />
            ) : null}
          </div>
        </LiquidGlassModal>
      </WindowFooterContext.Provider>
    </WindowContext.Provider>
  );
}
