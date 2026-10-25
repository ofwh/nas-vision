'use client';

import { useId } from 'react';

type CompassProps = {
  direction: number | null;
  label: string;
  labels: Record<'north' | 'south' | 'east' | 'west', string>;
};

const ticks = Array.from({ length: 72 }, (_, index) => index * 5);

export function Compass({ direction, label, labels }: CompassProps) {
  const gradient = `wind-needle-${useId().replace(/:/g, '')}`;

  return (
    <svg viewBox="4 4 192 192" role="img" aria-label={label} className="min-h-0 w-full flex-1">
      <defs>
        <linearGradient id={gradient} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="var(--color-sky-500)" />
          <stop offset="100%" stopColor="var(--color-cyan-200)" />
        </linearGradient>
      </defs>
      {ticks.map((angle) => (
        <line
          key={angle}
          x1={100}
          y1={26}
          x2={100}
          y2={angle % 90 === 0 ? 43 : angle % 30 === 0 ? 38 : 37}
          transform={`rotate(${angle} 100 100)`}
          stroke="white"
          strokeOpacity={angle % 90 === 0 ? 0.7 : 0.25}
          strokeWidth={angle % 90 === 0 ? 2 : 1}
        />
      ))}
      <g fill="white" fillOpacity={0.8} fontSize={14} textAnchor="middle" dominantBaseline="middle">
        <text x={100} y={12}>
          {labels.north}
        </text>
        <text x={100} y={188}>
          {labels.south}
        </text>
        <text x={12} y={100}>
          {labels.west}
        </text>
        <text x={188} y={100}>
          {labels.east}
        </text>
      </g>
      {direction !== null && (
        <g transform={`rotate(${direction} 100 100)`}>
          <path d="M100 44 L111 108 L100 99 L89 108 Z" fill={`url(#${gradient})`} />
          <path d="M100 156 L89 92 L100 101 L111 92 Z" fill="white" fillOpacity={0.3} />
          <circle cx={100} cy={100} r={4} fill="white" />
        </g>
      )}
    </svg>
  );
}
