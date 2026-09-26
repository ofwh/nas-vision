/**
 * liquid glass 的折射滤镜，`app/layout.tsx` 里挂一份即可 —— SVG 滤镜按 id 全局引用，
 * <LiquidGlass /> 的折射层用 `url(#lensFilter)` 找的就是这里。
 *
 * 原理：把元素自己的 alpha（SourceAlpha）大幅高斯模糊，模糊后的 alpha 既画出了"边缘在哪"，
 * 又被 feDisplacementMap 当位移图用（x/y 都取 alpha 通道），于是越靠近边缘的像素被推得越远、
 * backdrop 在边缘折了一下 —— 这就是镜片感。中间那段 alpha 是平的、梯度为 0，所以内部不动，
 * 折射只发生在边缘。
 *
 * 参数是 px，不随元素缩放，而"边缘"的宽度就是 stdDeviation：它必须明显小于玻璃的短边，
 * 内部那截才会是平的。参考的 pen 用在大容器上（300px+），值给的 50 / 50；直接搬到这里
 * 68px 宽的胶囊上，50px 的模糊盖住了整条宽度、内部没有平段，整个胶囊会被搅烂。所以按
 * 胶囊尺寸重标定成 10 / 12（位移取 1.2 倍左右，边缘折射才看得出来）。
 * 换更大或更小的玻璃，这两个值要跟着调。
 *
 * 尺寸给 0：它只是个定义，不参与布局。
 */
export function GlassFilter() {
  return (
    <svg aria-hidden className="absolute h-0 w-0 overflow-hidden">
      <filter id="lensFilter" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
        <feComponentTransfer in="SourceAlpha" result="alpha">
          <feFuncA type="identity" />
        </feComponentTransfer>
        <feGaussianBlur in="alpha" stdDeviation="10" result="blur" />
        <feDisplacementMap in="SourceGraphic" in2="blur" scale="12" xChannelSelector="A" yChannelSelector="A" />
      </filter>
    </svg>
  );
}
