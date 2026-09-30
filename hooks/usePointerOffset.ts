import { useEffect, useEffectEvent } from 'react';

type Subscriber = (offsetX: number, offsetY: number) => void;

/** 阻尼时间常数(秒)，越大越重。 */
const TIME_CONSTANT = 0.22;

/** 小于它就贴住目标并停掉 rAF。 */
const SETTLE_EPSILON = 0.0002;

/** 单帧步长上限(秒)，切走标签页再回来时钳一下。 */
const MAX_STEP = 0.05;

const RESIZE_THROTTLE = 150;

const subscribers = new Set<Subscriber>();

let halfWidth = 0;
let halfHeight = 0;

let targetX = 0;
let targetY = 0;
let x = 0;
let y = 0;

let pointerX = 0;
let pointerY = 0;
let pointerInside = false;

let frame = 0;
let last = 0;

let listening = false;

let centerUpdatedAt = 0;
let resizeTimer: ReturnType<typeof setTimeout> | undefined;

const aim = (clientX: number, clientY: number) => {
  pointerX = clientX;
  pointerY = clientY;
  targetX = (clientX - halfWidth) / halfWidth;
  targetY = (clientY - halfHeight) / halfHeight;
};

const tick = (now: number) => {
  frame = 0;

  const dt = Math.min((now - last) / 1000, MAX_STEP);
  last = now;

  const alpha = 1 - Math.exp(-dt / TIME_CONSTANT);
  x += (targetX - x) * alpha;
  y += (targetY - y) * alpha;

  const settled = Math.abs(targetX - x) < SETTLE_EPSILON && Math.abs(targetY - y) < SETTLE_EPSILON;
  if (settled) {
    x = targetX;
    y = targetY;
  }

  for (const onFrame of subscribers) onFrame(x, y);

  frame = settled ? 0 : requestAnimationFrame(tick);
};

const start = () => {
  if (frame || !subscribers.size) return;
  last = performance.now();
  frame = requestAnimationFrame(tick);
};

const onPointerMove = (event: PointerEvent) => {
  if (event.pointerType === 'touch') return;

  pointerInside = true;
  aim(event.clientX, event.clientY);
  start();
};

const onPointerOut = (event: PointerEvent) => {
  if (event.relatedTarget) return;

  pointerInside = false;
  targetX = 0;
  targetY = 0;
  start();
};

const refreshCenter = () => {
  centerUpdatedAt = Date.now();
  halfWidth = window.innerWidth / 2;
  halfHeight = window.innerHeight / 2;

  if (!pointerInside) return;

  aim(pointerX, pointerY);
  start();
};

const onResize = () => {
  const elapsed = Date.now() - centerUpdatedAt;

  if (elapsed >= RESIZE_THROTTLE) {
    refreshCenter();
    return;
  }

  if (resizeTimer !== undefined) return;
  resizeTimer = setTimeout(() => {
    resizeTimer = undefined;
    refreshCenter();
  }, RESIZE_THROTTLE - elapsed);
};

const subscribe = (onFrame: Subscriber) => {
  if (!subscribers.size) {
    x = targetX = 0;
    y = targetY = 0;
    pointerInside = false;
    refreshCenter();
  }

  subscribers.add(onFrame);

  if (!listening) {
    listening = true;
    window.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerout', onPointerOut);
    window.addEventListener('resize', onResize);
  }

  return () => {
    subscribers.delete(onFrame);
    if (subscribers.size) return;

    listening = false;
    window.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerout', onPointerOut);
    window.removeEventListener('resize', onResize);
    if (resizeTimer !== undefined) clearTimeout(resizeTimer);
    resizeTimer = undefined;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };
};

/** 每帧给相对页面中心的归一化偏移，±1 = 贴到该轴边；全站共用一份。 */
export function usePointerOffset(onFrame: (offsetX: number, offsetY: number) => void) {
  const emit = useEffectEvent(onFrame);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    return subscribe((x, y) => emit(x, y));
  }, []);
}
