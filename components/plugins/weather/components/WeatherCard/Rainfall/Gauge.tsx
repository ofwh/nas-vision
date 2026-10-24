'use client';

import { useId } from 'react';
import styles from './Gauge.module.css';

const drop = 'M100 8 C85 33 40 76 40 111 C40 146 66 172 100 172 C134 172 160 146 160 111 C160 76 115 33 100 8 Z';
const wave =
  'M-160 0 Q-140 -5 -120 0 T-80 0 T-40 0 T0 0 T40 0 T80 0 T120 0 T160 0 T200 0 T240 0 T280 0 T320 0 V200 H-160 Z';

export function RainfallGauge({
  progress,
  display,
  unit,
  label,
  scale,
}: {
  progress: number | null;
  display: string;
  unit: string;
  label: string;
  scale: string;
}) {
  const id = `rainfall-${useId().replace(/:/g, '')}`;
  const level = 172 - (progress ?? 0) * 164;

  return (
    <svg viewBox="22 2 156 176" role="img" aria-label={label} className="min-h-0 w-full flex-1">
      <title>{scale}</title>
      <defs>
        <clipPath id={`${id}-clip`}>
          <path d={drop} />
        </clipPath>
        <linearGradient id={`${id}-water`} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity={0.25} />
          <stop offset="50%" stopColor="white" stopOpacity={0.03} />
          <stop offset="100%" stopColor="#7dd3fc" stopOpacity={0.3} />
        </linearGradient>
      </defs>
      <path d={drop} fill="white" fillOpacity={0.04} />
      <g clipPath={`url(#${id}-clip)`}>
        {progress !== null && progress > 0 && (
          <g transform={`translate(0 ${level})`}>
            <g transform="translate(0 -4)">
              <path d={wave} fill="#7dd3fc" fillOpacity={0.45} className={styles.backWave} />
            </g>
            <path d={wave} fill={`url(#${id}-water)`} className={styles.wave} />
          </g>
        )}
        <path
          d="M61 111 C61 131 69 144 81 151"
          fill="none"
          stroke="white"
          strokeWidth={4}
          strokeOpacity={0.12}
          strokeLinecap="round"
        />
      </g>
      <path d={drop} fill="none" stroke={`url(#${id}-glass)`} strokeWidth={2} />
      <text
        x={100}
        y={111}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize={28}
        fontWeight={600}
        className="tabular-nums"
      >
        {display}
      </text>
      <text x={100} y={135} textAnchor="middle" fill="white" fillOpacity={0.6} fontSize={11}>
        {unit}
      </text>
    </svg>
  );
}
