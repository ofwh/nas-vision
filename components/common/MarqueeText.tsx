'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';

type MarqueeTextProps = {
  text: string;
  className?: string;
  style?: CSSProperties;
  animationClassName?: string;
};

export function MarqueeText({
  text,
  className,
  style,
  animationClassName = 'group-hover/marquee:animate-marquee group-focus-within/marquee:animate-marquee',
}: MarqueeTextProps) {
  const viewportRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    const content = textRef.current;

    if (!viewport || !content) {
      return;
    }

    const measure = () => {
      const styles = getComputedStyle(viewport);
      const width =
        viewport.clientWidth - Number.parseFloat(styles.paddingLeft) - Number.parseFloat(styles.paddingRight);

      setOverflow(Math.max(0, content.scrollWidth - width));
    };
    const observer = new ResizeObserver(measure);

    measure();
    observer.observe(viewport);
    observer.observe(content);

    return () => observer.disconnect();
  }, [text]);

  const animationStyle: CSSProperties & Record<'--marquee-shift' | '--marquee-duration', string> = {
    '--marquee-shift': `-${overflow}px`,
    '--marquee-duration': `${Math.max(1.5, overflow / 40)}s`,
  };

  return (
    <span
      ref={viewportRef}
      title={text}
      className={cn('group/marquee block min-w-0 overflow-hidden', className)}
      style={style}
    >
      <span
        ref={textRef}
        className={cn(
          'block w-max min-w-full shrink-0 whitespace-nowrap',
          overflow > 0 && animationClassName,
          'motion-reduce:animate-none',
        )}
        style={animationStyle}
      >
        {text}
      </span>
    </span>
  );
}
