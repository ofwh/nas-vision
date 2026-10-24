import type { DailyWeather, MinuteWeather, WeatherValues } from './models';
import { convert, type UnitConfig } from './units';

export function createUnitConverter(units: UnitConfig) {
  const rate = units.precipitation === 'inch' ? 'inch_per_hour' : 'millimeter_per_hour';

  return {
    values: <T extends WeatherValues>(v: T): T => ({
      ...v,
      temperature: convert(v.temperature, units.temperature),
      apparentTemperature: convert(v.apparentTemperature, units.temperature),
      dewPoint: convert(v.dewPoint, units.temperature),
      pressure: convert(v.pressure, units.pressure),
      visibility: convert(v.visibility, units.visibility),
      windSpeed: convert(v.windSpeed, units.windSpeed),
      windGust: convert(v.windGust, units.windSpeed),
      precipitationAmount: convert(v.precipitationAmount, units.precipitation),
      precipitationIntensity: convert(v.precipitationIntensity, rate),
    }),
    daily: (v: DailyWeather): DailyWeather => ({
      ...v,
      low: convert(v.low, units.temperature),
      high: convert(v.high, units.temperature),
    }),
    minutely: (v: MinuteWeather): MinuteWeather => ({
      ...v,
      precipitationAmount: convert(v.precipitationAmount, units.precipitation),
      precipitationIntensity: convert(v.precipitationIntensity, rate),
    }),
  };
}
