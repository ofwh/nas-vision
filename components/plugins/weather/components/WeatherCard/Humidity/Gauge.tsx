'use client';

const ticks = Array.from({ length: 61 }, (_, index) => {
  const ratio = index / 60;
  const angle = ((120 + ratio * 300) * Math.PI) / 180;
  const inner = index % 5 === 0 ? 60 : 64;

  return {
    ratio,
    x1: 100 + inner * Math.cos(angle),
    y1: 100 + inner * Math.sin(angle),
    x2: 100 + 76 * Math.cos(angle),
    y2: 100 + 76 * Math.sin(angle),
    color: `color-mix(in srgb, var(--color-amber-200) ${100 - ratio * 100}%, var(--color-sky-300))`,
  };
});

export function HumidityGauge({ value, display, label }: { value: number | null; display: string; label: string }) {
  return (
    <svg viewBox="16 16 168 168" role="img" aria-label={label} className="min-h-0 w-full flex-1">
      {ticks.map((tick) => (
        <line
          key={tick.ratio}
          x1={tick.x1}
          y1={tick.y1}
          x2={tick.x2}
          y2={tick.y2}
          stroke={tick.color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeOpacity={value !== null && tick.ratio <= value / 100 ? 1 : 0.2}
          className="transition-[stroke-opacity] duration-300 motion-reduce:transition-none"
        />
      ))}
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
        {value !== null && <tspan fontSize={20}>%</tspan>}
      </text>
    </svg>
  );
}
