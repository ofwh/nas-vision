import type { MinuteWeather, PrecipitationRateUnit } from '../lib';
import { convert } from '../lib/units';

export function resolveMinuteRain(items: MinuteWeather[]) {
  const sorted = [...items]
    .filter((item) => Number.isFinite(Date.parse(item.time)) && item.intervalMinutes > 0)
    .sort((a, b) => Date.parse(a.time) - Date.parse(b.time));
  const unit: PrecipitationRateUnit = sorted.some(
    (item) => item.precipitationIntensity?.unit === 'inch_per_hour' || item.precipitationAmount?.unit === 'inch',
  )
    ? 'inch_per_hour'
    : 'millimeter_per_hour';
  const start = sorted[0] ? Date.parse(sorted[0].time) : 0;
  const points = sorted.flatMap((item) => {
    const time = Date.parse(item.time);
    const minute = (time - start) / 60000;
    const amount = item.precipitationAmount;
    const intensity =
      item.precipitationIntensity ??
      (amount
        ? {
            value: (amount.value * 60) / item.intervalMinutes,
            unit: amount.unit === 'inch' ? ('inch_per_hour' as const) : ('millimeter_per_hour' as const),
          }
        : null);
    const value = convert(intensity, unit)?.value;

    return minute < 120
      ? [
          {
            time,
            minute,
            intensity: typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null,
          },
        ]
      : [];
  });

  return { points, unit: unit === 'inch_per_hour' ? 'in/h' : 'mm/h' };
}
