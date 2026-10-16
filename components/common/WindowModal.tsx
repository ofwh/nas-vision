'use client';

import { useTranslations } from 'next-intl';
import { ExternalLink } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { LiquidGlassModal, type LiquidGlassModalProps } from '@/components/common/LiquidGlassModal';
import { Loading } from '@/components/common/Loading';
import { WindowControls } from '@/components/common/WindowControls';
import { fetchApi } from '@/lib/api/client';
import type { IframeCheckRes } from '@/lib/services/iframe';

export type WindowModalProps = Omit<LiquidGlassModalProps, 'header' | 'children'> & {
  src?: string;
  children?: ReactNode | ((controls: ReactNode) => ReactNode);
};

const EMBED_RADIUS = 12;

/** 状态只由 /api/public/iframe 决定，iframe 自身的事件不回写。 */
type EmbedStatus = 'checking' | 'allowed' | 'blocked';

function IframeContent({ src, title }: { src: string; title: ReactNode }) {
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
  );
}

export function WindowModal({ src, title, style, children, footer, ...props }: WindowModalProps) {
  const [maximized, setMaximized] = useState(false);
  const controls = <WindowControls maximized={maximized} onMaximize={() => setMaximized((value) => !value)} />;

  return (
    <LiquidGlassModal
      {...props}
      title={title}
      footer={footer}
      style={{
        ...style,
        ...(maximized ? { width: 'calc(100vw - 48px)', height: 'calc(100dvh - 48px)' } : {}),
      }}
    >
      {typeof children === 'function' ? (
        children(controls)
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="relative flex h-12 shrink-0 items-center justify-center px-24 text-white">
            <div className="absolute left-5">{controls}</div>
            <span className="truncate text-sm font-semibold">{title}</span>
          </div>
          <div className="min-h-0 flex-1 px-2 pt-0 pb-2">
            {children !== undefined ? children : src ? <IframeContent key={src} src={src} title={title} /> : null}
          </div>
        </div>
      )}
    </LiquidGlassModal>
  );
}
