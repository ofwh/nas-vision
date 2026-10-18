'use client';

import { useTranslations } from 'next-intl';
import { ExternalLink } from 'lucide-react';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { LiquidGlassModal, type LiquidGlassModalProps } from '@/components/common/LiquidGlassModal';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { WindowControls } from '@/components/common/WindowControls';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loading } from '@/components/common/Loading';
import { fetchApi } from '@/lib/api/client';
import type { IframeCheckRes } from '@/lib/services/iframe';

export type IconMenu = {
  id: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

type FloatHeaderContent = { left?: IconMenu[]; right?: IconMenu[] };
type NativeHeaderContent = { left?: ReactNode; middle?: ReactNode; right?: ReactNode };

export type WindowModalProps = Omit<LiquidGlassModalProps, 'children' | 'header'> & {
  src?: string;
  children?: ReactNode | ((controls: ReactNode) => ReactNode);
} & ({ mode?: 'controls' | 'float'; header?: FloatHeaderContent } | { mode: 'native'; header?: NativeHeaderContent });

const WindowFooterContext = createContext<{
  target: HTMLDivElement | null;
  setVisible: (visible: boolean) => void;
} | null>(null);

export function WindowFooter({ children }: { children: ReactNode }) {
  const context = useContext(WindowFooterContext);
  const setVisible = context?.setVisible;
  useEffect(() => {
    setVisible?.(true);
    return () => setVisible?.(false);
  }, [setVisible]);
  return context?.target ? createPortal(children, context.target) : null;
}

/** 状态只由 /api/public/iframe 决定，iframe 自身的事件不回写。 */
type EmbedStatus = 'checking' | 'allowed' | 'blocked';

function IframeContent({ src, title }: { src: string; title: string }) {
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

function ControlsHeader({ title, controls }: { title: string; controls: ReactNode }) {
  return (
    <header className="grid min-h-12 shrink-0 grid-cols-[minmax(0,1fr)_minmax(0,auto)_minmax(0,1fr)] items-center gap-3 px-5 text-white">
      <div className="flex min-w-0 items-center gap-2">{controls}</div>
      <span className="max-w-full truncate text-center text-sm font-semibold">{title}</span>
      <div />
    </header>
  );
}

function FloatHeaderMenus({ menus }: { menus?: IconMenu[] }) {
  return menus?.map((menu) => (
    <LiquidGlass key={menu.id} className="shrink-0 rounded-full">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-full"
        aria-label={menu.label}
        title={menu.label}
        onClick={menu.onClick}
        disabled={menu.disabled}
      >
        {menu.icon}
      </Button>
    </LiquidGlass>
  ));
}

function FloatHeader({ title, header }: { title: string; header?: FloatHeaderContent }) {
  return (
    <header className="pointer-events-none absolute inset-x-5 top-3.5 z-40 grid min-h-12 shrink-0 grid-cols-[minmax(0,1fr)_minmax(0,auto)_minmax(0,1fr)] items-center gap-3 text-white">
      <div className="pointer-events-auto flex min-w-0 items-center gap-2">
        <FloatHeaderMenus menus={header?.left} />
      </div>
      <span className="max-w-full truncate text-center text-sm font-semibold">{title}</span>
      <div className="pointer-events-auto flex min-w-0 items-center justify-end gap-2">
        <FloatHeaderMenus menus={header?.right} />
      </div>
    </header>
  );
}

function NativeHeader({ header }: { header?: NativeHeaderContent }) {
  return (
    <header className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,auto)_minmax(0,1fr)] items-center gap-2 text-white [&_[data-slot=button]]:rounded-full">
      <div className="flex min-w-0 items-center gap-2">{header?.left}</div>
      <div className="min-w-0 text-center">{header?.middle}</div>
      <div className="flex min-w-0 items-center justify-end gap-2">{header?.right}</div>
    </header>
  );
}

export function WindowModal({
  src,
  title,
  children,
  footer,
  mode,
  header,
  style,
  fit = true,
  className,
  ...props
}: WindowModalProps) {
  const [maximized, setMaximized] = useState(false);
  const controls = <WindowControls maximized={maximized} onMaximize={() => setMaximized((value) => !value)} />;
  const resolvedMode = mode ?? 'controls';
  const customContent = typeof children === 'function';
  const [footerTarget, setFooterTarget] = useState<HTMLDivElement | null>(null);
  const [footerVisible, setFooterVisible] = useState(false);
  const footerContext = useMemo(() => ({ target: footerTarget, setVisible: setFooterVisible }), [footerTarget]);

  return (
    <WindowFooterContext.Provider value={footerContext}>
      <LiquidGlassModal
        {...props}
        title={title}
        header={mode === 'native' ? <NativeHeader header={header} /> : undefined}
        style={{ ...style, ...(maximized ? { width: 'calc(100vw - 48px)', height: 'calc(100dvh - 48px)' } : {}) }}
        footer={
          footerVisible ? (
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
          {!customContent && resolvedMode === 'controls' ? <ControlsHeader title={title} controls={controls} /> : null}
          <div
            className={cn(
              'flex min-h-0 flex-1 flex-col',
              !customContent && (resolvedMode === 'controls' ? 'px-5 pb-5' : 'p-5'),
              customContent && !fit && 'p-5',
            )}
          >
            <div
              className={cn(
                'flex min-h-0 flex-1 flex-col overflow-auto overscroll-contain',
                mode === 'float' && 'rounded-[var(--window-radius)]',
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
          {!customContent && mode === 'float' ? <FloatHeader title={title} header={header} /> : null}
        </div>
      </LiquidGlassModal>
    </WindowFooterContext.Provider>
  );
}
