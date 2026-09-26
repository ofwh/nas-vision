'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';

/**
 * Per-app settings. Deliberately empty for now — fields get added here as the
 * app model grows, so consumers can already carry the object around.
 */
export type AppItemConfig = Record<string, unknown>;

export type AppItemProps = {
  id: string;
  name: string;
  image: string;
  url: string;
  innerUrl: string;
  config: AppItemConfig;
};

/** One honeycomb slot: a fixed 240x208 tile. */
export function AppItem({ name, image }: AppItemProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  /** How far the name sticks out of its box, in px. 0 means it fits. */
  const [overflow, setOverflow] = useState(0);

  useEffect(() => {
    const bar = barRef.current;
    const text = textRef.current;
    if (!bar || !text) return;

    // Measure the text against the box rather than the box's own scrollWidth:
    // the transform the marquee applies would otherwise feed back into the
    // measurement. Watching both boxes also catches the webfont swapping in,
    // which changes how wide the same name is.
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
          {/* 图标容器 */}
          <div className="h-32 w-32 rounded-full bg-blue-50">
            {/* alt is empty on purpose: the name is rendered below as text. */}
            {image ? <img src={image} alt="" className="h-full w-full rounded-full object-cover" /> : null}
          </div>

          {/* 文案容器 */}
          <div ref={barRef} className="flex h-5.5 max-w-50 items-center overflow-hidden rounded-md text-sm">
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
