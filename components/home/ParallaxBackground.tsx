'use client';

import { useEffect, useRef } from 'react';

/**
 * 首页背景的鼠标视差层：铺一张跟视口一样大（再往外扩一圈）的定屏图，鼠标一动就算出目标位移，
 * 再"阻尼"地追过去 —— 不跟光标 1:1 走，也不匀速。
 *
 * 为什么另起一层，而不是改 body 那张图的 background-position（图就在 body 上，见 globals.css）：
 *
 *   1. cover 是按宿主盒子算的。图 16:9，视口也多半接近 16:9，两边几乎顶满、没有余量，
 *      background-position 一偏就露边。这里的盒子四边各扩出该轴的最大位移，怎么动都在盒子里。
 *   2. background-position 变了要重画整张图；transform 只动图层，交给合成器就行。
 *
 * body 那张图留着当地基：auth 那组页面自己盖了底色，看不见它；首页这边被这一层完全盖住，
 * 两边取同一个 --bg-image，换图只改一处。
 *
 * 位移每帧直接写 element.style，不走 React state —— 那等于 60fps 重渲染。这个组件挂上之后
 * 就不再 re-render 了。
 */

/** 单个轴的最大位移(px)。X 比 Y 给得多：横向是宽的那一边，同样的像素看着更不明显。 */
const MAX_OFFSET_X = 40;
const MAX_OFFSET_Y = 24;

/** 阻尼的时间常数(秒)：位移走完 63% 所需时长，越大越"重"。0.2 上下是跟得上又有肉感的区间。 */
const TIME_CONSTANT = 0.22;

/**
 * 响应曲线的指数，非线性就出在这：|n| ≤ 1 时 n^1.5 把近中心的一段压得更小、越靠边增长越快，
 * 于是鼠标同样的位移换来的画面位移不一样。给 1 就是线性（回到 1:1），越大中心越"钝"。
 */
const RESPONSE_EXPONENT = 1.5;

/**
 * 位移方向：-1 = 画面朝鼠标的反方向走 —— 鼠标往右，画面往左，视口露出的是画面更靠右的一段，
 * 像朝右探身去看（视差/纵深通常这个方向）；+1 = 画面跟着鼠标同向走，像直接拖这张图。
 * 阻尼和曲线两者完全一样，只差这个符号。
 */
const DIRECTION = -1;

/** 收敛判据(px)：差得比这还小就直接贴住目标并停掉 rAF。 */
const EPSILON = 0.05;

/** 单帧步长上限(秒)：切走标签页再回来 dt 会很大，钳一下，免得位移一帧跳过去。 */
const MAX_STEP = 0.05;

export function ParallaxBackground() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    // 系统里关了动效就一层不动：图还是这张图，只是不跟鼠标走。
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /** 鼠标算出来的目标位移，阻尼的终点。 */
    let targetX = 0;
    let targetY = 0;
    /** 实际画在屏幕上的位移，每帧朝目标挪一截。 */
    let x = 0;
    let y = 0;
    /** 在跑的 rAF id，0 表示循环停着（已经到位）。 */
    let frame = 0;
    /** 上一帧的时间戳(ms)，和 rAF 收到的是同一个时钟。 */
    let last = 0;

    const draw = () => {
      layer.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, MAX_STEP);
      last = now;

      // 指数阻尼：一阶滞后，离目标越远这帧走得越多，且不会过冲。
      // 系数写成 1 - e^(-dt/τ) 而不是定值，掉帧时也只是慢慢挪，手感不随帧率变。
      const alpha = 1 - Math.exp(-dt / TIME_CONSTANT);
      x += (targetX - x) * alpha;
      y += (targetY - y) * alpha;

      if (Math.abs(targetX - x) < EPSILON && Math.abs(targetY - y) < EPSILON) {
        x = targetX;
        y = targetY;
        draw();
        frame = 0; // 到位了就把循环停掉，等下一次 mousemove 再起
        return;
      }

      draw();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frame) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };

    /** 鼠标在视口里的位置 → 目标位移：中心是 0，贴到哪边就是哪边的极限。 */
    const aim = (clientX: number, clientY: number) => {
      const nx = (clientX / window.innerWidth) * 2 - 1;
      const ny = (clientY / window.innerHeight) * 2 - 1;

      targetX = Math.sign(nx) * Math.abs(nx) ** RESPONSE_EXPONENT * MAX_OFFSET_X * DIRECTION;
      targetY = Math.sign(ny) * Math.abs(ny) ** RESPONSE_EXPONENT * MAX_OFFSET_Y * DIRECTION;
    };

    const onPointerMove = (event: PointerEvent) => {
      // 手指不是"悬停"，让触摸也拽着背景跑会很怪。
      if (event.pointerType === 'touch') return;

      aim(event.clientX, event.clientY);
      start();
    };

    // relatedTarget 为空 = 指针出了窗口（切去别的 app），不是从这个元素移到那个元素。
    // 这时候回正，别把图停在一边。
    const onPointerOut = (event: PointerEvent) => {
      if (event.relatedTarget) return;

      aim(window.innerWidth / 2, window.innerHeight / 2);
      start();
    };

    window.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerout', onPointerOut);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerout', onPointerOut);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={layerRef}
      aria-hidden
      // 四边各往外扩出该轴的最大位移：位移怎么取值都还在这个盒子里，图不会露边。
      // 默认贴住中心，和 body 那张图的 background-position: center 对齐。
      style={{
        top: -MAX_OFFSET_Y,
        bottom: -MAX_OFFSET_Y,
        left: -MAX_OFFSET_X,
        right: -MAX_OFFSET_X,
        backgroundImage: 'var(--bg-image)',
      }}
      className="pointer-events-none fixed -z-10 bg-cover bg-center bg-no-repeat will-change-transform"
    />
  );
}
