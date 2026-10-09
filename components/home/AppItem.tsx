'use client';

import { useTranslations } from 'next-intl';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { LiquidGlassDialog } from '@/components/common/LiquidGlassDialog';
import type { AppItem as AppRecord } from '@/lib/services/apps';

function AppUrlDialog({ name, url, onClose }: { name: string; url: string; onClose: () => void }) {
  return (
    <LiquidGlassDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      type="url"
      title={name}
      url={url}
      size={{ width: 1280, height: 800 }}
      style={{ width: 'min(1280px, 90vw)', height: '85vh' }}
    />
  );
}

export function AppItem({ name, image, type, url, innerUrl, external }: AppRecord) {
  const t = useTranslations();
  const barRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(0);
  const [open, setOpen] = useState(false);
  const address = url.trim() || innerUrl.trim();

  const openPage = () => {
    if (type !== 'url' || !address) return;
    let target: URL;
    try {
      target = new URL(address, window.location.href);
    } catch {
      return;
    }
    if (target.protocol !== 'http:' && target.protocol !== 'https:') return;
    if (external === 'newtab') {
      window.open(target.href, '_blank', 'noopener,noreferrer');
    } else if (external === 'replace') {
      window.location.assign(target.href);
    } else if (external === 'iframe') {
      setOpen(true);
    }
  };

  useEffect(() => {
    const bar = barRef.current;
    const text = textRef.current;
    if (!bar || !text) return;

    const measure = () => setOverflow(Math.max(0, text.scrollWidth - bar.clientWidth));
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(bar);
    observer.observe(text);
    return () => observer.disconnect();
  }, [name]);

  return (
    <>
      <div className="group flex h-52 w-60">
        <div className="h-full w-5" />

        <div className="h-full w-full pt-6.5">
          <button
            type="button"
            onClick={openPage}
            disabled={!address}
            aria-label={t('home.openNamed', { name })}
            className="flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-default"
          >
            {/* 别在玻璃上写 opacity：会自建 backdrop 根，毛玻璃就看不到背景了 */}
            {/* 放大走 transform，不占布局；长出来的部分靠 z-10 的文案盖住 */}
            <LiquidGlass
              className="h-32 w-32 rounded-full transition-transform duration-500 ease-out hover:scale-110"
              contentClassName="h-full"
            >
              {image ? <img src={image} alt="" className="h-full w-full rounded-full object-cover" /> : null}
            </LiquidGlass>

            <div
              ref={barRef}
              className="relative z-10 flex h-5.5 max-w-50 items-center overflow-hidden rounded-md text-sm text-white"
            >
              <span
                ref={textRef}
                className={overflow > 0 ? 'group-hover:animate-marquee whitespace-nowrap' : 'whitespace-nowrap'}
                style={{ '--marquee-shift': `-${overflow}px` } as CSSProperties}
              >
                {name}
              </span>
            </div>
          </button>
        </div>

        <div className="h-full w-5" />
      </div>
      {open ? <AppUrlDialog name={name} url={address} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
