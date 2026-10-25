'use client';

const center = { x: 100, y: 88 };
const ticks = Array.from({ length: 61 }, (_, index) => {
  const angle = ((135 + index * 4.5) * Math.PI) / 180;

  return {
    ratio: index / 60,
    x1: center.x + 59 * Math.cos(angle),
    y1: center.y + 59 * Math.sin(angle),
    x2: center.x + 77 * Math.cos(angle),
    y2: center.y + 77 * Math.sin(angle),
  };
});

export function PressureGauge({
  progress,
  display,
  unit,
  label,
}: {
  progress: number | null;
  display: string;
  unit: string;
  label: string;
}) {
  const rotation = progress === null ? 0 : -135 + progress * 270;

  return (
    <svg viewBox="18 6 164 142" role="img" aria-label={label} className="h-0 min-h-0 w-full flex-1">
      {ticks.map(({ ratio, ...tick }) => (
        <line
          key={ratio}
          {...tick}
          stroke="white"
          strokeOpacity={progress !== null && ratio <= progress ? ratio * 0.9 : 0.1}
          strokeWidth={2.5}
          className="transition-[stroke-opacity] duration-300 motion-reduce:transition-none"
        />
      ))}
      {progress !== null && (
        <g transform={`rotate(${rotation} ${center.x} ${center.y})`}>
          <line x1={100} y1={10} x2={100} y2={32} stroke="white" strokeWidth={5} strokeLinecap="round" />
          <path
            d="M100 64 V45 M93 52 L100 45 L107 52"
            fill="none"
            stroke="white"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}
      <text
        x={100}
        y={94}
        fill="white"
        fontSize={27}
        fontWeight={600}
        textAnchor="middle"
        dominantBaseline="middle"
        className="tabular-nums"
      >
        {display}
      </text>
      <text x={100} y={118} fill="white" fillOpacity={0.6} fontSize={11} textAnchor="middle">
        {unit}
      </text>
    </svg>
  );
}
