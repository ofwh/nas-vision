'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { LogoPickerPopover } from '@/components/business/Apps/LogoPickerPopover';

/** 预览的图标 + 名字：展示效果与 AppItem 保持一致。图标即换图入口。 */
export function AppPreview({
  name,
  image,
  onImageChange,
}: {
  name: string;
  image: string;
  onImageChange: (url: string) => void;
}) {
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
        <div className="flex h-40 w-full flex-col items-center justify-center gap-2.5">
          <LogoPickerPopover value={image} onChange={onImageChange} />

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
