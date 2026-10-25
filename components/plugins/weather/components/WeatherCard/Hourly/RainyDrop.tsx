'use client';

import type { Locale } from '@/i18n/config';

export function RainyDrop({ point, locale }: { point: unknown; locale: Locale }) {
  if (
    !point ||
    typeof point !== 'object' ||
    !('cx' in point) ||
    !('cy' in point) ||
    typeof point.cx !== 'number' ||
    typeof point.cy !== 'number' ||
    !('payload' in point)
  ) {
    return <g />;
  }

  const payload: unknown = point.payload;

  if (
    !payload ||
    typeof payload !== 'object' ||
    !('probability' in payload) ||
    typeof payload.probability !== 'number'
  ) {
    return <g />;
  }

  const probability = payload.probability;
  const width = 5 + probability * 0.11;
  const height = width * 1.4;
  const showLabel = 'showLabel' in payload && payload.showLabel === true;
  const value = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(probability);

  return (
    <g>
      {showLabel && (
        <text
          x={point.cx}
          y={point.cy - height / 2 - 8}
          fill="white"
          fillOpacity={0.9}
          fontSize={12}
          textAnchor="middle"
        >
          {value}
        </text>
      )}
      <g transform={`translate(${point.cx - width / 2} ${point.cy - height / 2}) scale(${width / 32} ${height / 32})`}>
        <path
          d="M16 1 C13 7 6 15 6 22 A10 10 0 0 0 26 22 C26 15 19 7 16 1 Z"
          fill={`color-mix(in srgb, #06b6d4 ${35 + probability * 0.65}%, #a5f3fc)`}
        />
      </g>
    </g>
  );
}
