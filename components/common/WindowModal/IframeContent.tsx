'use client';

import { useTranslations } from 'next-intl';
import { ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Loading } from '@/components/common/Loading';
import { fetchApi } from '@/lib/api/client';
import type { IframeCheckRes } from '@/lib/services/iframe';

/** 状态只由 /api/public/iframe 决定，iframe 自身的事件不回写。 */
type IframeAccessStatus = 'checking' | 'allowed' | 'blocked';

export function IframeContent({ src, title }: { src: string; title: string }) {
  const t = useTranslations();
  const [status, setStatus] = useState<IframeAccessStatus>('checking');

  useEffect(() => {
    let alive = true;

    void fetchApi<IframeCheckRes>('/api/public/iframe', { referer: window.location.href, url: src }).then(
      (response) => {
        if (alive) {
          setStatus(response.data?.deny ? 'blocked' : 'allowed');
        }
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
          <p className="text-sm text-white/80">
            {t.rich('common.iframeBlocked', {
              restrictions: (chunks) => (
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Frame-Options"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>

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
