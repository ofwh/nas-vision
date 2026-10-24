import type { AirQualityIndex } from '../lib';

const levels = [50, 100, 150, 200, 300] as const;
const levelColors = ['#22c55e', '#facc15', '#fb923c', '#ef4444', '#a855f7', '#d946ef'];
const colorStops = [
  { value: 0, color: [6, 182, 212] },
  { value: 50, color: [34, 197, 94] },
  { value: 100, color: [250, 204, 21] },
  { value: 150, color: [251, 146, 60] },
  { value: 200, color: [239, 68, 68] },
  { value: 300, color: [168, 85, 247] },
  { value: 500, color: [217, 70, 239] },
];

export function aqiColor(value: number) {
  const position = Math.min(500, Math.max(0, value));
  const end = colorStops.findIndex((stop) => stop.value >= position);
  const right = colorStops[Math.max(0, end)];
  const left = colorStops[Math.max(0, end - 1)];
  const ratio = right.value === left.value ? 0 : (position - left.value) / (right.value - left.value);
  const channels = left.color.map((channel, index) => Math.round(channel + (right.color[index] - channel) * ratio));

  return `rgb(${channels.join(' ')})`;
}

export function resolveAqi(indexes: AirQualityIndex[]) {
  const available = indexes.filter((index) => Number.isFinite(index.value) && index.value >= 0);
  const index =
    available.find((item) => item.scale === 'china') ??
    available.find((item) => item.scale === 'us') ??
    available[0] ??
    null;
  const supported = index && (index.scale === 'china' || index.scale === 'us');
  const level = supported ? levels.filter((maximum) => index.value > maximum).length : null;

  return {
    index,
    level,
    progress: supported ? Math.min(index.value / 500, 1) : null,
    color: level === null ? '#ffffff' : levelColors[level],
  };
}
