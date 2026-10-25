import { WeatherError } from './errors';

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type PressureUnit = 'pascal' | 'hectopascal';
export type WindSpeedUnit = 'meter_per_second' | 'kilometer_per_hour' | 'mile_per_hour';
export type VisibilityUnit = 'meter' | 'kilometer';
export type PrecipitationUnit = 'millimeter' | 'inch';
export type PrecipitationRateUnit = 'millimeter_per_hour' | 'inch_per_hour';
export type Unit =
  | TemperatureUnit
  | PressureUnit
  | WindSpeedUnit
  | VisibilityUnit
  | PrecipitationUnit
  | PrecipitationRateUnit
  | 'percent'
  | 'degree'
  | 'microgram_per_cubic_meter'
  | 'parts_per_billion'
  | 'parts_per_million';
export type Measurement<U extends Unit = Unit> = { value: number; unit: U };
export type UnitConfig = {
  temperature: TemperatureUnit;
  pressure: PressureUnit;
  windSpeed: WindSpeedUnit;
  visibility: VisibilityUnit;
  precipitation: PrecipitationUnit;
};
export const defaultUnits: Readonly<UnitConfig> = Object.freeze({
  temperature: 'celsius',
  pressure: 'hectopascal',
  windSpeed: 'kilometer_per_hour',
  visibility: 'kilometer',
  precipitation: 'millimeter',
});

export function measurement<U extends Unit>(value: number | null | undefined, unit: U): Measurement<U> | null {
  return typeof value === 'number' && Number.isFinite(value) ? { value, unit } : null;
}

const scales: Record<Unit, readonly [string, number, number]> = {
  celsius: ['temperature', 1, 0],
  fahrenheit: ['temperature', 5 / 9, (-32 * 5) / 9],
  pascal: ['pressure', 1, 0],
  hectopascal: ['pressure', 100, 0],
  meter_per_second: ['speed', 1, 0],
  kilometer_per_hour: ['speed', 1 / 3.6, 0],
  mile_per_hour: ['speed', 0.44704, 0],
  meter: ['visibility', 1, 0],
  kilometer: ['visibility', 1000, 0],
  millimeter: ['precipitation', 1, 0],
  inch: ['precipitation', 25.4, 0],
  millimeter_per_hour: ['rate', 1, 0],
  inch_per_hour: ['rate', 25.4, 0],
  percent: ['percent', 1, 0],
  degree: ['direction', 1, 0],
  microgram_per_cubic_meter: ['mass', 1, 0],
  parts_per_billion: ['ratio', 1, 0],
  parts_per_million: ['ratio', 1000, 0],
};

export function convert<U extends Unit>(input: Measurement | null, unit: U): Measurement<U> | null {
  if (!input) {
    return null;
  }

  const from = scales[input.unit],
    to = scales[unit];

  if (!from || !to || from[0] !== to[0]) {
    throw new WeatherError('invalid_argument');
  }

  return { value: (input.value * from[1] + from[2] - to[2]) / to[1], unit };
}

export function resolveUnits(config: Partial<UnitConfig> = {}): UnitConfig {
  const units = { ...defaultUnits, ...config };

  for (const key of Object.keys(defaultUnits) as (keyof UnitConfig)[]) {
    if (!scales[units[key]] || scales[units[key]][0] !== scales[defaultUnits[key]][0]) {
      throw new WeatherError('invalid_config');
    }
  }

  return units;
}
