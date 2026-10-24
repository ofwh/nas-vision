'use client';

import { useId } from 'react';

const ticks = Array.from({ length: 51 }, (_, index) => {
  const angle = ((90 + index * 6) * Math.PI) / 180;
  const inner = index % 5 === 0 ? 72 : 75;

  return {
    ratio: index / 50,
    x1: 100 + inner * Math.cos(angle),
    y1: 100 + inner * Math.sin(angle),
    x2: 100 + 81 * Math.cos(angle),
    y2: 100 + 81 * Math.sin(angle),
  };
});
const arc = 'M100 162 A62 62 0 1 1 153.694 131';

export function FeelsLikeGauge({
  progress,
  display,
  label,
}: {
  progress: number | null;
  display: string;
  label: string;
}) {
  const gradient = `feels-like-${useId().replace(/:/g, '')}`;

  return (
    <svg viewBox="12 12 176 176" role="img" aria-label={label} className="min-h-0 w-full flex-1">
      <defs>
        <linearGradient id={gradient} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c026d3" />
          <stop offset="45%" stopColor="#a78bfa" />
          <stop offset="75%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#67e8f9" />
        </linearGradient>
      </defs>
      {ticks.map((tick) => (
        <line
          key={tick.ratio}
          x1={tick.x1}
          y1={tick.y1}
          x2={tick.x2}
          y2={tick.y2}
          stroke="white"
          strokeOpacity={progress !== null && tick.ratio <= progress ? 0.65 : 0.2}
          strokeWidth={1.5}
          className="transition-[stroke-opacity] duration-300 motion-reduce:transition-none"
        />
      ))}
      <path d={arc} fill="none" stroke="white" strokeOpacity={0.05} strokeWidth={5} strokeLinecap="round" />
      {progress !== null && progress > 0 && (
        <path
          d={arc}
          fill="none"
          stroke={`url(#${gradient})`}
          strokeWidth={5}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${progress * 100} 100`}
          className="transition-[stroke-dasharray] duration-500 motion-reduce:transition-none"
        />
      )}
      <text
        x={100}
        y={100}
        fill="white"
        fontSize={32}
        fontWeight={600}
        textAnchor="middle"
        dominantBaseline="middle"
        className="tabular-nums"
      >
        {display}
      </text>
    </svg>
  );
}
