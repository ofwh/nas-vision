'use client';

import { useId } from 'react';

const maximum = 12;
const arc = 'M24 150 A116 116 0 0 1 256 150';
const ticks = [0, 2, 4, 6, 8, 10, 12];
const gradientStops = Array.from({ length: 101 }, (_, index) => {
  const ratio = index / 100;

  return {
    offset: ((1 - Math.cos(Math.PI * ratio)) / 2) * 100,
    opacity: ratio * 0.8,
    color:
      ratio <= 0.5
        ? `color-mix(in srgb, #075985 ${100 - ratio * 200}%, #38bdf8)`
        : `color-mix(in srgb, #38bdf8 ${200 - ratio * 200}%, var(--color-purple-400))`,
  };
});

export function UVGauge({ value }: { value: number | null }) {
  const gradient = `uv-gradient-${useId().replace(/:/g, '')}`;
  const progress = value === null ? 0 : Math.min(value / maximum, 1) * 100;

  return (
    <svg viewBox="8 18 264 140" aria-hidden className="h-0 min-h-0 w-full flex-1">
      <defs>
        <linearGradient id={gradient} gradientUnits="userSpaceOnUse" x1="24" y1="150" x2="256" y2="150">
          {gradientStops.map((stop) => (
            <stop key={stop.offset} offset={`${stop.offset}%`} stopColor={stop.color} stopOpacity={stop.opacity} />
          ))}
        </linearGradient>
      </defs>
      <path d={arc} fill="none" stroke="white" strokeOpacity={0.1} strokeWidth={14} />
      <path d={arc} fill="none" stroke="white" strokeOpacity={0.6} strokeWidth={1} />
      <path
        d={arc}
        fill="none"
        stroke={`url(#${gradient})`}
        strokeWidth={32}
        pathLength={100}
        strokeDasharray={`${progress} 100`}
        className="transition-[stroke-dasharray] duration-500 motion-reduce:transition-none"
      />
      {ticks.map((tick) => {
        const angle = Math.PI * (1 - tick / maximum);

        return (
          <text
            key={tick}
            x={140 + 96 * Math.cos(angle)}
            y={150 - 96 * Math.sin(angle)}
            fill="white"
            fillOpacity={0.4}
            fontSize={11}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {tick}
          </text>
        );
      })}
    </svg>
  );
}
