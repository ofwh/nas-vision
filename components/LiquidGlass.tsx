import type { CSSProperties, ReactNode, Ref } from 'react';

/**
 * 液态玻璃容器，结构照搬 references/liquid-glass-apple 里的 glass-container：
 * 三层玻璃 + 一层内容，层级都在容器自己的层叠上下文里（isolation + 0/10/20/30）。
 *
 *   .容器的 className        形状：尺寸、圆角、位置、动效
 *   ├─ 折射层  z-0           backdrop 毛玻璃 + SVG 位移滤镜，在边缘扭出镜片感
 *   ├─ 覆盖色  z-10          统一色调
 *   ├─ 高光    z-20          内阴影勾出玻璃厚度
 *   └─ 内容层  z-30          消费方的元素放这（className 走 contentClassName）
 *
 * 需要玻璃效果的组件，把元素丢进 slot 就行：
 *
 *   <LiquidGlass className="h-45 w-17 rounded-[34px]">
 *     <div>…</div>
 *   </LiquidGlass>
 *
 * 三层都写 inset: 0 + border-radius: inherit，所以容器怎么变形玻璃就怎么跟着变，
 * 连宽度做过渡都不会掉队。容器本身是普通 block（不是 flex）：内容层就贴在容器内容盒
 * 的原点，子元素按容器坐标定位即可 —— 要是给容器加上 flex，内容层会被当成 flex item
 * 挪位置，坐标就不准了。
 *
 * 表面参数可以整层覆盖（就近的祖先给变量赋值即可，不给就用默认值）：
 *   --glass-tint           覆盖色，默认 rgb(255 255 255 / 0.25)（参考里的 --lg-bg-color）
 *   --glass-highlight      高光，默认 rgb(255 255 255 / 0.75)
 *   --glass-text           文字色，默认 white
 *   --glass-specular-glow  高光的扩散半径，默认 5px
 * 前三个是参考的原值，跟玻璃大小无关；glow 和折射强度不是 —— 参考的 5px 内发光在它那个
 * 120px 高的容器上占 4%，搬到一个 68px 宽的胶囊上就是整个宽度的 15%，会变成一圈发白的
 * 描边，所以小玻璃要自己把它调细（侧边栏给的是 2px）。折射滤镜同理，见 GlassFilter.tsx。
 * 毛玻璃是写死的 4px（参考值），要改在下面 FILTER 里。
 *
 * 滤镜本体 #lensFilter 是全局一份，见 components/GlassFilter.tsx（已挂在 app/layout.tsx）；
 * 想要彻底自包含的话，把那个 <svg> 挪进来、用 useId() 生成 id 也行，只是组件就得是 client 了。
 */
export type LiquidGlassProps = {
  /** 容器形状：尺寸、圆角、位置、动效。玻璃表面本身不用管。 */
  className?: string;
  /** 内容层布局：flex/grid/padding 这些自己给；不写就是一层普通的 block。 */
  contentClassName?: string;
  /** 容器上的内联样式，主要是给实例覆盖表面参数用的（--glass-tint 之类）。 */
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
};

/** 三层玻璃的样式，值都从参考里搬过来（注释里标了出处）。 */
const FILTER =
  'absolute inset-0 z-0 rounded-[inherit] backdrop-blur-[4px] [filter:url(#lensFilter)_saturate(120%)_brightness(1.15)]';
const OVERLAY = 'absolute inset-0 z-10 rounded-[inherit] bg-[var(--glass-tint,rgb(255_255_255/0.25))]';
const SPECULAR =
  'absolute inset-0 z-20 rounded-[inherit] shadow-[inset_1px_1px_0_var(--glass-highlight,rgb(255_255_255/0.75)),inset_0_0_var(--glass-specular-glow,5px)_var(--glass-highlight,rgb(255_255_255/0.75))]';

const CONTAINER =
  'relative isolate overflow-hidden bg-transparent text-[var(--glass-text,white)] shadow-[0_6px_6px_rgb(0_0_0/0.2),0_0_20px_rgb(0_0_0/0.1)]';

const CONTENT = 'relative z-30';

/** Tailwind 没有 clsx 那一套，这里只要拼接、不做冲突消解。 */
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

export function LiquidGlass({ className, contentClassName, style, ref, children }: LiquidGlassProps) {
  return (
    <div ref={ref} style={style} className={cn(CONTAINER, className)}>
      {/* 折射层：先 backdrop 毛玻璃，再让滤镜按元素 alpha 在边缘扭出折射 ——
          filter 会作用到 backdrop-filter 的结果上，这是这套效果的关键 */}
      <div className={FILTER} />
      <div className={OVERLAY} />
      <div className={SPECULAR} />

      <div className={cn(CONTENT, contentClassName)}>{children}</div>
    </div>
  );
}
