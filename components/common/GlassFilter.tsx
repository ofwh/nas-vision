/** 全局一份，app/layout.tsx 挂着按 id 引用。stdDeviation / scale 是 px、不随元素缩放，按 68px 宽的胶囊标定。 */
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
