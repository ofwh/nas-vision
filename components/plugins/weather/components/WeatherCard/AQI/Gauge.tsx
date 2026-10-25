'use client';

import type { ReactNode } from 'react';
import { aqiColor } from '../../../utils/airQuality';

function point(progress: number) {
  const angle = ((150 + progress * 240) * Math.PI) / 180;

  return { x: 100 + 76 * Math.cos(angle), y: 100 + 76 * Math.sin(angle) };
}

const segments = Array.from({ length: 120 }, (_, index) => {
  const from = point(index / 120);
  const to = point(Math.min(1, (index + 1) / 120 + 0.0005));

  return { path: `M${from.x} ${from.y} A76 76 0 0 1 ${to.x} ${to.y}`, color: aqiColor(((index + 0.5) / 120) * 500) };
});

export function AQIGauge({
  progress,
  display,
  scale,
  label,
  children,
}: {
  progress: number | null;
  display: string;
  scale: string;
  label: string;
  children?: ReactNode;
}) {
  const marker = progress === null ? null : point(progress);
  const start = point(0);
  const end = point(1);

  return (
    <svg
      viewBox="8 8 184 152"
      preserveAspectRatio="xMidYMin meet"
      role="img"
      aria-label={label}
      className="h-0 min-h-0 w-full flex-1"
    >
      {segments.map((segment) => (
        <path key={segment.path} d={segment.path} fill="none" stroke={segment.color} strokeWidth={8} />
      ))}
      <circle cx={start.x} cy={start.y} r={4} fill={aqiColor(0)} />
      <circle cx={end.x} cy={end.y} r={4} fill={aqiColor(500)} />
      {marker && (
        <circle
          cx={marker.x}
          cy={marker.y}
          r={6}
          fill="white"
          stroke={aqiColor((progress ?? 0) * 500)}
          strokeWidth={4}
        />
      )}
      <text
        x={100}
        y={88}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize={36}
        fontWeight={600}
        className="tabular-nums"
      >
        {display}
      </text>
      <text x={100} y={113} textAnchor="middle" fill="white" fillOpacity={0.6} fontSize={11}>
        {scale}
      </text>
      <foreignObject x={20} y={136} width={160} height={24}>
        <div className="flex h-full items-center justify-center">{children}</div>
      </foreignObject>
    </svg>
  );
}
