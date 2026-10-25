'use client';

import { useId } from 'react';
import sunny from '../../../assets/sunny.svg';

const path = 'M8 148 Q220 -20 432 148';
const glowStops = Array.from({ length: 11 }, (_, index) => {
  const ratio = index / 10;

  return { offset: `${ratio * 100}%`, opacity: ratio === 1 ? 0 : 0.6 * Math.exp(-6 * ratio * ratio) };
});

export function SunnyArc({ progress }: { progress: number | null }) {
  const id = useId().replace(/:/g, '');
  const x = progress === null ? 0 : 8 + 424 * progress;
  const y = progress === null ? 0 : 148 - 336 * progress * (1 - progress);

  return (
    <svg
      viewBox="0 0 440 160"
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent),linear-gradient(to_bottom,black_70%,transparent)] [mask-composite:intersect]"
    >
      <defs>
        <linearGradient id={`sun-arc-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fde68a" stopOpacity={0} />
          <stop offset="20%" stopColor="#fbbf24" stopOpacity={0.65} />
          <stop offset="50%" stopColor="#facc15" />
          <stop offset="80%" stopColor="#fbbf24" stopOpacity={0.65} />
          <stop offset="100%" stopColor="#fde68a" stopOpacity={0} />
        </linearGradient>
        <radialGradient id={`sun-glow-${id}`}>
          {glowStops.map((stop) => (
            <stop key={stop.offset} offset={stop.offset} stopColor="#facc15" stopOpacity={stop.opacity} />
          ))}
        </radialGradient>
      </defs>
      <path d={path} fill="none" stroke={`url(#sun-arc-${id})`} strokeWidth={3} strokeLinecap="round" />
      {progress !== null && (
        <g>
          <circle cx={x} cy={y} r={44} fill={`url(#sun-glow-${id})`} />
          <image href={sunny.src} x={x - 18} y={y - 18} width={36} height={36} />
        </g>
      )}
    </svg>
  );
}
