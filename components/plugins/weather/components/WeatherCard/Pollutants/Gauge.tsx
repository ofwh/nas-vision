import { useId } from 'react';
import type { Locale } from '@/i18n/config';
import { getTranslator } from '../../../i18n';

const levels = [
  { name: 'good', color: '#4cbb1e' },
  { name: 'light', color: '#b8dc17' },
  { name: 'moderate', color: '#fdd000' },
  { name: 'heavy', color: '#ff8500' },
  { name: 'severe', color: '#f02600' },
] as const;
const center = { x: 80, y: 80 };
const radius = 64;
const thickness = 20;
const startAngle = 135;
const sweep = 270;

function point(degrees: number) {
  const angle = (degrees * Math.PI) / 180;

  return { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) };
}

function arc(from: number, to: number) {
  const start = point(from);
  const end = point(to);

  return `M${start.x} ${start.y} A${radius} ${radius} 0 ${to - from > 180 ? 1 : 0} 1 ${end.x} ${end.y}`;
}

function progressColor(progress: number) {
  const from = [112, 213, 229];
  const to = [169, 163, 220];
  const channels = from.map((channel, index) => Math.round(channel + (to[index] - channel) * progress));

  return `rgb(${channels.join(' ')})`;
}

export function PM25Gauge({
  level,
  progress,
  display,
  locale,
}: {
  level: number | null;
  progress: number | null;
  display: string;
  locale: Locale;
}) {
  const id = useId();
  const diskId = `${id}-disk`;
  const t = getTranslator(locale);
  const active = level === null ? null : levels[level];
  const category = active ? t(`pollutants.levels.${active.name}`) : t('unavailable');
  const unit = t('pollutants.units.microgram_per_cubic_meter');
  const position = progress === null ? null : Math.min(1, Math.max(0, progress));
  const markerAngle = startAngle + sweep * (position ?? 0);
  const marker = position === null ? null : point(markerAngle);
  const segments =
    position !== null && position > 0
      ? Array.from({ length: 80 }, (_, index) => ({
          path: arc(startAngle + (sweep * position * index) / 80, startAngle + (sweep * position * (index + 1)) / 80),
          color: progressColor(index / 79),
        }))
      : [];

  return (
    <svg
      viewBox="0 0 160 148"
      role="img"
      aria-label={`${t('card.pollutants')} ${display} ${unit} ${category}`}
      className="h-0 min-h-0 w-full flex-1"
    >
      <defs>
        <linearGradient id={diskId} x1={0} y1={0} x2={1} y2={1}>
          <stop offset="0" stopColor="#454957" />
          <stop offset="1" stopColor="#343946" />
        </linearGradient>
      </defs>
      <path
        d={arc(startAngle, startAngle + sweep)}
        fill="none"
        stroke="#e4e2f4"
        strokeOpacity={0.25}
        strokeWidth={thickness}
        strokeLinecap="round"
      />
      {segments.map((segment) => (
        <path
          key={segment.path}
          d={segment.path}
          fill="none"
          stroke={segment.color}
          strokeWidth={thickness}
          strokeLinecap="round"
        />
      ))}
      {marker && (
        <>
          {position === 0 && <circle cx={marker.x} cy={marker.y} r={thickness / 2} fill={progressColor(0)} />}
          <circle cx={marker.x} cy={marker.y} r={4} fill="white" />
        </>
      )}
      <circle cx={center.x} cy={center.y} r={31} fill="#e4e2f4" fillOpacity={0.65} />
      {position !== null && (
        <path
          d="M75.5 54 L80 40 L84.5 54 Z"
          transform={`rotate(${markerAngle + 90} ${center.x} ${center.y})`}
          fill="#3f4351"
          stroke="#e4e2f4"
          strokeOpacity={0.4}
          strokeWidth={0.6}
          strokeLinejoin="round"
        />
      )}
      <circle
        cx={center.x}
        cy={center.y}
        r={28}
        fill={`url(#${diskId})`}
        stroke="white"
        strokeOpacity={0.1}
        strokeWidth={0.6}
      />
      <text
        x={80}
        y={76}
        fill="white"
        fontSize={display.length > 4 ? 18 : 22}
        fontWeight={700}
        textAnchor="middle"
        dominantBaseline="middle"
        className="tabular-nums"
      >
        {display}
      </text>
      <text x={80} y={94} fill="white" fillOpacity={0.7} fontSize={8.5} textAnchor="middle">
        {unit}
      </text>
      <text
        x={80}
        y={135}
        fill={active?.color ?? 'white'}
        fillOpacity={active ? 1 : 0.5}
        fontSize={11}
        fontWeight={600}
        textAnchor="middle"
      >
        {category}
      </text>
    </svg>
  );
}
