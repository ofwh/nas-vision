'use client';

import { type CSSProperties, type ReactNode, type Ref, useRef } from 'react';
import { usePointerOffset } from '@/hooks/usePointerOffset';
import { useSettings } from '@/stores/settings';

/**
 * 液态玻璃容器。可调参数就地覆盖父容器的 CSS 变量：
 * --glass-tint / --glass-highlight / --glass-text / --glass-specular-glow。
 */
export type LiquidGlassProps = {
  className?: string;
  contentClassName?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
  variant?: GlassMaskVariant;
  children: ReactNode;
};

const FILTER =
  'absolute inset-0 z-0 rounded-[inherit] backdrop-blur-[4px] [filter:url(#lensFilter)_saturate(120%)_brightness(1.15)]';

const OVERLAY = 'absolute inset-0 z-10 rounded-[inherit] bg-[var(--glass-tint,rgb(255_255_255/0.08))]';

const VEIL = 'absolute inset-0 z-0 rounded-[inherit] backdrop-blur-[14px]';

const VEIL_OVERLAY = 'absolute inset-0 z-10 rounded-[inherit] bg-[var(--glass-tint,rgb(18_18_22/0.18))]';

/** 内阴影偏移与光源反向，默认 (1px,1px) 即光从左上来。 */
const SPECULAR =
  'absolute inset-0 z-20 rounded-[inherit] shadow-[inset_var(--glass-specular-x,1px)_var(--glass-specular-y,1px)_0_var(--glass-highlight,rgb(255_255_255/0.75)),inset_var(--glass-specular-x,1px)_var(--glass-specular-y,1px)_var(--glass-specular-glow,2px)_var(--glass-highlight,rgb(255_255_255/0.75))]';

/** 高光偏移上限(px)：鼠标贴到视口边时的最大偏移，玻璃越小给得越小。 */
const SPECULAR_REACH = 1.8;

const CONTAINER =
  'relative isolate overflow-hidden bg-transparent text-[var(--glass-text,white)] shadow-[0_6px_6px_rgb(0_0_0/0.2),0_0_20px_rgb(0_0_0/0.1)]';

const CONTENT = 'relative z-30';

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

export type GlassMaskVariant = 'glass' | 'veil';

/** 父容器要 `relative isolate`，内容压到 z-30 之上，否则被盖住、也点不到。 */
export function GlassMask({ variant }: { variant?: GlassMaskVariant }) {
  const veil = useSettings((state) => state.veil);
  const resolvedVariant = variant ?? (veil ? 'veil' : 'glass');
  const [filter, overlay] = resolvedVariant === 'veil' ? [VEIL, VEIL_OVERLAY] : [FILTER, OVERLAY];

  return (
    <>
      <div aria-hidden className={filter} />
      <div aria-hidden className={overlay} />
    </>
  );
}

export function LiquidGlass({ className, contentClassName, style, ref, variant, children }: LiquidGlassProps) {
  const specularRef = useRef<HTMLDivElement>(null);
  const lastOffset = useRef({ x: '', y: '' });

  usePointerOffset((offsetX, offsetY) => {
    const specular = specularRef.current;
    if (!specular) return;

    const x = `${(-offsetX * SPECULAR_REACH).toFixed(2)}px`;
    const y = `${(-offsetY * SPECULAR_REACH).toFixed(2)}px`;
    if (lastOffset.current.x !== x) {
      specular.style.setProperty('--glass-specular-x', x);
      lastOffset.current.x = x;
    }
    if (lastOffset.current.y !== y) {
      specular.style.setProperty('--glass-specular-y', y);
      lastOffset.current.y = y;
    }
  });

  return (
    <div ref={ref} style={style} className={cn(CONTAINER, className)}>
      <GlassMask variant={variant} />
      <div ref={specularRef} className={SPECULAR} />

      <div className={cn(CONTENT, contentClassName)}>{children}</div>
    </div>
  );
}
