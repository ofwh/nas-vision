'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import type { AppItem as AppRecord } from '@/lib/services/apps';
import { useApp } from '@/stores/app';

export function AppItem({ name, image }: Pick<AppRecord, 'name' | 'image'>) {
  const veil = useApp((state) => state.veil);
  const barRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(0);

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
    <div className="group flex h-52 w-60">
      <div className="h-full w-5" />

      <div className="h-full w-full pt-6.5">
        <div className="flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-2.5">
          {/* 别在玻璃上写 opacity：会自建 backdrop 根，毛玻璃就看不到背景了 */}
          {/* 放大走 transform，不占布局；长出来的部分靠 z-10 的文案盖住 */}
          <LiquidGlass
            className="h-32 w-32 rounded-full transition-transform duration-500 ease-out hover:scale-110"
            contentClassName="h-full"
            variant={veil ? 'veil' : 'glass'}
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
        </div>
      </div>

      <div className="h-full w-5" />
    </div>
  );
}
