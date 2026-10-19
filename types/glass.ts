import type { CSSProperties, ReactNode, Ref } from 'react';

export type GlassMaskVariant = 'glass' | 'veil';

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
  transparent?: boolean;
  children: ReactNode;
};
