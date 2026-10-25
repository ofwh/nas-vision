import { useId } from 'react';
import type { Locale } from '@/i18n/config';

const tickRadius = 130;
const center = { x: tickRadius + 64, y: 80 };
const tickWidth = 9;
const anglePerStep = 21 / tickRadius;
const subdivisions = 3;
const accent = '#ff543f';
const pointer = { x: 25, y: center.y };

function point(radius: number, angle: number) {
  return { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) };
}

export function VisibilityGauge({
  value,
  display,
  locale,
  label,
}: {
  value: number | null;
  display: string;
  locale: Locale;
  label: string;
}) {
  const id = useId();
  const fadeId = `${id}-fade`;
  const maskId = `${id}-mask`;
  const targetStep = Math.max(1, (value ?? 0) / 10);
  const magnitude = 10 ** Math.floor(Math.log10(targetStep));
  const normalizedStep = targetStep / magnitude;
  const step = (normalizedStep <= 1 ? 1 : normalizedStep <= 2 ? 2 : normalizedStep <= 5 ? 5 : 10) * magnitude;
  const current = value ?? 0;
  const base = Math.floor(current / step);
  const labelMinimum = Math.max(0, base - 2);
  const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  const ticks = Array.from({ length: 8 * subdivisions + 1 }, (_, index) => {
    const tickIndex = (base - 4) * subdivisions + index;
    const tickValue = (tickIndex * step) / subdivisions;
    const offset = (tickValue - current) / step;
    const angle = Math.PI + offset * anglePerStep;
    const distance = Math.abs(offset) * subdivisions;
    const adjacent = distance <= 1;
    const start = point(tickRadius, angle);
    const end = point(tickRadius + tickWidth * (adjacent ? 1.25 : 1), angle);
    const text = point(tickRadius + 27, angle);
    const integerIndex = tickIndex / subdivisions;

    return {
      index: tickIndex,
      value: tickValue,
      start,
      end,
      text,
      rotation: (angle * 180) / Math.PI - 270,
      opacity: value !== null && distance < 0.001 ? 0 : adjacent ? 0.8 : 0.4,
      showLabel: tickIndex % subdivisions === 0 && integerIndex >= labelMinimum && integerIndex <= labelMinimum + 4,
    };
  }).filter((tick) => tick.value >= 0);

  return (
    <div role="img" aria-label={label} className="relative isolate min-h-0 flex-1">
      <div aria-hidden="true" className="absolute bottom-1 left-0 z-10 flex flex-col gap-1 text-white">
        <span className="text-[clamp(1.75rem,5cqw,3rem)] leading-none font-semibold tracking-tight tabular-nums">
          {display}
        </span>
        <span className="text-sm text-white/60">km</span>
      </div>
      <svg
        viewBox="0 0 104 160"
        aria-hidden="true"
        className="absolute inset-y-0 -right-4 h-full w-[70%] overflow-hidden"
        preserveAspectRatio="xMaxYMid meet"
      >
        <defs>
          <linearGradient id={fadeId} x1={0} y1={0} x2={0} y2={160} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="white" stopOpacity={0} />
            <stop offset="0.2" stopColor="white" />
            <stop offset="0.8" stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity={0} />
          </linearGradient>
          <mask id={maskId} maskUnits="userSpaceOnUse" x={0} y={0} width={104} height={160}>
            <rect width={104} height={160} fill={`url(#${fadeId})`} />
          </mask>
        </defs>
        <g mask={`url(#${maskId})`}>
          <circle
            cx={center.x}
            cy={center.y}
            r={tickRadius + 5}
            fill="none"
            stroke="white"
            strokeOpacity={0.08}
            strokeWidth={16}
          />
          {[tickRadius - 4, tickRadius + 1, tickRadius + 14].map((radius) => (
            <circle
              key={radius}
              cx={center.x}
              cy={center.y}
              r={radius}
              fill="none"
              stroke="white"
              strokeOpacity={0.18}
              strokeWidth={0.6}
            />
          ))}
          <circle cx={center.x} cy={center.y} r={center.x - pointer.x} fill="none" stroke={accent} strokeWidth={0.6} />
          {ticks.map((tick) => (
            <g key={tick.index}>
              <line
                x1={tick.start.x}
                y1={tick.start.y}
                x2={tick.end.x}
                y2={tick.end.y}
                stroke="white"
                strokeOpacity={tick.opacity}
                strokeWidth={1}
                className="transition-[stroke-opacity] duration-300 motion-reduce:transition-none"
              />
              {tick.showLabel && (
                <text
                  x={tick.text.x}
                  y={tick.text.y}
                  transform={`rotate(${tick.rotation} ${tick.text.x} ${tick.text.y})`}
                  fill="white"
                  fillOpacity={0.8}
                  fontSize={9}
                  fontWeight={600}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {formatter.format(tick.value)}
                </text>
              )}
            </g>
          ))}
        </g>
        {value !== null && (
          <g>
            <path
              d={`M${pointer.x - 5} ${pointer.y - 5} L${pointer.x + 5} ${pointer.y} L${pointer.x - 5} ${pointer.y + 5} L${pointer.x - 2} ${pointer.y} Z`}
              fill={accent}
            />
            <line
              x1={center.x - tickRadius - tickWidth * 1.5}
              y1={center.y}
              x2={center.x - tickRadius}
              y2={center.y}
              stroke={accent}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>
    </div>
  );
}
